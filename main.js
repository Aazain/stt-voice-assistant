const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')
const preferences = require('./preferences')
const history = require('./history')
require('dotenv').config()


const createWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        minWidth: 700,
        maxWidth: 900,
        height: 800,
        minHeight: 650,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    // Apply saved theme preference on startup
    const savedTheme = preferences.getPreference('theme');
    nativeTheme.themeSource = savedTheme;

    win.loadFile('index.html')

    // Dark mode toggle - saves preference
    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light'
            preferences.setPreference('theme', 'light')
        } else {
            nativeTheme.themeSource = 'dark'
            preferences.setPreference('theme', 'dark')
        }
        return nativeTheme.shouldUseDarkColors
    })

    // System theme - saves preference
    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
        preferences.setPreference('theme', 'system')
    })

    // Preferences IPC handlers
    ipcMain.handle('preferences:getAll', () => {
        return preferences.getAllPreferences()
    })

    ipcMain.handle('preferences:get', (event, key) => {
        return preferences.getPreference(key)
    })

    ipcMain.handle('preferences:set', (event, key, value) => {
        preferences.setPreference(key, value)
        return true
    })

    ipcMain.handle('preferences:update', (event, prefs) => {
        preferences.updatePreferences(prefs)
        // Apply theme if it was updated
        if (prefs.theme) {
            nativeTheme.themeSource = prefs.theme
        }
        return true
    })

    ipcMain.handle('preferences:reset', () => {
        preferences.resetToDefaults()
        const newTheme = preferences.getPreference('theme')
        nativeTheme.themeSource = newTheme
        return preferences.getAllPreferences()
    })

    // Environment variables handler
    ipcMain.handle('env:get', (event, key) => {
        return process.env[key] || null
    })

    // History IPC handlers
    ipcMain.handle('history:getAll', () => {
        return history.getAllHistory()
    })

    ipcMain.handle('history:add', (event, entry) => {
        history.addHistoryEntry(entry)
        return true
    })

    ipcMain.handle('history:clear', () => {
        history.clearHistory()
        return true
    })
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})