import requests
from bs4 import BeautifulSoup
from get_table import extract_visitor_table, save_to_csv
import sys

def find_visitors_links(max_pages=10):
    base_url = "https://www.expo2025.or.jp/en/news/category/information/page/{}/"
    target_text = 'Number of Visitors and Admission Ticket Sales Status'
    matched_links = []

    for page in range(1, max_pages + 1):
        url = base_url.format(page)
        print(f"Checking page {page}: {url}")
        
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to load page {page}")
            continue

        soup = BeautifulSoup(response.text, 'html.parser')
        news_items = soup.select(".news_item")

        for item in news_items:
            txt = item.select_one(".txt")
            if txt and txt.get_text(strip=True) == target_text:
                a_tag = item.select_one("a")
                if a_tag and a_tag.get("href"):
                    matched_links.append(a_tag["href"])
    
    return matched_links

# 実行例
links = find_visitors_links(max_pages=5)
for link in links:
    print(f"Found link: {link}")
    visitor_data = extract_visitor_table(link)
    result = save_to_csv(visitor_data, "expo_visitors.csv")
    if result == "already_written":
        print("already_written: 強制終了します")
        sys.exit()
