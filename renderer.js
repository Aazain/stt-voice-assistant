// const socket = new WebSocket("ws://127.0.0.1:8000/ws/voice/"); // Websocket URL needs to be changed if different

// socket.onopen = () => {
//     console.log("Websocket Connected");
//     document.getElementById("info").innerText = "Websocket Connected";
// };

// // Server's response
// socket.onmessage = (event) => {
//     console.log("Message from server:", event.data);
//     try {
//         document.getElementById("info").innerText = `Server: ${event.data}`;
//     } catch (error) {
//         console.error("Error parsing server response:", error);
//         document.getElementById("info").innerText = "Error parsing server response!";
//     }
// }

// // Error Message
// socket.onerror = (error) => {
//     console.error("WebSocket error:", error);
//     document.getElementById("info").innerText = "Error!";
// };

// // Server closing message
// socket.onclose = () => {
//     console.log("Connection Closed");
//     document.getElementById("info").innerText = "Connection Closed!";
// };

// // Sending message function
// function sendMessage(message) {
//     if (socket.readyState === WebSocket.OPEN) {
//         console.log("Sending message:", message);
//         socket.send(JSON.stringify({ message }));
//     } else { // if websocket isn't connected properly
//         console.error("WebSocket is not open.");
//         document.getElementById("info").innerText = "WebSocket is not open. Please wait...";
//     }
// }

// const button = document.getElementById("sendMessage");
// const input = document.getElementById("inputmsg");

// button.addEventListener("click", () => {
//     const message = input.value;
//     sendMessage(message);
// });

// Navigation between views
function switchView(viewId) {
    // Hide views
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    // Remove active state from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.classList.add('active');
    }
    
    // Highlight active nav button
    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Settings Navigation
const openSettingsBtn = document.getElementById('open-settings');
openSettingsBtn.setAttribute('data-view', 'settings-view');
openSettingsBtn.addEventListener('click', async () => {
    switchView('settings-view');
    // Load current preferences
    const prefs = await window.preferences.getAll();
    document.getElementById('pref-location').value = prefs.location || '';
    document.querySelector(`input[name="theme"][value="${prefs.theme}"]`).checked = true;
    document.querySelector(`input[name="temp-unit"][value="${prefs.temperatureUnit}"]`).checked = true;
});

// History Navigation
const openHistoryBtn = document.getElementById('open-history');
openHistoryBtn.setAttribute('data-view', 'history-view');
openHistoryBtn.addEventListener('click', async () => {
    switchView('history-view');
    await renderHistoryList();
});

// Voice Input Navigation
const micBtn = document.getElementById('mic-btn');
micBtn.setAttribute('data-view', 'main-view');
micBtn.addEventListener('click', () => {
    switchView('main-view');
});

// Menu button
const menuBtn = document.getElementById('menu-btn');
menuBtn.addEventListener('click', () => {
    switchView('main-view');
});

// Status message helper
const statusMessage = document.getElementById('settings-status');
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 3000);
}

// Save preferences
document.getElementById('preferences-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTheme = document.querySelector('input[name="theme"]:checked').value;
    const newTempUnit = document.querySelector('input[name="temp-unit"]:checked').value;
    
    await window.preferences.update({
        location: document.getElementById('pref-location').value,
        theme: newTheme,
        temperatureUnit: newTempUnit
    });
    
    showStatus('Preferences saved successfully!', 'success');
});

// Reset to defaults
document.getElementById('reset-preferences').addEventListener('click', async () => {
    if (confirm('Reset all preferences to defaults?')) {
        const defaults = await window.preferences.reset();
        document.getElementById('pref-location').value = defaults.location;
        document.querySelector(`input[name="theme"][value="${defaults.theme}"]`).checked = true;
        document.querySelector(`input[name="temp-unit"][value="${defaults.temperatureUnit}"]`).checked = true;
        showStatus('Reset to defaults successfully!', 'success');
    }
});


