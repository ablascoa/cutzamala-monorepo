#!/usr/bin/env python3
"""
Daily scheduled task for PDF processing.

This script runs once daily to:
1. Download new PDFs from CONAGUA website
2. Process PDFs to extract water storage data
3. Save new records to PostgreSQL database
4. Clean up temporary files
"""

import os
import sys
import logging
from datetime import datetime
from typing import List, Dict

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from src.cutzamala.downloaders.pdf_downloader import PDFDownloader
from src.cutzamala.processors.pdf_processor import PDFProcessor
from src.api.services.database_service import DatabaseDataService
from src.api.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def download_latest_pdfs() -> List[str]:
    """Download latest PDFs from CONAGUA website."""
    try:
        downloader = PDFDownloader()
        downloader.ensure_download_dir()
        
        # Get existing PDF files to avoid redownloading
        existing_files = set()
        if os.path.exists(downloader.download_dir):
            existing_files = {f for f in os.listdir(downloader.download_dir) if f.endswith('.pdf')}
        
        # Find and download new PDF links
        pdf_links = downloader.find_pdf_links()
        new_files = []
        
        for link in pdf_links:
            filename = os.path.basename(link)
            if filename not in existing_files:
                try:
                    filepath = downloader.download_pdf(link)
                    if filepath:
                        new_files.append(filepath)
                        logger.info(f"Downloaded: {filename}")
                except Exception as e:
                    logger.error(f"Failed to download {filename}: {e}")
        
        logger.info(f"Downloaded {len(new_files)} new PDF files")
        return new_files
        
    except Exception as e:
        logger.error(f"Error downloading PDFs: {e}")
        return []


def process_pdfs(pdf_files: List[str]) -> List[Dict]:
    """Process PDF files to extract water storage data."""
    if not pdf_files:
        return []
    
    try:
        processor = PDFProcessor()
        all_data = []
        
        for pdf_file in pdf_files:
            try:
                logger.info(f"Processing: {os.path.basename(pdf_file)}")
                data = processor.extract_cutzamala_data(pdf_file)
                
                if data:
                    all_data.append(data)
                    logger.info(f"Extracted data from {os.path.basename(pdf_file)}")
                else:
                    logger.warning(f"No data extracted from {os.path.basename(pdf_file)}")
                    
            except Exception as e:
                logger.error(f"Failed to process {pdf_file}: {e}")
        
        logger.info(f"Successfully processed {len(all_data)} PDF files")
        return all_data
        
    except Exception as e:
        logger.error(f"Error processing PDFs: {e}")
        return []


def save_to_database(data_records: List[Dict]) -> int:
    """Save extracted data to PostgreSQL database."""
    if not data_records:
        return 0
    
    try:
        db_service = DatabaseDataService()
        saved_count = 0
        new_records = []
        
        for record in data_records:
            try:
                # Check if record already exists (by date)
                record_date = record.get('date')
                if not record_date:
                    logger.warning("Record missing date field, skipping")
                    continue
                    
                existing = db_service.get_filtered_data(
                    start_date=record_date,
                    end_date=record_date,
                    limit=1
                )
                
                if not existing:
                    new_records.append(record)
                    logger.info(f"Will save new record for date: {record_date}")
                else:
                    logger.info(f"Record already exists for date: {record_date}")
                    
            except Exception as e:
                logger.error(f"Failed to check existing record: {e}")
        
        # Bulk insert new records
        if new_records:
            saved_count = db_service.bulk_insert_records(new_records)
            logger.info(f"Saved {saved_count} new records to database")
        else:
            logger.info("No new records to save")
        
        return saved_count
        
    except Exception as e:
        logger.error(f"Error saving to database: {e}")
        return 0


def cleanup_temp_files():
    """Clean up old temporary files to save space."""
    try:
        # Keep only last 30 days of PDFs to save space
        pdf_dir = "pdfs"
        if os.path.exists(pdf_dir):
            files = os.listdir(pdf_dir)
            if len(files) > 100:  # If too many files, clean up oldest
                files_with_time = []
                for f in files:
                    filepath = os.path.join(pdf_dir, f)
                    if os.path.isfile(filepath):
                        files_with_time.append((filepath, os.path.getmtime(filepath)))
                
                # Sort by modification time and keep only newest 90 files
                files_with_time.sort(key=lambda x: x[1], reverse=True)
                files_to_remove = files_with_time[90:]
                
                for filepath, _ in files_to_remove:
                    try:
                        os.remove(filepath)
                        logger.info(f"Removed old file: {os.path.basename(filepath)}")
                    except Exception as e:
                        logger.error(f"Failed to remove {filepath}: {e}")
                        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")


def main():
    """Main daily task execution."""
    start_time = datetime.now()
    logger.info("=" * 50)
    logger.info(f"Starting daily PDF processing task at {start_time}")
    logger.info(f"Database URL: {settings.DATABASE_URL[:30]}...")
    
    try:
        # Step 1: Download latest PDFs
        logger.info("Step 1: Downloading latest PDFs")
        new_pdf_files = download_latest_pdfs()
        
        if not new_pdf_files:
            logger.info("No new PDF files to process")
            return 0
        
        # Step 2: Process PDFs
        logger.info("Step 2: Processing PDF files")
        data_records = process_pdfs(new_pdf_files)
        
        if not data_records:
            logger.warning("No data extracted from PDF files")
            return 0
        
        # Step 3: Save to database
        logger.info("Step 3: Saving data to database")
        saved_count = save_to_database(data_records)
        
        # Step 4: Cleanup
        logger.info("Step 4: Cleaning up temporary files")
        cleanup_temp_files()
        
        # Task summary
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info("=" * 50)
        logger.info(f"Daily task completed successfully!")
        logger.info(f"Duration: {duration.total_seconds():.1f} seconds")
        logger.info(f"New PDF files: {len(new_pdf_files)}")
        logger.info(f"Data records processed: {len(data_records)}")
        logger.info(f"Records saved to database: {saved_count}")
        logger.info("=" * 50)
        
        # Exit with success code for Railway cron
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Daily task failed with error: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Exit with error code for Railway cron
        sys.exit(1)


if __name__ == "__main__":
    main()