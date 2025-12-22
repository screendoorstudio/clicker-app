# The Clicker App

## Project Intent

The Clicker app is a remote toggle control that lets you hold down the **right Option key** on your Mac using your iPhone. Think of it as a wireless, single-button remote that simulates pressing and holding a keyboard key.

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
3. **Grant Accessibility permission** when prompted
4. **Scan QR code** with iPhone camera, or enter IP manually
5. **Tap the screen** to toggle - ON holds the right Option key down, OFF releases it

---

## Current Status (as of 2025-12-22)

### What's Live
- **Landing Page:** https://clicker-app-theta.vercel.app
- **GitHub:** https://github.com/screendoorstudio/clicker-app
- **Download:** https://clicker-app-theta.vercel.app/download (redirects to GitHub Release)
- **GitHub Release:** v1.0.0 with Clicker.app.zip

### What's Working
- Standalone Mac app (Clicker.app) built with py2app - no Terminal needed
- App opens browser with QR code for easy phone connection
- WebSocket connection between iPhone and Mac
- PWA with connection history (remembers last 5 connections)
- Auto-adds port 8765 when user enters just IP address
- Service worker cache version: `clicker-v12`

### Known Issues Being Debugged
1. **Option key not working** - Usually an Accessibility permission issue
2. **No click sound on iPhone** - iOS AudioContext suspension issue

---

## Testing Checklist (Next Session)

When you return after restarting both computers, test these:

### On the Mac:
1. Download Clicker.app from https://clicker-app-theta.vercel.app
2. Unzip and move to Applications (or Desktop)
3. **Right-click → Open** (bypasses Gatekeeper)
4. Grant Accessibility permission:
   - System Settings > Privacy & Security > Accessibility
   - Enable **Clicker** (delete any old entries first)
5. App should open browser with QR code

### On the iPhone:
1. Clear Safari cache: Settings > Safari > Clear History and Website Data
2. Scan QR code with Camera app, or go to the HTTP URL shown
3. Tap anywhere to toggle

### Verify Option key works:
- Open Finder on Mac
- Tap button ON (should see "REC" indicator)
- Click Apple menu → should show "System Information..." instead of "About This Mac"
- Or drag a file → should show green "+" (copy) instead of moving

### Verify sound works:
- Phone should NOT be on silent (check physical switch on side)
- Media volume should be up
- Tap toggle and listen for click sound

---

## Troubleshooting

### Option Key Not Working
1. **Check Accessibility permission:**
   - System Settings > Privacy & Security > Accessibility
   - Delete any old Clicker entries (select and click minus button)
   - Re-enable Clicker.app
   - Restart the app

2. **Verify app is receiving commands:**
   - Check Terminal/Console for "[KEY] Option key PRESSED/RELEASED" messages

### No Click Sound on iPhone
1. **Check silent switch** - physical switch on left side of phone
2. **Check media volume** - use volume buttons while media is playing
3. **Clear Safari cache** - Settings > Safari > Clear History and Website Data
4. **Check for JS errors:**
   - Settings > Safari > Advanced > Web Inspector (enable)
   - Connect iPhone to Mac with cable
   - Mac Safari > Develop > [iPhone name] > inspect page

### App Won't Launch (Launch Error)
- Usually means ports 8080 or 8765 are in use
- Open Activity Monitor, search for "Clicker" or "Python", kill those processes
- Or run in Terminal: `lsof -ti:8080 -ti:8765 | xargs kill -9`

### To Quit the App
The app runs in background without a Dock icon:
1. Open **Activity Monitor**
2. Search for "**Clicker**"
3. Select it and click **X** button
4. Click **Force Quit**

---

## Files Structure

```
The Clicker app/
├── .git/                         # Git repo
├── CLAUDE.md                     # This file
├── index.html                    # Landing page (Vercel root)
├── vercel.json                   # Redirect config for /download
├── assets/
│   └── screenshot.svg            # Landing page image
├── pwa/
│   └── app/                      # PWA files served by Mac app
│       ├── index.html
│       ├── app.js
│       ├── style.css
│       ├── sw.js
│       ├── manifest.json
│       └── images/
├── python/
│   ├── clicker_server.py         # Main server (~1.4MB with embedded PWA)
│   ├── setup.py                  # py2app build config
│   └── dist/
│       ├── Clicker.app           # Built Mac application
│       └── Clicker.app.zip       # Zipped for GitHub Release
├── UI images/                    # Original button artwork
└── bug-help/                     # Screenshots for debugging
```

---

## Technical Details

### Key Simulation
- Uses macOS Quartz `CGEventPost` with keycode 61 (right Option)
- Requires Accessibility permission to inject keyboard events

### Servers
- **HTTP server:** Port 8080 - serves embedded PWA
- **WebSocket server:** Port 8765 - handles key_down/key_up commands

### Audio (Click Sound)
- Uses Web Audio API with programmatic sound generation
- AudioContext must be resumed on iOS Safari (async)
- Sound: noise burst + low frequency thump for satisfying mechanical click

### PWA Features
- Service worker for offline support
- Connection history stored in localStorage
- Auto-reconnect on disconnect
- Smart URL parsing (accepts IP, HTTP URL, or WebSocket URL)

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
1. Go to https://github.com/screendoorstudio/clicker-app/releases/tag/v1.0.0
2. Edit release
3. Delete old zip, upload new `python/dist/Clicker.app.zip`
4. Update release

### Deploy Landing Page
Just push to main - Vercel auto-deploys from GitHub

---

## Session Log

### 2025-12-22 Session
**Goal:** Create public landing page and downloadable Mac app

**What we did:**
1. Built Clicker.app using py2app (standalone Mac app, no Terminal needed)
2. Created landing page at https://clicker-app-theta.vercel.app
3. Set up GitHub Release v1.0.0 with downloadable zip
4. Added /download redirect to GitHub Releases
5. Fixed auto-add port logic (users can enter just IP, port 8765 added automatically)
6. Fixed click sound for iOS (async AudioContext.resume())
7. Added quit instructions to landing page
8. Restructured repo: landing page at root, PWA in pwa/app/

**Current issues being debugged:**
- Option key not controlling keyboard (likely Accessibility permission)
- Click sound not playing on iPhone (iOS audio policy)

**Next steps:**
- User restarting both computers with clean Accessibility permissions
- Test full flow from fresh download
- Debug any remaining sound/key simulation issues

### 2025-12-21 Evening Session
- Consolidated folders and git history
- Discovered HTTPS/ws:// mixed content issue (solved by serving PWA locally from Mac app)
- Created test packages for debugging
