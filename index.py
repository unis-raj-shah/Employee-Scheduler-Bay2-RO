#!/usr/bin/env python3
"""
Vercel entry point for the Warehouse Scheduler Dashboard
This file serves as the main entry point for Vercel deployment
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app from main.py
from main import app

# Export the app for Vercel
handler = app
