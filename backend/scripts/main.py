#!/usr/bin/env python3
"""
CLI entry point for Cutzamala data processing.

This script provides multiple ways to run the Cutzamala data processing tools:
- Interactive CLI mode (default)
- Direct download mode
- Direct consolidation mode

Note: For running the API server, use ../main.py instead.
"""

import sys
import os
import argparse

# Add src to path to import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from cutzamala.cli.interactive import CutzamalaCLI
from cutzamala.downloaders.pdf_downloader import PDFDownloader
from cutzamala.processors.pdf_processor import PDFProcessor


def main():
    """Main entry point with command line argument parsing."""
    parser = argparse.ArgumentParser(
        description="Cutzamala data processing tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                    # Run interactive CLI
  python main.py --download         # Download PDFs only
  python main.py --consolidate      # Consolidate existing PDFs only
  python main.py --auto             # Download and consolidate automatically
  python main.py --consolidate --first-only  # Process only first PDF
        """
    )
    
    parser.add_argument(
        '--download', 
        action='store_true',
        help='Download PDFs from CONAGUA website'
    )
    
    parser.add_argument(
        '--consolidate',
        action='store_true', 
        help='Consolidate existing PDFs into CSV'
    )
    
    parser.add_argument(
        '--auto',
        action='store_true',
        help='Download PDFs and consolidate automatically'
    )
    
    parser.add_argument(
        '--first-only',
        action='store_true',
        help='Process only the first PDF found (for testing)'
    )
    
    parser.add_argument(
        '--pdf-dir',
        default='pdfs',
        help='Directory containing PDF files (default: pdfs)'
    )
    
    parser.add_argument(
        '--output',
        default='cutzamala_consolidated.csv',
        help='Output CSV file name (default: cutzamala_consolidated.csv)'
    )

    args = parser.parse_args()

    try:
        if args.download:
            print("🔄 Downloading PDFs from CONAGUA...")
            downloader = PDFDownloader(download_dir=args.pdf_dir)
            downloader.download_all()
            print("✅ Download completed successfully")
            
        elif args.consolidate:
            print("🔄 Consolidating PDFs...")
            processor = PDFProcessor(pdf_dir=args.pdf_dir, output_csv=args.output)
            processor.process_all_pdfs(process_first_only=args.first_only)
            print("✅ Consolidation completed successfully")
            
        elif args.auto:
            print("🔄 Running automatic download and consolidation...")
            
            # Download first
            print("\n📥 Step 1: Downloading PDFs...")
            downloader = PDFDownloader(download_dir=args.pdf_dir)
            downloader.download_all()
            
            # Then consolidate
            print("\n📊 Step 2: Consolidating PDFs...")
            processor = PDFProcessor(pdf_dir=args.pdf_dir, output_csv=args.output)
            processor.process_all_pdfs(process_first_only=args.first_only)
            
            print("✅ Automatic process completed successfully")
            
        else:
            # Default: run interactive CLI
            print("🚀 Starting interactive Cutzamala data processor...")
            cli = CutzamalaCLI()
            cli.run()
            
    except KeyboardInterrupt:
        print("\n\n👋 Process interrupted by user. Exiting...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()