// Helper to format timestamp
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// Helper to format response based on API type
function formatResponse(entry) {
    if (!entry.response) return '<p class="no-response">No response recorded</p>';
    
    const response = entry.response;
    
    // Weather response
    if (entry.api === 'weather' && typeof response === 'object') {
        return `
            <div class="response-weather">
                <div class="response-row">
                    <span class="response-label">Location</span>
                    <span class="response-value">${response.location || 'Unknown'}</span>
                </div>
                <div class="response-row">
                    <span class="response-label">Temperature</span>
                    <span class="response-value">${response.temperature || 'N/A'}${response.temperatureUnit || '°C'}</span>
                </div>
                <div class="response-row">
                    <span class="response-label">Condition</span>
                    <span class="response-value">${response.condition || 'Unknown'}</span>
                </div>
                <div class="response-row">
                    <span class="response-label">Wind Speed</span>
                    <span class="response-value">${response.windspeed || 'N/A'} km/h</span>
                </div>
            </div>
        `;
    }
    
    // News response
    if (entry.api === 'news' && Array.isArray(response)) {
        const newsItems = response.slice(0, 5).map(item => `
            <div class="response-news-item">
                <span class="news-title">${item.title || 'Untitled'}</span>
            </div>
        `).join('');
        return `<div class="response-news">${newsItems}</div>`;
    }
    
    // Wiki response
    if (entry.api === 'wiki') {
        const extract = typeof response === 'object' ? response.extract : response;
        if (extract) {
            // Truncate long extracts for display
            const truncated = extract.length > 300 ? extract.substring(0, 300) + '...' : extract;
            return `
                <div class="response-wiki">
                    <p class="wiki-extract">${truncated}</p>
                </div>
            `;
        }
    }
    
    // Error response
    if (response.error) {
        return `<p class="response-error">Error: ${response.error}</p>`;
    }
    
    // Plain text response
    if (typeof response === 'string') {
        return `<p class="response-text">${response}</p>`;
    }
    
    // Default: show formatted object
    return `<p class="response-text">${JSON.stringify(response, null, 2)}</p>`;
}

// Helper to render history list
async function renderHistoryList() {
    const historyList = document.getElementById('history-list');
    const history = await window.queryHistory.getAll();
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No history yet. Make a voice query to get started!</p>';
        return;
    }
    
    historyList.innerHTML = '';
    history.forEach((entry, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Get formatted response
        const formattedResponse = formatResponse(entry);
        
        // Get API icon (SVG)
        const apiIcons = {
            'weather': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/></svg>',
            'news': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M18 18h-8M18 10h-8"/></svg>',
            'wiki': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>',
            'none': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
        };
        const apiIcon = apiIcons[entry.api] || apiIcons['none'];
        
        historyItem.innerHTML = `
            <div class="history-header">
                <div class="history-query">"${entry.query || 'Unknown query'}"</div>
                <div class="history-timestamp">${formatTimestamp(entry.timestamp)}</div>
            </div>
            <div class="history-meta">
                <span class="history-badge classification">${entry.classification || 'N/A'}</span>
                <span class="history-badge api">${apiIcon} ${entry.api || 'none'}</span>
            </div>
            <div class="history-response">
                ${formattedResponse}
            </div>
            <div class="history-actions-item">
                <button class="btn-repeat" data-index="${index}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 1l4 4-4 4"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <path d="M7 23l-4-4 4-4"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                    Repeat
                </button>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
    
    // Add event listeners to repeat buttons
    document.querySelectorAll('.btn-repeat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const index = parseInt(e.target.dataset.index);
            const history = await window.queryHistory.getAll();
            const entry = history[index];
            if (entry && entry.query) {
                // Trigger a repeat of the query and switch to main view
                if (window.repeatQuery) {
                    switchView('main-view');
                    window.repeatQuery(entry.query);
                }
            }
        });
    });
}

// Clear history button
document.getElementById('clear-history').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
        await window.queryHistory.clear();
        await renderHistoryList();
    }
});
// Chat bubble addition helper
// sender = 'user' or 'assistant'
window.addChatBubble = function(text, sender = 'assistant') {
    const chatContainer = document.getElementById('chat-container');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return bubble;
}