import csv
import os
from dotenv import load_dotenv
from notion_client import Client

# .envファイルを読み込む
load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATABASE_ID = os.getenv("DATABASE_ID")

target_csv = "expo_visitors.csv"

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

def main():
    rows = read_csv(target_csv)
    for row in rows:
        create_page(row)
        print(f"Added: {row['date']}")

if __name__ == "__main__":
    main()