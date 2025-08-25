#!/usr/bin/env python3
"""
Setup verification script for Railway deployment.

This script verifies that all components are working correctly
before deploying to Railway.
"""

import os
import sys
import requests
from datetime import date

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

def test_database_connection():
    """Test database connection and basic operations."""
    try:
        from src.api.services.database_service import DatabaseDataService
        
        db_service = DatabaseDataService()
        
        # Test connection
        count = db_service.get_record_count()
        print(f"✅ Database connection: {count} records found")
        
        # Test date range
        min_date, max_date = db_service.get_date_range()
        if min_date and max_date:
            print(f"✅ Date range: {min_date} to {max_date}")
        else:
            print("⚠️  Date range: No data found")
        
        # Test reservoirs
        reservoirs = db_service.get_available_reservoirs()
        print(f"✅ Available reservoirs: {len(reservoirs)} ({', '.join(reservoirs)})")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def test_pdf_components():
    """Test PDF downloader and processor components."""
    try:
        from src.cutzamala.downloaders.pdf_downloader import PDFDownloader
        from src.cutzamala.processors.pdf_processor import PDFProcessor
        
        # Test downloader initialization
        downloader = PDFDownloader()
        print(f"✅ PDF Downloader initialized with URL: {downloader.url[:50]}...")
        
        # Test processor initialization
        processor = PDFProcessor()
        print(f"✅ PDF Processor initialized with directory: {processor.pdf_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ PDF components failed: {e}")
        return False


def test_api_configuration():
    """Test API configuration and settings."""
    try:
        from src.api.config import settings
        
        print(f"✅ Database URL configured: {str(settings.DATABASE_URL)[:30]}...")
        print(f"✅ SQLite mode: {settings.USE_SQLITE}")
        print(f"✅ CORS origins: {settings.CORS_ORIGINS}")
        print(f"✅ Log level: {settings.LOG_LEVEL}")
        
        return True
        
    except Exception as e:
        print(f"❌ API configuration failed: {e}")
        return False


def test_railway_files():
    """Test that Railway configuration files exist."""
    required_files = [
        'railway.toml',
        'nixpacks.toml', 
        'requirements.txt',
        'daily_task.py'
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            missing_files.append(file)
    
    return len(missing_files) == 0


def test_environment_variables():
    """Test required environment variables."""
    required_vars = ['DATABASE_URL']
    optional_vars = ['PORT', 'USE_SQLITE', 'CORS_ORIGINS']
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var} is set: {value[:30]}...")
        else:
            print(f"❌ {var} is not set")
            return False
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var} is set: {value}")
        else:
            print(f"ℹ️  {var} not set (will use default)")
    
    return True


def main():
    """Run all verification tests."""
    print("🔍 Verifying Railway deployment setup...\n")
    
    tests = [
        ("Environment Variables", test_environment_variables),
        ("Railway Configuration Files", test_railway_files),
        ("API Configuration", test_api_configuration),
        ("Database Connection", test_database_connection),
        ("PDF Components", test_pdf_components),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n📋 Testing {test_name}:")
        try:
            if test_func():
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
                failed += 1
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
            failed += 1
    
    print(f"\n{'='*50}")
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Ready for Railway deployment.")
        print("\nNext steps:")
        print("1. git add . && git commit -m 'Add Railway deployment setup'")
        print("2. git push origin main")
        print("3. Create Railway project from GitHub repo")
        print("4. Add PostgreSQL database in Railway")
        print("5. Configure environment variables in Railway")
        return 0
    else:
        print("⚠️  Some tests failed. Please fix issues before deploying.")
        return 1


if __name__ == "__main__":
    sys.exit(main())