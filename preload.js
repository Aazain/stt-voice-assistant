const { ipcRenderer } = require('electron')

// With contextIsolation: false, we attach directly to window
window.versions = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping'),
}

window.darkMode = {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
}

window.preferences = {
    getAll: () => ipcRenderer.invoke('preferences:getAll'),
    get: (key) => ipcRenderer.invoke('preferences:get', key),
    set: (key, value) => ipcRenderer.invoke('preferences:set', key, value),
    update: (prefs) => ipcRenderer.invoke('preferences:update', prefs),
    reset: () => ipcRenderer.invoke('preferences:reset')
}

window.queryHistory = {
    getAll: () => ipcRenderer.invoke('history:getAll'),
    add: (entry) => ipcRenderer.invoke('history:add', entry),
    clear: () => ipcRenderer.invoke('history:clear')
}