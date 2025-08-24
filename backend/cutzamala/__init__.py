"""
Cutzamala data processing package.

This package provides tools for downloading and processing PDF reports
from the Cutzamala water system (CONAGUA).
"""

__version__ = "1.0.0"
__author__ = "Cutzamala Data Team"
__description__ = "Tools for processing Cutzamala water system data"

from .downloaders.pdf_downloader import PDFDownloader
from .processors.pdf_processor import PDFProcessor
from .cli.interactive import CutzamalaCLI

__all__ = ['PDFDownloader', 'PDFProcessor', 'CutzamalaCLI']