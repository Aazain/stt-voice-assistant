// This module handles loading, saving, and managing user query history locally
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const userDataPath = app.getPath('userData');
const historyPath = path.join(userDataPath, 'history.json');

class HistoryStore {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(historyPath)) {
                const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
                return Array.isArray(data) ? data : [];
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
        return [];
    }

    save() {
        try {
            fs.mkdirSync(path.dirname(historyPath), { recursive: true });
            fs.writeFileSync(historyPath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    getAll() {
        return this.data;
    }

    add(entry) {
        // Add timestamp if not provided
        if (!entry.timestamp) {
            entry.timestamp = new Date().toISOString();
        }
        this.data.unshift(entry); // Add to beginning
        // Keep only last 100 entries
        if (this.data.length > 100) {
            this.data = this.data.slice(0, 100);
        }
        this.save();
    }

    clear() {
        this.data = [];
        this.save();
    }
}

const store = new HistoryStore();

/**
 * Get all history entries
 * @returns {Array} Array of history entries
 */
function getAllHistory() {
    return store.getAll();
}

/**
 * Add a new history entry
 * @param {Object} entry - History entry object
 * @param {string} entry.query - User query text
 * @param {string} entry.api - API type (weather, news, wiki, none)
 * @param {string} entry.classification - Classification type
 * @param {Object} entry.response - API response data
 * @param {string} entry.timestamp - ISO timestamp
 */
function addHistoryEntry(entry) {
    store.add(entry);
}

/**
 * Clear all history
 */
function clearHistory() {
    store.clear();
}

/**
 * Get the path where history is stored
 * @returns {string} File path
 */
function getStorePath() {
    return historyPath;
}

module.exports = {
    getAllHistory,
    addHistoryEntry,
    clearHistory,
    getStorePath
};

