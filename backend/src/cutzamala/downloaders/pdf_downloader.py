"""PDF downloader module for Cutzamala system reports."""

import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Set, Optional


class PDFDownloader:
    """Downloads PDF files from CONAGUA website."""
    
    def __init__(self, url: str = None, download_dir: str = "pdfs"):
        self.url = url or "https://www.gob.mx/conagua/acciones-y-programas/organismo-de-cuenca-aguas-del-valle-de-mexico"
        self.download_dir = download_dir
        
    def ensure_download_dir(self) -> None:
        """Create download directory if it doesn't exist."""
        os.makedirs(self.download_dir, exist_ok=True)
        
    def find_pdf_links(self) -> Set[str]:
        """Find all PDF links on the target webpage."""
        response = requests.get(self.url)
        soup = BeautifulSoup(response.content, "html.parser")
        
        pdf_links = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.lower().endswith(".pdf"):
                full_url = urljoin(self.url, href)
                pdf_links.add(full_url)
                
        return pdf_links
        
    def download_pdf(self, link: str) -> bool:
        """Download a single PDF file."""
        filename = os.path.join(self.download_dir, link.split("/")[-1])
        
        if os.path.exists(filename):
            print(f"Skipping {filename}, already exists.")
            return False
            
        print(f"Downloading {link} ...")
        try:
            response = requests.get(link)
            response.raise_for_status()
            
            with open(filename, "wb") as f:
                f.write(response.content)
            return True
        except requests.RequestException as e:
            print(f"Error downloading {link}: {e}")
            return False
            
    def download_all(self) -> None:
        """Download all PDF files from the target website."""
        self.ensure_download_dir()
        pdf_links = self.find_pdf_links()
        
        print(f"Found {len(pdf_links)} PDF files.")
        
        downloaded_count = 0
        for link in pdf_links:
            if self.download_pdf(link):
                downloaded_count += 1
                
        print(f"Download complete. Downloaded {downloaded_count} new files.")


def main():
    """Main function for standalone execution."""
    downloader = PDFDownloader()
    downloader.download_all()


if __name__ == "__main__":
    main()