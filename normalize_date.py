from datetime import datetime

def normalize_date(date_str, year=2025):
    """
    例: "8 June Sun" → "2025-06-08"
    """
    try:
        parts = date_str.strip().split()
        if len(parts) < 2:
            return date_str  # フォーマットが違う場合そのまま

        day = parts[0]
        month = parts[1]
        # "8 June Sun" → "8 June 2025"
        dt = datetime.strptime(f"{day} {month} {year}", "%d %B %Y")
        return dt.strftime("%Y-%m-%d")
    except Exception as e:
        print(f"Failed to parse date: '{date_str}' → {e}")
        return date_str