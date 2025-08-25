#!/usr/bin/env python3
"""
Main entry point for the Cutzamala API server.

This script serves the FastAPI application for the Cutzamala water storage data API.
"""

import sys
import os
import argparse
import uvicorn

sys.path.insert(0, os.path.dirname(__file__))

from src.api.app import app


def main():
    """Main entry point with command line argument parsing."""
    parser = argparse.ArgumentParser(
        description="Cutzamala Water Storage API Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                    # Run API server on default port 8000
  python main.py --port 3000       # Run API server on port 3000
  python main.py --host 0.0.0.0    # Run API server accessible from all interfaces
  python main.py --reload          # Run in development mode with auto-reload
        """
    )
    
    parser.add_argument(
        '--host',
        default='127.0.0.1',
        help='Host to bind the server (default: 127.0.0.1)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=int(os.getenv('PORT', 8000)),
        help='Port to bind the server (default: 8000, or PORT env var)'
    )
    
    parser.add_argument(
        '--reload',
        action='store_true',
        help='Enable auto-reload for development'
    )
    
    parser.add_argument(
        '--log-level',
        default='info',
        choices=['debug', 'info', 'warning', 'error', 'critical'],
        help='Set the logging level (default: info)'
    )

    args = parser.parse_args()

    print(f"🚀 Starting Cutzamala Water Storage API server...")
    print(f"📊 Data source: cutzamala_consolidated.csv")
    print(f"🌐 Server will be available at: http://{args.host}:{args.port}")
    print(f"📖 API documentation: http://{args.host}:{args.port}/docs")
    print(f"🔍 Health check: http://{args.host}:{args.port}/api/v1/health")

    try:
        uvicorn.run(
            "api.app:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level=args.log_level
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user. Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()