import csv
import os
from dotenv import load_dotenv
from notion_client import Client

# .envファイルを読み込む
load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

target_csv = "visitors/expo_visitors.csv"

notion = Client(auth=NOTION_TOKEN)

def read_csv(filename):
    with open(filename, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

def create_page(row):
    properties = {
        "title": {
            "title": [
                {"text": {"content": row["title"]}}
            ]
        },
        "date": {
            "date": {"start": row["date"]}
        },
        "visitors": {
            "number": int(row["visitors"])
        },
        "visitors_with_passes": {
            "number": int(row["visitors_with_passes"])
        }
        # 必要に応じて他のカラムも追加
    }
    notion.pages.create(parent={"database_id": DATABASE_ID}, properties=properties)

def get_existing_dates():
    existing_dates = set()
    query = {
        "database_id": DATABASE_ID,
        "page_size": 100,
    }
    while True:
        response = notion.databases.query(**query)
        for result in response["results"]:
            date_property = result["properties"].get("date", {})
            if date_property and date_property.get("date"):
                existing_dates.add(date_property["date"]["start"])
        if response.get("has_more"):
            query["start_cursor"] = response["next_cursor"]
        else:
            break
    return existing_dates

def main():
    rows = read_csv(target_csv)
    existing_dates = get_existing_dates()
    for row in rows:
        if row["date"] not in existing_dates:
            create_page(row)
            print(f"Added: {row['date']}")
        else:
            print(f"Skipped (already exists): {row['date']}")

if __name__ == "__main__":
    main()