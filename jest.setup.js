// Jest setup file for mocking Electron APIs

// Mock window.preferences API
global.window = global.window || {};
global.window.preferences = {
    getAll: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    reset: jest.fn()
};

// Mock window.env API
global.window.env = {
    get: jest.fn()
};

// Mock window.darkMode API
global.window.darkMode = {
    toggle: jest.fn(),
    system: jest.fn()
};

// Mock alert, confirm, etc.
global.alert = jest.fn();
global.confirm = jest.fn();

// Suppress console errors in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn()
};

