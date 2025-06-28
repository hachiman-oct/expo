import requests
from bs4 import BeautifulSoup
import csv
from normalize_date import normalize_date
import os

def extract_visitor_table(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to load URL: {url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    h2_tags = soup.select("h2")

    for h2 in h2_tags:
        if "Number of visitors in the previous week" in h2.get_text():
            sibling = h2.find_next_sibling()
            if sibling:
                table = sibling.find("table")
                if table:
                    print("Found matching section with table.")
                    return parse_html_table(table)

    print("No matching section found.")
    return []

def parse_html_table(table):
    rows = table.select("tbody tr")
    if not rows:
        print("No table rows found.")
        return []

    # 最初の行をヘッダーとする
    headers = [cell.get_text(strip=True) for cell in rows[0].find_all(["th", "td"])]

    data_rows = []
    for tr in rows[1:]:
        cells = [cell.get_text(strip=True) for cell in tr.find_all("td")]
        if len(cells) != len(headers):
            print(f"Skipping row (column count mismatch): {cells}")
            continue
        data_rows.append(dict(zip(headers, cells)))

    return data_rows


def save_to_csv(data, filename):
    if not data:
        print("No data to save.")
        return None

    first_column = list(data[0].keys())[0]
    visitors_col = "Number of visitors(including Accreditation Pass holders)"
    visitors_with_passes_col = "Number of visitors admittedwith Accreditation Passes"

    # 既存CSVから既存の日付を取得
    existing_dates = set()
    if os.path.isfile(filename):
        with open(filename, mode="r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if "date" in row:
                    existing_dates.add(row["date"])

    cleaned_data = []
    for idx, row in enumerate(data, 1):
        label = row[first_column].strip().lower()
        if label == "total":
            continue  # Total行をスキップ

        # 日付を正規化し、列名をdateに変更
        new_row = row.copy()
        new_row["date"] = normalize_date(new_row.pop(first_column))
        # visitors列名を変換
        if visitors_col in new_row:
            val = new_row.pop(visitors_col)
            new_row["visitors"] = str(int(val.replace(",", ""))) if val.replace(",", "").isdigit() else val
        if visitors_with_passes_col in new_row:
            val = new_row.pop(visitors_with_passes_col)
            new_row["visitors_with_passes"] = str(int(val.replace(",", ""))) if val.replace(",", "").isdigit() else val
        # title列は常に'title'という文字列
        new_row = {"title": "title", **new_row}
        # 既存の日付ならスキップ
        if new_row["date"] in existing_dates:
            print(f"date {new_row['date']} already written.")
            return "already_written"
        cleaned_data.append(new_row)

    if not cleaned_data:
        print("No valid data rows after removing 'Total' or all dates already written.")
        return None

    # ヘッダーの順序をtitle, date, visitors, visitors_with_passes, その他の順に
    fieldnames = list(cleaned_data[0].keys())
    for col in ["title", "date", "visitors", "visitors_with_passes"]:
        if col in fieldnames:
            fieldnames.remove(col)
    fieldnames = ["title", "date", "visitors", "visitors_with_passes"] + fieldnames

    file_exists = os.path.isfile(filename)
    mode = "a" if file_exists else "w"
    with open(filename, mode=mode, encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerows(cleaned_data)

    print(f"Saved {len(cleaned_data)} rows to {filename}")
    return "written"