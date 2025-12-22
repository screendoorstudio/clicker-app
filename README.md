# Option Key Remote (Clicker App)

Control your Mac's Option key from your iPhone. Perfect for when you need to hold down the Option key for extended periods or trigger Option-key combinations without touching your keyboard.

## Quick Start

### 1. Download the Server Script

Download [`clicker_server.py`](server/clicker_server.py) to your Mac.

### 2. Run the Server

Open Terminal and run:

```bash
python3 clicker_server.py
```

First run will auto-install required packages (`websockets`, `qrcode`, `pynput`).

### 3. Grant Accessibility Permission (macOS)

When prompted, grant accessibility permission:
1. Open **System Settings > Privacy & Security > Accessibility**
2. Enable **Terminal** (or add it if not listed)
3. Restart the script if needed

### 4. Connect Your iPhone

1. Make sure your iPhone is on the **same WiFi network** as your Mac
2. Scan the QR code shown in Terminal, or
3. Visit [clicker-app-theta.vercel.app](https://clicker-app-theta.vercel.app) on Safari
4. Enter your Mac's IP address (shown in Terminal)
5. Tap anywhere on screen to toggle the Option key

### 5. Add to Home Screen (Optional)

For quick access, add the app to your iPhone home screen:
1. Tap the Share button in Safari
2. Select "Add to Home Screen"

## How It Works

```
┌─────────────────┐     WiFi/WebSocket      ┌─────────────────┐
│   iPhone PWA    │ ────────────────────────│  Python Script  │
│   (Web App)     │    ws://192.168.x.x     │   (Mac)         │
│                 │                         │                 │
│  Toggle Button  │   {"action":"key_down"} │  Simulates key  │
│  ON/OFF states  │   {"action":"key_up"}   │  press/release  │
└─────────────────┘                         └─────────────────┘
```

- **Tap** the button to toggle
- **REC** indicator appears when Option key is held
- **Green dot** = connected, **Red dot** = disconnected

## Verifying It Works

1. Open Finder on your Mac
2. Tap the button to turn ON (you should see "REC")
3. Click the Apple menu while ON
4. You should see "System Information..." instead of "About This Mac"

Or: While ON, drag a file - it should show a green "+" (copy) instead of moving.

## Server Options

```bash
# Default: QR code points to online PWA (recommended)
python3 clicker_server.py

# Local mode: Serve embedded PWA (no internet required)
python3 clicker_server.py --local

# Custom ports
python3 clicker_server.py --ws-port 9000 --http-port 9001
```

## Troubleshooting

### Option key doesn't work
- Check Accessibility permission in System Settings
- Restart the script after enabling permission

### Can't connect from iPhone
- Make sure iPhone and Mac are on the same WiFi network
- Check that no firewall is blocking ports 8765
- Try entering the IP address manually

### Connection keeps dropping
- The app will auto-reconnect after 3 seconds
- Move closer to your WiFi router
- Check that your Mac doesn't go to sleep

## Requirements

- **Mac:** Python 3.6+, macOS 10.12+
- **iPhone:** Safari, same WiFi network as Mac
- **Windows/Linux:** Works with pynput (Alt key instead of Option)

## License

MIT License - feel free to use, modify, and share!
