"""Interactive CLI for Cutzamala data processing."""

import os
import sys
from typing import Callable

# Add src to path to import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from cutzamala.downloaders.pdf_downloader import PDFDownloader
from cutzamala.processors.pdf_processor import PDFProcessor


class CutzamalaCLI:
    """Interactive command-line interface for Cutzamala data processing."""
    
    def __init__(self):
        self.downloader = PDFDownloader()
        self.processor = PDFProcessor()
        
    def print_banner(self):
        """Display welcome banner."""
        print("=" * 60)
        print("    CUTZAMALA DATA PROCESSING - INTERACTIVE SCRIPT")
        print("=" * 60)
        print()

    def print_menu(self):
        """Display the main menu options."""
        print("Available options:")
        print("1. Download PDFs from CONAGUA")
        print("2. Consolidate existing PDFs into CSV")
        print("3. Download PDFs and consolidate automatically")
        print("4. Exit")
        print("-" * 40)

    def get_user_choice(self) -> int:
        """Get and validate user choice."""
        while True:
            try:
                choice = input("\nSelect an option (1-4): ").strip()
                if choice in ['1', '2', '3', '4']:
                    return int(choice)
                else:
                    print("❌ Invalid option. Please select 1, 2, 3, or 4.")
            except KeyboardInterrupt:
                print("\n\n👋 Exiting program...")
                sys.exit(0)

    def confirm_action(self, message: str) -> bool:
        """Ask for user confirmation."""
        while True:
            response = input(f"{message} (y/n): ").strip().lower()
            if response in ['y', 'yes', 's', 'si', 'sí']:
                return True
            elif response in ['n', 'no']:
                return False
            else:
                print("❌ Invalid response. Please answer 'y' or 'n'.")

    def execute_with_error_handling(self, func: Callable, description: str) -> bool:
        """Execute a function with error handling."""
        print(f"\n🔄 {description}...")
        print("-" * 40)
        
        try:
            func()
            print("-" * 40)
            print(f"✅ {description} completed successfully")
            return True
        except Exception as e:
            print("-" * 40)
            print(f"❌ Error during {description.lower()}: {str(e)}")
            return False

    def handle_download(self):
        """Handle PDF download option."""
        if self.confirm_action("Do you want to download PDFs from CONAGUA?"):
            success = self.execute_with_error_handling(
                self.downloader.download_all,
                "Downloading PDFs"
            )
            if success:
                print("\n📁 Check the 'pdfs' directory for downloaded files")
        input("\nPress Enter to continue...")

    def handle_consolidate(self):
        """Handle PDF consolidation option."""
        pdfs_dir = "pdfs"
        
        # Check if pdfs directory exists
        if not os.path.exists(pdfs_dir):
            print(f"\n❌ Error: Directory '{pdfs_dir}' does not exist")
            print("You need to download PDFs first (option 1)")
            input("\nPress Enter to continue...")
            return
            
        # Check if there are PDF files
        try:
            pdf_files = [f for f in os.listdir(pdfs_dir) if f.endswith('.pdf')]
            pdf_count = len(pdf_files)
        except OSError as e:
            print(f"\n❌ Error accessing directory '{pdfs_dir}': {e}")
            input("\nPress Enter to continue...")
            return
        
        if pdf_count == 0:
            print(f"\n❌ Error: No PDF files found in directory '{pdfs_dir}'")
            print("You need to download PDFs first (option 1)")
            input("\nPress Enter to continue...")
            return
        
        print(f"\n📊 Found {pdf_count} PDF files to process")
        if self.confirm_action("Do you want to consolidate PDFs into a CSV file?"):
            # Ask user about processing mode
            print("\nProcessing options:")
            print("1. Process all PDFs")
            print("2. Process only the first PDF (for testing)")
            
            while True:
                mode_choice = input("Select processing mode (1/2): ").strip()
                if mode_choice in ['1', '2']:
                    break
                print("❌ Invalid option. Please select 1 or 2.")
            
            process_first_only = mode_choice == '2'
            
            success = self.execute_with_error_handling(
                lambda: self.processor.process_all_pdfs(process_first_only),
                "Consolidating PDFs"
            )
            if success:
                print("\n📄 Check the files:")
                print("  - cutzamala_consolidated.csv (consolidated data)")
                print("  - cutzamala_error_report.txt (error report, if any)")
        input("\nPress Enter to continue...")

    def handle_automatic(self):
        """Handle automatic download and consolidation."""
        print("\n🚀 Automatic process: Download and consolidate")
        if self.confirm_action("Do you want to execute the complete process automatically?"):
            # First download
            print("\n" + "="*50)
            print("STEP 1/2: PDF DOWNLOAD")
            print("="*50)
            success1 = self.execute_with_error_handling(
                self.downloader.download_all,
                "Downloading PDFs"
            )
            
            if success1:
                # Then consolidate
                print("\n" + "="*50)
                print("STEP 2/2: CONSOLIDATION")
                print("="*50)
                success2 = self.execute_with_error_handling(
                    lambda: self.processor.process_all_pdfs(process_first_only=False),
                    "Consolidating PDFs"
                )
                
                if success2:
                    print("\n" + "="*50)
                    print("✅ COMPLETE PROCESS FINISHED")
                    print("="*50)
                    print("📁 Generated files:")
                    print("  - pdfs/ (directory with downloaded PDFs)")
                    print("  - cutzamala_consolidated.csv (consolidated data)")
                    print("  - cutzamala_error_report.txt (error report, if any)")
            else:
                print("\n❌ Process stopped due to download errors")
            
        input("\nPress Enter to continue...")

    def run(self):
        """Main interactive loop."""
        self.print_banner()
        
        while True:
            self.print_menu()
            choice = self.get_user_choice()
            
            if choice == 1:
                self.handle_download()
            elif choice == 2:
                self.handle_consolidate()
            elif choice == 3:
                self.handle_automatic()
            elif choice == 4:
                print("\n👋 Thank you for using the Cutzamala data processor!")
                print("See you later!")
                break
            
            print("\n" + "="*60 + "\n")


def main():
    """Main function for CLI execution."""
    try:
        cli = CutzamalaCLI()
        cli.run()
    except KeyboardInterrupt:
        print("\n\n👋 Exiting program...")
        sys.exit(0)


if __name__ == "__main__":
    main()