"""
Setup script for creating Clicker.app using py2app.

Usage:
    pip install py2app
    python setup.py py2app

This creates a standalone macOS application in the dist/ folder.
"""

from setuptools import setup

APP = ['clicker_server.py']
DATA_FILES = []
OPTIONS = {
    'argv_emulation': False,
    'packages': ['websockets', 'qrcode', 'PIL'],
    'includes': [
        'asyncio',
        'Quartz',
    ],
    'excludes': ['matplotlib', 'numpy', 'scipy', 'pandas', 'pynput', 'tkinter'],
    'plist': {
        'CFBundleName': 'Clicker',
        'CFBundleDisplayName': 'Clicker',
        'CFBundleIdentifier': 'com.screendoorstudio.clicker',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'NSHighResolutionCapable': True,
        'NSRequiresAquaSystemAppearance': False,  # Support dark mode
        'LSMinimumSystemVersion': '10.15',
        'NSAppleEventsUsageDescription': 'Clicker needs accessibility permission to simulate keyboard input.',
    },
}

setup(
    app=APP,
    name='Clicker',
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
