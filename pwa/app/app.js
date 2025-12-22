class ClickerApp {
    constructor() {
        this.ws = null;
        this.isOn = false;
        this.serverUrl = localStorage.getItem('clicker_server_url');
        this.hasSeenWelcome = localStorage.getItem('clicker_seen_welcome');
        this.reconnectTimeout = null;
        this.audioContext = null;

        // DOM elements
        this.buttonOn = document.getElementById('button-on');
        this.buttonOff = document.getElementById('button-off');
        this.recIndicator = document.getElementById('rec-indicator');
        this.welcomeOverlay = document.getElementById('welcome-overlay');
        this.connectOverlay = document.getElementById('connect-overlay');
        this.connectBtn = document.getElementById('connect-btn');
        this.manualUrl = document.getElementById('manual-url');
        this.welcomeContinue = document.getElementById('welcome-continue');

        this.init();
    }

    init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service worker registered'))
                .catch(err => console.log('SW registration failed:', err));
        }

        // Check URL params for server URL (from QR code)
        const params = new URLSearchParams(window.location.search);
        const urlFromQR = params.get('server');
        if (urlFromQR) {
            this.serverUrl = urlFromQR;
            localStorage.setItem('clicker_server_url', urlFromQR);
            // Clean URL
            history.replaceState({}, '', window.location.pathname);
        }

        this.setupEventListeners();
        this.renderConnectionHistory();

        // Determine which overlay to show
        if (this.serverUrl) {
            // Have a saved URL - try to connect
            this.connect(this.serverUrl);
        } else if (!this.hasSeenWelcome) {
            // First time user - show welcome
            this.showWelcome();
        } else {
            // Returning user without connection - show connect overlay
            this.showConnect();
        }
    }

    // Connection history management
    getConnectionHistory() {
        try {
            const history = localStorage.getItem('clicker_connection_history');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    addToConnectionHistory(wsUrl, displayName = null) {
        const history = this.getConnectionHistory();

        // Extract display name from URL if not provided
        if (!displayName) {
            try {
                const url = new URL(wsUrl);
                displayName = url.hostname;
            } catch (e) {
                displayName = wsUrl.replace('ws://', '').replace('wss://', '').split(':')[0];
            }
        }

        // Remove existing entry for this URL
        const filtered = history.filter(h => h.url !== wsUrl);

        // Add to front of list
        filtered.unshift({
            url: wsUrl,
            name: displayName,
            lastConnected: Date.now()
        });

        // Keep only last 5 connections
        const trimmed = filtered.slice(0, 5);

        localStorage.setItem('clicker_connection_history', JSON.stringify(trimmed));
        this.renderConnectionHistory();
    }

    renderConnectionHistory() {
        const history = this.getConnectionHistory();
        const container = document.getElementById('connection-history');

        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <div class="history-label">Recent Servers</div>
            ${history.map(h => `
                <button class="history-item" data-url="${h.url}">
                    <span class="history-name">${h.name}</span>
                    <span class="history-url">${h.url.replace('ws://', '').replace('wss://', '')}</span>
                </button>
            `).join('')}
        `;

        // Add click handlers
        container.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', () => {
                this.connect(btn.dataset.url);
            });
        });
    }

    showWelcome() {
        this.welcomeOverlay.classList.remove('hidden');
        this.connectOverlay.classList.add('hidden');
    }

    showConnect() {
        this.welcomeOverlay.classList.add('hidden');
        this.connectOverlay.classList.remove('hidden');
    }

    setupEventListeners() {
        // Welcome continue button
        this.welcomeContinue.addEventListener('click', () => {
            localStorage.setItem('clicker_seen_welcome', 'true');
            this.hasSeenWelcome = true;
            this.showConnect();
        });

        // Main toggle - use touchstart for immediate iOS response
        const appEl = document.getElementById('app');

        // Track if we handled a touch to prevent double-firing with click
        let touchHandled = false;

        // Primary touch handler - touchstart fires immediately on contact
        appEl.addEventListener('touchstart', (e) => {
            // Don't trigger if touching an overlay
            if (e.target.closest('.overlay')) return;
            if (!this.welcomeOverlay.classList.contains('hidden')) return;
            if (!this.connectOverlay.classList.contains('hidden')) return;

            e.preventDefault();
            touchHandled = true;

            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.toggle();
            }
        }, { passive: false });

        // Fallback for non-touch devices (desktop testing)
        appEl.addEventListener('click', (e) => {
            // Skip if touch already handled this interaction
            if (touchHandled) {
                touchHandled = false;
                return;
            }
            if (e.target.closest('.overlay')) return;
            if (!this.welcomeOverlay.classList.contains('hidden')) return;
            if (!this.connectOverlay.classList.contains('hidden')) return;

            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.toggle();
            }
        });

        // Manual connect button
        this.connectBtn.addEventListener('click', () => {
            const url = this.manualUrl.value.trim();
            if (url) {
                this.connect(url);
            }
        });

        // Enter key on input
        this.manualUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = this.manualUrl.value.trim();
                if (url) {
                    this.connect(url);
                }
            }
        });
    }

    connect(url) {
        // Clean up any existing connection
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        // Smart URL conversion: accept IP, HTTP URL, or WebSocket URL
        let wsUrl = url;

        // If it's an HTTP URL, convert to WebSocket
        if (url.startsWith('http://') || url.startsWith('https://')) {
            wsUrl = url.replace('https://', 'wss://').replace('http://', 'ws://');
            // Convert HTTP port to WebSocket port
            wsUrl = wsUrl.replace(':8080', ':8765');
            // Remove any path/query
            wsUrl = wsUrl.split('?')[0].replace(/\/$/, '');
        }

        // Ensure ws:// prefix
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
            wsUrl = 'ws://' + wsUrl;
        }

        // Add default port if none specified
        if (!wsUrl.includes(':', 5)) { // Check after ws://
            wsUrl = wsUrl + ':8765';
        }

        console.log('Connecting to:', wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);
        } catch (e) {
            console.error('WebSocket error:', e.message);
            return;
        }

        this.ws.onopen = () => {
            console.log('Connected!');
            this.welcomeOverlay.classList.add('hidden');
            this.connectOverlay.classList.add('hidden');
            localStorage.setItem('clicker_server_url', wsUrl);
            this.serverUrl = wsUrl;

            // Save to connection history
            this.addToConnectionHistory(wsUrl);

            // Reset to OFF state on new connection
            this.isOn = false;
            this.updateUI();
        };

        this.ws.onclose = () => {
            console.log('Disconnected');

            // Reset to OFF state
            this.isOn = false;
            this.updateUI();

            // Try to reconnect after 3 seconds
            if (this.serverUrl) {
                this.reconnectTimeout = setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    this.connect(this.serverUrl);
                }, 3000);
            }
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        this.ws.onmessage = (event) => {
            console.log('Server:', event.data);
        };
    }

    toggle() {
        this.isOn = !this.isOn;
        this.updateUI();
        this.sendCommand(this.isOn ? 'key_down' : 'key_up');

        // Play click sound
        this.playClickSound();

        // Haptic feedback
        this.triggerHaptic();
    }

    async playClickSound() {
        try {
            // Create audio context on first interaction (required by browsers)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.audioContext;

            // Resume if suspended (required for iOS Safari) - must await!
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // Create a satisfying mechanical click sound
            const clickTime = ctx.currentTime;

        // Main click - short noise burst
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Filter to make it sound more like a click
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;

        // Gain envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.4, clickTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, clickTime + 0.05);

        // Connect and play
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noiseSource.start(clickTime);
        noiseSource.stop(clickTime + 0.05);

        // Add a subtle low thump for weight
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, clickTime);
        osc.frequency.exponentialRampToValueAtTime(50, clickTime + 0.03);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, clickTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, clickTime + 0.03);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(clickTime);
        osc.stop(clickTime + 0.03);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    triggerHaptic() {
        // Try different haptic APIs for best iOS support

        // 1. Vibration API (Android, some browsers)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        // 2. iOS-specific haptic feedback via touch events
        // This provides the native iOS "tap" feel
        if ('ontouchstart' in window) {
            // Create and immediately remove an element with haptic style
            // This trick can trigger subtle haptic on some iOS versions
            const el = document.createElement('button');
            el.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);
        }
    }

    updateUI() {
        if (this.isOn) {
            this.buttonOn.classList.remove('hidden');
            this.buttonOff.classList.add('hidden');
            this.recIndicator.classList.remove('hidden');
        } else {
            this.buttonOff.classList.remove('hidden');
            this.buttonOn.classList.add('hidden');
            this.recIndicator.classList.add('hidden');
        }
    }

    sendCommand(action) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action }));
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ClickerApp();
});
