# Clicker Server

A simple WebSocket server that receives toggle commands from the Clicker iPhone app and simulates holding/releasing the Option (Alt) key.

## Quick Start

```bash
python3 clicker_server.py
```

Dependencies are installed automatically on first run.

## Usage

1. Run the server on your Mac or PC
2. A QR code will appear in the terminal
3. Scan the QR code with your iPhone camera
4. The Clicker app will open and connect
5. Tap the button to toggle Option key hold

## macOS Accessibility Permission

For key simulation to work on macOS, you need to grant Accessibility permission:

1. Open **System Settings** > **Privacy & Security**
2. Click **Accessibility**
3. Find and enable **Terminal** (or your Python IDE)
4. Restart the script if needed

## Options

```
--port, -p    Port to listen on (default: 8765)
--pwa         PWA URL for QR code (e.g., https://user.github.io/clicker)
```

## Manual Installation (optional)

If auto-install fails:

```bash
pip3 install websockets pynput qrcode
```

## How It Works

- The server listens for WebSocket connections on your local network
- When the phone sends `{"action": "key_down"}`, it presses and holds the Option key
- When the phone sends `{"action": "key_up"}`, it releases the Option key
- If the phone disconnects, the key is automatically released
