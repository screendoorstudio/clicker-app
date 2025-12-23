# The Clicker App

## Project Intent

The Clicker App is a remote toggle control that lets you hold down the **right Option key** on your Mac using your iPhone. Think of it as a wireless, single-button remote that simulates pressing and holding a keyboard key.

**Use case:** When you need to hold down the Option key for extended periods or trigger Option-key combinations without physically touching your keyboard.

## How It Works

```
┌─────────────────┐     WiFi/WebSocket      ┌─────────────────┐
│   iPhone PWA    │ ────────────────────────│   Clicker.app   │
│   (Web App)     │    ws://192.168.x.x     │   (Mac App)     │
│                 │                         │                 │
│  Toggle Button  │   {"action":"key_down"} │  Simulates key  │
│  ON/OFF states  │   {"action":"key_up"}   │  press/release  │
└─────────────────┘                         └─────────────────┘
```

1. **Download and run Clicker.app** on your Mac
2. **Right-click → Open** (required first time for Gatekeeper)
3. **Grant Accessibility permission** in System Settings
4. **Scan QR code** with iPhone camera
5. **Tap the screen** to toggle - ON holds the right Option key down, OFF releases it

---

## Current Status (as of 2025-12-22)

### What's Live
- **Landing Page:** https://clicker-app-theta.vercel.app
- **GitHub:** https://github.com/screendoorstudio/clicker-app
- **Download:** https://clicker-app-theta.vercel.app/download (redirects to GitHub Release)
- **GitHub Release:** v1.0.0 with Clicker.app.zip

### What's Working
- Standalone Mac app (Clicker.app) built with py2app
- Custom app icon showing the button image
- QR code display for easy phone connection
- WebSocket connection between iPhone and Mac
- PWA with connection history (remembers last 5 servers)
- Auto-adds port 8765 when user enters just IP address
- Click sound works on Safari, Chrome, and Brave on iOS
- Service worker cache version: `clicker-v14`

### Features
- **Toggle button:** Tap anywhere to hold/release Option key
- **REC indicator:** Shows in red when Option key is held
- **Click sound:** Satisfying mechanical click on each tap
- **Haptic feedback:** Vibration on supported devices
- **Auto-reconnect:** Reconnects if connection drops
- **Connection history:** Quick access to recent servers

---

## Quick Start (Share This With Friends!)

### On the Mac:
1. Go to https://clicker-app-theta.vercel.app
2. Click **Download for Mac**
3. Unzip the file
4. **Right-click** Clicker.app → **Open** (or use Open Anyway in System Settings)
5. Go to **System Settings → Privacy & Security → Accessibility** → Enable **Clicker**

### On the iPhone:
1. Make sure you're on the **same WiFi network** as the Mac
2. Open the **Camera app**
3. Point at the **QR code** shown on the Mac
4. Tap the notification to open the web app
5. **Tap anywhere** to toggle the Option key!

### To verify it's working:
- With button ON (showing "REC"), click the Apple menu
- You should see "System Information..." instead of "About This Mac"
- Or drag a file while ON - it shows a green "+" (copy) instead of moving

---

## Files Structure

```
The Clicker app/
├── .git/                         # Git repo
├── CLAUDE.md                     # This file
├── index.html                    # Landing page (Vercel root)
├── vercel.json                   # Redirect config for /download
├── pwa/
│   └── app/                      # PWA source files
│       ├── index.html
│       ├── app.js
│       ├── style.css
│       ├── sw.js                 # Service worker (cache v14)
│       ├── manifest.json
│       └── images/
│           ├── button-on.jpg
│           ├── button-off.jpg
│           ├── icon-192.png
│           └── icon-512.png
├── python/
│   ├── clicker_server.py         # Main server with embedded PWA
│   ├── setup.py                  # py2app build config
│   ├── Clicker.icns              # Custom app icon
│   └── dist/
│       ├── Clicker.app           # Built Mac application
│       └── Clicker.app.zip       # Zipped for GitHub Release
├── UI images/                    # Original button artwork (high-res)
├── website-steps/                # Setup screenshots for landing page
│   ├── STEP_01_Download zip file.png
│   ├── STEP_02_ unzip to open Clicker app.png
│   ├── STEP_03_enable the Clicker App here.png
│   ├── STEP_04_what you see after you install the app.png
│   └── Quit_Clicker-App_in-Activity-Monitor.png
└── working_python_file_to_share/ # Legacy - use GitHub Release instead
```

---

## Technical Details

### Key Simulation
- Uses macOS Quartz `CGEventPost` with keycode 61 (right Option)
- Requires Accessibility permission to inject keyboard events

### Servers (both run from Clicker.app)
- **HTTP server:** Port 8080 - serves embedded PWA
- **WebSocket server:** Port 8765 - handles key_down/key_up commands

