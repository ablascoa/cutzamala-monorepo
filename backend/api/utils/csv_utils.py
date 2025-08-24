import pandas as pd
from typing import List, Dict
from io import StringIO


def format_data_as_csv(data: List[Dict]) -> str:
    if not data:
        return ""
    
    df = pd.DataFrame(data)
    return df.to_csv(index=False)


def create_csv_response_content(data: List[Dict], filename: str = "cutzamala_data.csv") -> tuple[str, Dict[str, str]]:
    csv_content = format_data_as_csv(data)
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "text/csv"
    }
    return csv_content, headers