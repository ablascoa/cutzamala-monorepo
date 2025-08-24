"""PDF processor module for extracting data from Cutzamala system reports."""

import os
import re
import glob
import pandas as pd
from datetime import datetime
import pdfplumber
from typing import Dict, List, Optional, Union


class PDFProcessor:
    """Processes PDF files to extract Cutzamala system data."""
    
    MONTHS_MAP = {
        'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
        'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
        'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
    }
    
    def __init__(self, pdf_dir: str = "pdfs", output_csv: str = "cutzamala_consolidated.csv"):
        self.pdf_dir = pdf_dir
        self.output_csv = output_csv
        self.error_report = "cutzamala_error_report.txt"
        
    def extract_cutzamala_data(self, pdf_path: str) -> Dict:
        """Extract data from a Cutzamala system report PDF."""
        with pdfplumber.open(pdf_path) as pdf:
            first_page = pdf.pages[0]
            text = first_page.extract_text()

            # Extract year and month from title
            year_match = re.search(r'CUTZAMALA (\d{4})', text)
            year = year_match.group(1) if year_match else None

            month_match = re.search(
                r'(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)', text)
            month_name = month_match.group(1) if month_match else None
            month_num = self.MONTHS_MAP.get(month_name) if month_name else None

            # Extract table using pdfplumber
            tables = first_page.extract_tables()

            if not tables:
                raise ValueError("No tables found in PDF")

            # Find main table (usually the largest one)
            main_table = max(tables, key=len)

            # Process data
            datos = []

            for row in main_table:
                if not row or not row[0]:
                    continue

                # Check if it's a data row (starts with day number)
                try:
                    dia = int(row[0])
                    if dia < 1 or dia > 31:
                        continue
                except (ValueError, TypeError):
                    continue

                try:
                    # Extract data according to table structure
                    valle_bravo_mm3 = float(row[1]) if row[1] and str(row[1]) != '0.0' and row[1] != '' else 0.0
                    valle_bravo_pct = float(row[2]) if row[2] and str(row[2]) != '0.0' and row[2] != '' else 0.0
                    valle_bravo_lluvia = float(row[3]) if row[3] and str(row[3]) != '0.0' and row[3] != '' else 0.0

                    villa_victoria_mm3 = float(row[4]) if row[4] and str(row[4]) != '0.0' and row[4] != '' else 0.0
                    villa_victoria_pct = float(row[5]) if row[5] and str(row[5]) != '0.0' and row[5] != '' else 0.0
                    villa_victoria_lluvia = float(row[6]) if row[6] and str(row[6]) != '0.0' and row[6] != '' else 0.0

                    el_bosque_mm3 = float(row[7]) if row[7] and str(row[7]) != '0.0' and row[7] != '' else 0.0
                    el_bosque_pct = float(row[8]) if row[8] and str(row[8]) != '0.0' and row[8] != '' else 0.0
                    el_bosque_lluvia = float(row[9]) if row[9] and str(row[9]) != '0.0' and row[9] != '' else 0.0

                    # Total in m3 (convert from string with commas to number)
                    total_str = str(row[10]) if len(row) > 10 and row[10] else "0"
                    total_clean = re.sub(r'[^\d]', '', total_str)
                    total_mm3 = int(total_clean) if total_clean and total_clean != '0' else 0

                    total_pct = float(row[11]) if len(row) > 11 and row[11] and str(row[11]) != '0.0' and row[11] != '' else 0.0

                    datos.append({
                        "dia": dia,
                        "valle_bravo_mm3": valle_bravo_mm3,
                        "valle_bravo_pct": valle_bravo_pct,
                        "valle_bravo_lluvia": valle_bravo_lluvia,
                        "villa_victoria_mm3": villa_victoria_mm3,
                        "villa_victoria_pct": villa_victoria_pct,
                        "villa_victoria_lluvia": villa_victoria_lluvia,
                        "el_bosque_mm3": el_bosque_mm3,
                        "el_bosque_pct": el_bosque_pct,
                        "el_bosque_lluvia": el_bosque_lluvia,
                        "total_mm3": total_mm3,
                        "total_pct": total_pct
                    })

                except (ValueError, IndexError) as e:
                    dia_val = row[0] if row and len(row) > 0 else "?"
                    print(f"Error processing row day {dia_val}: {e}")
                    continue

        return {
            "month": str(month_num) if month_num else "0",
            "month_name": month_name if month_name else "UNKNOWN",
            "year": year if year else "0000",
            "datos": datos
        }

    def extract_with_regex_fallback(self, pdf_path: str) -> Dict:
        """Alternative method using regex to extract data if table extraction fails."""
        with pdfplumber.open(pdf_path) as pdf:
            first_page = pdf.pages[0]
            text = first_page.extract_text()

            # Extract year and month
            year_match = re.search(r'CUTZAMALA (\d{4})', text)
            year = year_match.group(1) if year_match else None

            month_match = re.search(
                r'(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)', text)
            month_name = month_match.group(1) if month_match else None
            month_num = self.MONTHS_MAP.get(month_name) if month_name else None

            # More flexible regex pattern for data rows
            lines = text.split('\n')
            datos = []

            for line in lines:
                pattern = r'^(\d{1,2})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)'
                match = re.match(pattern, line.strip())

                if match:
                    try:
                        dia = int(match.group(1))
                        if dia < 1 or dia > 31:
                            continue

                        datos.append({
                            "dia": dia,
                            "valle_bravo_mm3": float(match.group(2)),
                            "valle_bravo_pct": float(match.group(3)),
                            "valle_bravo_lluvia": float(match.group(4)),
                            "villa_victoria_mm3": float(match.group(5)),
                            "villa_victoria_pct": float(match.group(6)),
                            "villa_victoria_lluvia": float(match.group(7)),
                            "el_bosque_mm3": float(match.group(8)),
                            "el_bosque_pct": float(match.group(9)),
                            "el_bosque_lluvia": float(match.group(10)),
                            "total_mm3": int(match.group(11).replace(',', '').replace('.', '')),
                            "total_pct": float(match.group(12))
                        })
                    except (ValueError, IndexError) as e:
                        print(f"Error processing regex line day {dia}: {e}")
                        continue

            return {
                "month": str(month_num) if month_num else "0",
                "month_name": month_name if month_name else "UNKNOWN",
                "year": year if year else "0000",
                "datos": datos
            }

    def process_single_pdf(self, pdf_path: str) -> Dict:
        """Process a single PDF and return extracted data or None if error."""
        try:
            result = self.extract_cutzamala_data(pdf_path)
            if not result["datos"]:
                print(f"  Trying regex extraction for {os.path.basename(pdf_path)}...")
                result = self.extract_with_regex_fallback(pdf_path)
            return result
        except Exception as e:
            return {"error": str(e)}

    def get_pdf_files(self) -> List[str]:
        """Get list of PDF files in the directory."""
        if not os.path.exists(self.pdf_dir):
            raise FileNotFoundError(f"Directory '{self.pdf_dir}' does not exist")
        
        pdf_files = glob.glob(os.path.join(self.pdf_dir, "*.pdf"))
        if not pdf_files:
            raise FileNotFoundError(f"No PDF files found in directory '{self.pdf_dir}'")
        
        return sorted(pdf_files)

    def process_all_pdfs(self, process_first_only: bool = False) -> None:
        """Process all PDFs and consolidate into CSV."""
        print(f"📁 Processing directory: {self.pdf_dir}")
        pdf_files = self.get_pdf_files()
        
        pdfs_to_process = [pdf_files[0]] if process_first_only else pdf_files
        
        if process_first_only:
            print(f"📄 Processing only first PDF found: {os.path.basename(pdfs_to_process[0])}")
        else:
            print(f"📄 Processing {len(pdfs_to_process)} PDF files")

        all_rows = []
        errors = []

        # Process each PDF
        for i, pdf_path in enumerate(pdfs_to_process, 1):
            print(f"\n[{i}/{len(pdfs_to_process)}] Processing: {os.path.basename(pdf_path)}")

            try:
                result = self.process_single_pdf(pdf_path)

                if "error" in result:
                    err = f"{os.path.basename(pdf_path)}: {result['error']}"
                    errors.append(err)
                    print(f"  ❌ Error: {result['error']}")
                    continue

                if result and result.get("datos"):
                    year = result.get("year", "0000")
                    month = result.get("month", "0")
                    month_name = result.get("month_name", "UNKNOWN")

                    # Add metadata to each row
                    for row in result["datos"]:
                        try:
                            day = int(row["dia"])
                            date_str = f"{year}-{int(month):02d}-{day:02d}"
                        except Exception:
                            date_str = ""

                        row["date"] = date_str
                        row["month"] = month
                        row["month_name"] = month_name
                        row["year"] = year
                        row["source_pdf"] = os.path.basename(pdf_path)
                        all_rows.append(row)

                    print(f"  ✅ Extracted {len(result['datos'])} days for {month_name} {year}")
                else:
                    err = f"{os.path.basename(pdf_path)}: No data extracted"
                    errors.append(err)
                    print(f"  ❌ Error: No data extracted")

            except Exception as e:
                err = f"{os.path.basename(pdf_path)}: {str(e)}"
                errors.append(err)
                print(f"  ❌ Unexpected error: {str(e)}")

        # Save results
        self._save_results(all_rows, errors, pdfs_to_process)

    def _save_results(self, all_rows: List[Dict], errors: List[str], pdfs_to_process: List[str]) -> None:
        """Save consolidated results and error report."""
        if all_rows:
            df = pd.DataFrame(all_rows)

            # Reorder columns so 'date' is first
            cols = ["date", "year", "month", "month_name", "dia"] + \
                [c for c in df.columns if c not in ["date", "year", "month", "month_name", "dia"]]
            df = df[cols]

            # Sort by date
            df = df.sort_values(['year', 'month', 'dia'])

            df.to_csv(self.output_csv, index=False)
            print(f"\n📊 Consolidated data saved to: {self.output_csv} ({len(df)} rows)")
            print(f"📅 Period: {df['date'].min()} to {df['date'].max()}")
        else:
            print("\n❌ No information extracted from any PDF.")

        # Save error report if there are errors
        if errors:
            with open(self.error_report, "w", encoding="utf-8") as f:
                f.write("Errors found while processing PDFs:\n\n")
                for err in errors:
                    f.write(f"- {err}\n")
            print(f"\n⚠️  Error report saved to: {self.error_report}")
        else:
            print("\n✅ No errors found in processed PDFs.")

        print(f"\n🎉 Process completed. Files processed: {len(pdfs_to_process) - len(errors)}/{len(pdfs_to_process)}")


def main():
    """Main function for standalone execution."""
    print("What would you like to process?")
    print("1. All PDFs")
    print("2. Only the first PDF found")
    option = input("Select an option (1/2): ").strip()

    process_first_only = option == "2"
    processor = PDFProcessor()
    
    try:
        processor.process_all_pdfs(process_first_only)
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()