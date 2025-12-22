# The Clicker App

## Project Intent

The Clicker app is a remote toggle control that lets you hold down the **right Option key** on your Mac using your iPhone. Think of it as a wireless, single-button remote that simulates pressing and holding a keyboard key.

**Use case:** When you need to hold down the Option key for extended periods or trigger Option-key combinations without physically touching your keyboard.

## How It Works

```
┌─────────────────┐     WiFi/WebSocket      ┌─────────────────┐
│   iPhone PWA    │ ────────────────────────│  Python Script  │
│   (Web App)     │    ws://192.168.x.x     │   (Mac/PC)      │
│                 │                         │                 │
│  Toggle Button  │   {"action":"key_down"} │  Simulates key  │
│  ON/OFF states  │   {"action":"key_up"}   │  press/release  │
└─────────────────┘                         └─────────────────┘
```

1. **Run the Python script** on your Mac - it displays a QR code and URLs
2. **Open the HTTP URL** in Safari on iPhone (or scan QR code)
3. **Tap the screen** to toggle - ON holds the right Option key down, OFF releases it
4. **"REC" indicator** appears in red in upper right corner when ON

---

## Quick Test Instructions

When you say "let's run another test", follow these steps:

### On the Mac (test laptop):
1. Copy `clicker_server.py` to the Desktop
2. Open Terminal
3. Run: `python3 ~/Desktop/clicker_server.py`
4. Note the HTTP URL displayed (e.g., `http://10.0.0.161:8080`)

### On the iPhone (same WiFi network):
1. Clear Safari cache: Settings > Safari > Clear History and Website Data
2. Open Safari and go to the HTTP URL shown in Terminal
3. If the connect overlay appears, enter the IP address **with port 8765** (e.g., `10.0.0.167:8765`) and tap Connect
4. Tap anywhere on the screen to toggle the switch

**IMPORTANT:** When manually entering the IP, you MUST include the port `:8765`. Just the IP alone won't work. Scanning the QR code is easier since it includes the port automatically.

### To verify Option key is working:
- Open Finder on the Mac
- Tap the button to turn ON (you should see "REC" in upper right)
- While ON, click the Apple menu - you should see "System Information..." instead of "About This Mac"
- Or: While ON, drag a file - it should show a green "+" (copy) instead of moving

### macOS Permissions (first time only):
If the Option key doesn't work, grant Accessibility permission:
1. System Settings > Privacy & Security > Accessibility
2. Enable Terminal (or add it if not listed)
3. Restart the script

---

## Sharing with a Friend

### What to send them:
1. **The `clicker_server.py` file** (single file, ~1.4MB, contains everything)

### Instructions for friend:

**On their Mac:**
1. Save `clicker_server.py` to Desktop
2. Open Terminal (Applications > Utilities > Terminal)
3. Run: `python3 ~/Desktop/clicker_server.py`
4. First run auto-installs required packages
5. Grant Accessibility permission: **System Settings > Privacy & Security > Accessibility > enable Terminal**
6. Note the IP address shown (e.g., `10.0.0.167`)

**On their iPhone (same WiFi as Mac):**
1. Open Safari
2. Go to the HTTP URL shown in Terminal (e.g., `http://10.0.0.167:8080`)
3. If connect screen appears, enter: `IP:8765` (e.g., `10.0.0.167:8765`)
4. Tap Connect
5. Tap anywhere to toggle Option key on/off
6. "REC" = Option key is held down

**Pro tip:** Scanning the QR code shown in Terminal is easier than typing - it auto-connects!

---

## Current Status (as of 2025-12-21)

### What's Working (Local Mode)
- Single-file Python server (`clicker_server.py`) serves both HTTP and WebSocket
- All PWA assets (HTML, CSS, JS, images) are embedded in the Python file
- Touch toggle works on iPhone Safari
- Click sound plays on toggle
- "REC" indicator shows in red when switch is ON
- Right Option key (keycode 61) is simulated using macOS Quartz framework
- Auto-reconnect if connection drops
- QR code scanning auto-connects with correct port
- Manual IP entry works when port 8765 is included (e.g., `10.0.0.167:8765`)

### Vercel Deployment - BLOCKED BY MIXED CONTENT ISSUE
- GitHub: https://github.com/screendoorstudio/clicker-app
- Vercel: https://clicker-app-theta.vercel.app
- **PROBLEM:** Browsers block HTTPS pages from connecting to ws:// (non-secure) WebSockets
- The Vercel PWA loads fine, but WebSocket connection to local Mac server fails silently
- iPhone shows "WebSocket created successfully" but `onopen` never fires
- This is a browser security restriction, not a bug in our code

### Active Debugging (Next Session)
**When resuming this project, ask: "Ready to debug the Vercel connection test?"**

A test package was created at `~/Desktop/OptionKeyRemote/`:
- `option_key_server.py` - Minimal WebSocket-only server (3KB)
- `README.txt` - Simple setup instructions pointing to Vercel URL

The test flow:
1. Run `python3 ~/Desktop/OptionKeyRemote/option_key_server.py` on Mac
2. Open `https://clicker-app-theta.vercel.app` on iPhone
3. Enter Mac's IP address and tap Connect
4. **Result:** Connection fails due to HTTPS→ws:// mixed content block

**Options to explore:**
1. Accept that Vercel won't work and use local-only approach
2. Set up wss:// with self-signed certs (complex for end users)
3. Use a tunneling service (ngrok, etc.) to get HTTPS for local server
4. Deploy WebSocket relay to cloud (adds dependency)

### Key Discovery (2025-12-21)
**Manual IP entry requires the port!** When typing the IP address manually, you must include `:8765` (the WebSocket port). Example: `10.0.0.167:8765`. The QR code works because it includes the full URL with the port already set.

