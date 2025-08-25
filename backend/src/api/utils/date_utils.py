from datetime import date, datetime
import pandas as pd
from typing import Optional


def parse_date_string(date_str: str) -> Optional[date]:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def get_week_start_end(dt: date) -> tuple[date, date]:
    days_since_sunday = dt.weekday() + 1
    if days_since_sunday == 7:
        days_since_sunday = 0
    week_start = dt - pd.Timedelta(days=days_since_sunday)
    week_end = week_start + pd.Timedelta(days=6)
    return week_start.date(), week_end.date()


def get_month_name(month_num: int) -> str:
    months = {
        1: "January", 2: "February", 3: "March", 4: "April",
        5: "May", 6: "June", 7: "July", 8: "August",
        9: "September", 10: "October", 11: "November", 12: "December"
    }
    return months.get(month_num, "Unknown")