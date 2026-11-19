// This module handles loading, saving, and managing user preferences locally
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Default preferences
const defaults = {
    location: 'Toronto, Canada',
    theme: 'system',
    temperatureUnit: 'celsius'
};

const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'preferences.json');

class PreferencesStore {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(configPath)) {
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return { ...defaults, ...data };
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
        return { ...defaults };
    }

    save() {
        try {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }
}

const store = new PreferencesStore();

/**
 * Get all user preferences
 * @returns {Object} All preference values
 */
function getAllPreferences() {
    return {
        location: store.get('location'),
        theme: store.get('theme'),
        temperatureUnit: store.get('temperatureUnit')
    };
}

/**
 * Get a specific preference value
 * @param {string} key - Preference key
 * @returns {*} Preference value
 */
function getPreference(key) {
    return store.get(key);
}

/**
 * Set a specific preference value
 * @param {string} key - Preference key
 * @param {*} value - New value
 */
function setPreference(key, value) {
    store.set(key, value);
}

/**
 * Update multiple preferences at once
 * @param {Object} preferences - Object containing preference key-value pairs
 */
function updatePreferences(preferences) {
    Object.keys(preferences).forEach(key => {
        if (defaults.hasOwnProperty(key)) {
            store.set(key, preferences[key]);
        }
    });
}


function resetToDefaults() {
    Object.keys(defaults).forEach(key => {
        store.set(key, defaults[key]);
    });
}

/**
 * Get the path where preferences are stored
 * @returns {string} File path
 */
function getStorePath() {
    return configPath;
}

module.exports = {
    getAllPreferences,
    getPreference,
    setPreference,
    updatePreferences,
    resetToDefaults,
    getStorePath
};