### Technical Implementation
- **Key simulation**: Uses macOS Quartz `CGEventPost` with keycode 61 (right Option)
- **HTTP server**: Serves embedded PWA on port 8080
- **WebSocket server**: Handles key commands on port 8765
- **Service worker**: Cache version `clicker-v7` for offline support

---

## Features

### iPhone App (PWA)
- Full-screen toggle button with custom ON/OFF images
- Click sound effect when toggled (Web Audio API)
- "REC" indicator in upper right when ON
- QR code scanning for easy connection
- Manual IP entry (accepts IP, HTTP URL, or WebSocket URL)
- Works offline after first load (Progressive Web App)
- Can be added to iPhone home screen
- Auto-reconnects if connection drops

### Python Server (`clicker_server.py`)
- **Self-contained**: All HTML/CSS/JS/images embedded in single file
- **Dual server**: HTTP (port 8080) + WebSocket (port 8765)
- **Auto-install**: Dependencies installed on first run
- **QR code**: Displayed in terminal for easy phone connection
- **macOS native**: Uses Quartz CGEvents for reliable key simulation
- **Safe disconnect**: Releases Option key if phone disconnects

---

## Files Structure
```
The Clicker app/
├── .git/                         # Git repo (github.com/screendoorstudio/clicker-app)
├── CLAUDE.md                     # This file
├── README.md                     # GitHub readme
├── UI images/                    # Original button images (source)
│   ├── UI_button-panel_ON-position.png
│   └── UI_button-panel_OFF-position.png
├── pwa/                          # PWA source files (synced with Vercel)
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── sw.js
│   ├── manifest.json
│   └── images/
├── python/
│   └── clicker_server.py         # Full server with embedded PWA (~1.4MB)
├── working_python_file_to_share/ # Ready-to-share package (LOCAL mode)
│   ├── clicker_server.py         # Working script - serves PWA locally
│   └── Setup Instructions.txt    # Plain text setup guide
└── bug-help/                     # Screenshots for debugging
```

**Note:** On 2025-12-21, the separate `clicker-app` folder was consolidated into this folder. The .git history is preserved here now.

**Desktop test files** (for Vercel debugging):
```
~/Desktop/OptionKeyRemote/
├── option_key_server.py          # Minimal WebSocket-only server (3KB)
└── README.txt                    # Instructions pointing to Vercel URL
```

---

## Vercel/GitHub Deployment

- **GitHub:** https://github.com/screendoorstudio/clicker-app
- **Vercel:** https://clicker-app-theta.vercel.app
- **Git repo location:** Now in this folder (`.git/`) after consolidation

**Current status:** BLOCKED - HTTPS/ws:// mixed content issue prevents the Vercel-hosted PWA from connecting to local WebSocket servers. See "Active Debugging" section above for next steps.

---

## Future Plans: Making It Easier

The current solution requires users to:
1. Download a Python file
2. Open Terminal and run a command
3. Grant Accessibility permissions
4. Manually connect from iPhone

**Goal:** Make this as simple as downloading an app and pressing "connect."

### Ideas to Explore

**Option 1: Native Mac App**
- Package the Python script as a standalone Mac app (.app)
- Tools: PyInstaller, py2app, or rewrite in Swift
- User just double-clicks the app, no Terminal needed
- Could live in menu bar
- Still needs Accessibility permission (unavoidable for key simulation)

**Option 2: Bluetooth Instead of WiFi**
- Eliminate the need to be on same WiFi network
- iPhone connects directly to Mac via Bluetooth
- More reliable pairing, no IP addresses to type
- Challenge: Bluetooth APIs are more complex, may need native code

**Option 3: Auto-Discovery (Bonjour/mDNS)**
- iPhone automatically finds Macs running the server on the network
- No typing IP addresses - just shows "Jake's MacBook" in a list
- User taps to connect
- Similar to how AirDrop discovers devices

**Option 4: QR Code from Menu Bar**
- Mac app shows QR code when you click the menu bar icon
- iPhone scans, instantly connected
- No typing at all

**Option 5: App Store Distribution**
- Native iOS app + Native Mac app
- Most polished user experience
- Significant development effort
- App Store review process for apps that simulate input

### Questions to Answer
- What's the simplest path to "just works"?
- Is Bluetooth feasible for this use case?
- Could this be a paid app? What's the market?
- What are the App Store guidelines for keyboard simulation apps?

### Next Session
**First priority:** Debug the Vercel connection issue (see "Active Debugging" section above).

Then discuss the best approach for making this more accessible to non-technical users. Consider trade-offs between development effort, user experience, and distribution options.

---

## Development Notes

- Images optimized from 5.7MB PNG to ~230KB JPG, then base64-encoded into Python script
- Right Option key = keycode 61 (left Option = keycode 58)
- Service worker cache version must be incremented to force updates on iPhone
- Clear Safari cache on iPhone when testing changes
- `touch-action: manipulation` CSS prevents iOS touch delays

---

## Session Log

### 2025-12-21 Evening Session
**Goal:** Create shareable Vercel-based setup for friends

**What we did:**
1. Consolidated two folders (`The Clicker app` + `clicker-app`) into one
2. Merged .git history into main project folder
3. Cleaned up CLAUDE.md naming (was `claude.md` + `CLAUDE 2.md`, now just `CLAUDE.md`)
4. Created test package at `~/Desktop/OptionKeyRemote/` for Vercel debugging
5. Discovered HTTPS/ws:// mixed content issue blocking Vercel approach

**Key finding:** The Vercel-hosted PWA (HTTPS) cannot connect to a local WebSocket server (ws://) due to browser security restrictions. The connection is created but `onopen` never fires.

**Next time:** Ask "Ready to debug the Vercel test?" and explore solutions to the mixed content problem.