### Audio (Click Sound)
- Uses Web Audio API with programmatic sound generation
- `unlockAudio()` method pre-warms AudioContext for Chrome/Brave compatibility
- Called on Connect button click to satisfy iOS autoplay restrictions
- Sound: noise burst + low frequency thump for satisfying mechanical click

### PWA Features
- Service worker for offline support (cache v14)
- Connection history stored in localStorage
- Auto-reconnect on disconnect (3 second delay)
- Smart URL parsing (accepts IP, HTTP URL, or WebSocket URL)
- Auto-adds port 8765 if not specified

---

## Troubleshooting

### Option Key Not Working
1. **Check Accessibility permission:**
   - System Settings → Privacy & Security → Accessibility
   - Delete any old Clicker entries (select and click minus button)
   - Re-enable Clicker.app
   - Restart the app

2. **Verify connection:**
   - Green dot in top-right of phone screen = connected
   - Red dot = disconnected

### Can't Connect from iPhone
1. **Same WiFi network** - both devices must be on the same network
2. **Try manual IP** - enter the IP address shown on the Mac
3. **Check firewall** - Mac firewall may block incoming connections

### No Click Sound
1. **Check silent switch** - physical switch on left side of iPhone
2. **Check media volume** - use volume buttons while app is open
3. **Clear browser cache** - especially if updating from old version

### App Won't Launch (Launch Error)
- Usually means ports 8080 or 8765 are in use
- Open Activity Monitor, search for "Clicker", quit those processes
- Or run: `lsof -ti:8080 -ti:8765 | xargs kill -9`

### To Quit the App
The app runs in background without a Dock icon:
1. Open **Activity Monitor**
2. Search for "**Clicker**"
3. Select it and click **X** button → **Force Quit**

---

## Build & Deploy

### Rebuild Clicker.app
```bash
cd python
rm -rf build dist
python3 setup.py py2app
cd dist && zip -r Clicker.app.zip Clicker.app
```

### Update GitHub Release
1. Go to https://github.com/screendoorstudio/clicker-app/releases
2. Edit release v1.0.0
3. Delete old zip, upload new `python/dist/Clicker.app.zip`

### Deploy Landing Page
Just push to main - Vercel auto-deploys from GitHub

---

## Session Log

### 2025-12-22 Evening Session
**Goal:** Redesign landing page with better aesthetics and integrate setup screenshots

**What we accomplished:**
1. Complete landing page redesign
   - Modern dark theme with subtle red accent glow
   - Inter font for cleaner typography
   - Gradient title text and radial gradient overlay
   - Animated elements (pulsing connection dot, glowing Option key)
   - Refined card styling with hover effects
   - Download button with icon

2. Integrated setup screenshots into steps
   - Step 1: Side-by-side images of zip file and unzipped app
   - Step 3: Accessibility settings showing Clicker enabled
   - Step 4: QR code server window inside monitor mockup frame
   - Troubleshooting: Activity Monitor screenshot for "How to quit"

3. Privacy improvements for Step 4 screenshot
   - Added monitor frame around the image
   - Blurred QR code with "QR Code" label overlay
   - Masked IP address with "XX.X.X.XXX" placeholder

**New files:** `website-steps/` folder with 5 setup screenshots

---

### 2025-12-22 Afternoon Session
**Goal:** Polish the app for sharing with friends

**What we accomplished:**
1. Fixed click sound for Chrome/Brave on iOS
   - Added `unlockAudio()` method that pre-warms AudioContext
   - Called on Connect button click to satisfy autoplay restrictions

2. Simplified PWA UI
   - Removed QR scanner button (users scan with Camera app before reaching PWA)
   - Removed scanner overlay and related code

3. Improved landing page setup instructions
   - Expanded to 5 detailed steps
   - Added two options for bypassing Gatekeeper
   - Added troubleshooting section

4. Added hero visual to landing page
   - Phone mockup with actual button image
   - Arrow pointing to keyboard
   - Right Option key highlighted in red

5. Custom app icon
   - Created Clicker.icns from button-off.jpg
   - App now shows button image in Finder/Dock

6. Branding updates
   - Title: "The Clicker App"
   - Company: "Screendoor Studio Inc."

**Cache version:** v14

### 2025-12-22 Morning Session
- Built Clicker.app using py2app
- Created landing page at https://clicker-app-theta.vercel.app
- Set up GitHub Release v1.0.0
- Fixed auto-add port logic
- Fixed click sound for iOS Safari (async AudioContext.resume())

### 2025-12-21 Evening Session
- Consolidated folders and git history
- Discovered HTTPS/ws:// mixed content issue
- Solved by serving PWA locally from Mac app

---

## Future Ideas

- **Native Mac menu bar app** - click icon to show QR code
- **Bluetooth connection** - no WiFi dependency
- **Auto-discovery (Bonjour)** - phone finds Mac automatically
- **Multiple key support** - not just Option key
- **App Store distribution** - polished iOS + Mac apps
