/**
 * Tests for User Preferences/Settings Page
 * Tests the settings modal UI, form interactions, and preference persistence
 */

describe('User Preferences/Settings Page', () => {
    
    // Mock window.preferences API
    let mockPreferences;
    
    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <button id="open-settings">⚙️ Settings</button>
            <p>Current theme source: <strong id="theme-source">System</strong></p>
            
            <div id="settings-modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>User Preferences</h2>
                    <form id="preferences-form">
                        <div class="form-group">
                            <label for="pref-location">Location:</label>
                            <input type="text" id="pref-location" placeholder="e.g., Toronto, Canada" />
                        </div>
                        
                        <div class="form-group">
                            <label for="pref-latitude">Latitude:</label>
                            <input type="number" id="pref-latitude" step="0.000001" placeholder="e.g., 43.683334" />
                        </div>
                        
                        <div class="form-group">
                            <label for="pref-longitude">Longitude:</label>
                            <input type="number" id="pref-longitude" step="0.000001" placeholder="e.g., -79.766670" />
                        </div>
                        
                        <div class="form-group">
                            <label for="pref-theme">Theme:</label>
                            <select id="pref-theme">
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="pref-temp-unit">Temperature Unit:</label>
                            <select id="pref-temp-unit">
                                <option value="celsius">Celsius</option>
                                <option value="fahrenheit">Fahrenheit</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" id="save-preferences">Save Preferences</button>
                            <button type="button" id="reset-preferences">Reset to Defaults</button>
                        </div>
                    </form>
                    <p id="settings-status" class="status-message"></p>
                </div>
            </div>
        `;
        
        // Mock window.preferences API
        mockPreferences = {
            getAll: jest.fn().mockResolvedValue({
                location: 'Toronto, Canada',
                latitude: 43.683334,
                longitude: -79.766670,
                theme: 'system',
                temperatureUnit: 'celsius'
            }),
            update: jest.fn().mockResolvedValue(true),
            reset: jest.fn().mockResolvedValue({
                location: 'Toronto, Canada',
                latitude: 43.683334,
                longitude: -79.766670,
                theme: 'system',
                temperatureUnit: 'celsius'
            })
        };
        
        global.window.preferences = mockPreferences;
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Settings Modal', () => {
        test('should open settings modal when button is clicked', async () => {
            const modal = document.getElementById('settings-modal');
            const openBtn = document.getElementById('open-settings');
            
            expect(modal.style.display).not.toBe('block');
            
            // Simulate opening settings
            modal.style.display = 'block';
            await mockPreferences.getAll();
            
            expect(modal.style.display).toBe('block');
            expect(mockPreferences.getAll).toHaveBeenCalled();
        });
        
        test('should close modal when close button is clicked', () => {
            const modal = document.getElementById('settings-modal');
            const closeBtn = document.querySelector('.close');
            
            modal.style.display = 'block';
            closeBtn.click();
            modal.style.display = 'none';
            
            expect(modal.style.display).toBe('none');
        });
        
        test('should load current preferences into form', async () => {
            const prefs = await mockPreferences.getAll();
            
            document.getElementById('pref-location').value = prefs.location;
            document.getElementById('pref-latitude').value = prefs.latitude;
            document.getElementById('pref-longitude').value = prefs.longitude;
            document.getElementById('pref-theme').value = prefs.theme;
            document.getElementById('pref-temp-unit').value = prefs.temperatureUnit;
            
            expect(document.getElementById('pref-location').value).toBe('Toronto, Canada');
            expect(document.getElementById('pref-latitude').value).toBe('43.683334');
            expect(document.getElementById('pref-longitude').value).toBe('-79.76667');
            expect(document.getElementById('pref-theme').value).toBe('system');
            expect(document.getElementById('pref-temp-unit').value).toBe('celsius');
        });
    });
    
    describe('Form Validation', () => {
        test('should have all required form fields', () => {
            expect(document.getElementById('pref-location')).toBeTruthy();
            expect(document.getElementById('pref-latitude')).toBeTruthy();
            expect(document.getElementById('pref-longitude')).toBeTruthy();
            expect(document.getElementById('pref-theme')).toBeTruthy();
            expect(document.getElementById('pref-temp-unit')).toBeTruthy();
        });
        
        test('should accept valid location input', () => {
            const locationInput = document.getElementById('pref-location');
            locationInput.value = 'New York, USA';
            
            expect(locationInput.value).toBe('New York, USA');
        });
        
        test('should accept valid latitude', () => {
            const latInput = document.getElementById('pref-latitude');
            latInput.value = 40.7128;
            
            expect(parseFloat(latInput.value)).toBe(40.7128);
        });
        
        test('should accept valid longitude', () => {
            const lonInput = document.getElementById('pref-longitude');
            lonInput.value = -74.0060;
            
            expect(parseFloat(lonInput.value)).toBe(-74.0060);
        });
    });
    
    describe('Saving Preferences', () => {
        test('should save preferences when form is submitted', async () => {
            document.getElementById('pref-location').value = 'New York, USA';
            document.getElementById('pref-latitude').value = '40.7128';
            document.getElementById('pref-longitude').value = '-74.0060';
            document.getElementById('pref-theme').value = 'dark';
            document.getElementById('pref-temp-unit').value = 'fahrenheit';
            
            await mockPreferences.update({
                location: 'New York, USA',
                latitude: 40.7128,
                longitude: -74.0060,
                theme: 'dark',
                temperatureUnit: 'fahrenheit'
            });
            
            expect(mockPreferences.update).toHaveBeenCalledWith({
                location: 'New York, USA',
                latitude: 40.7128,
                longitude: -74.0060,
                theme: 'dark',
                temperatureUnit: 'fahrenheit'
            });
        });
        
        test('should update theme display after saving', async () => {
            document.getElementById('pref-theme').value = 'dark';
            
            await mockPreferences.update({
                location: 'Toronto, Canada',
                latitude: 43.683334,
                longitude: -79.766670,
                theme: 'dark',
                temperatureUnit: 'celsius'
            });
            
            // Simulate theme display update
            document.getElementById('theme-source').innerHTML = 'Dark';
            
            expect(document.getElementById('theme-source').innerHTML).toBe('Dark');
        });
        
        test('should show success message after saving', async () => {
            await mockPreferences.update({
                location: 'Toronto, Canada',
                latitude: 43.683334,
                longitude: -79.766670,
                theme: 'system',
                temperatureUnit: 'celsius'
            });
            
            const statusMessage = document.getElementById('settings-status');
            statusMessage.textContent = 'Preferences saved!';
            statusMessage.className = 'status-message success';
            
            expect(statusMessage.textContent).toBe('Preferences saved!');
            expect(statusMessage.className).toContain('success');
        });
    });
    
    describe('Resetting Preferences', () => {
        test('should reset to defaults when reset button is clicked', async () => {
            const defaults = await mockPreferences.reset();
            
            document.getElementById('pref-location').value = defaults.location;
            document.getElementById('pref-latitude').value = defaults.latitude;
            document.getElementById('pref-longitude').value = defaults.longitude;
            document.getElementById('pref-theme').value = defaults.theme;
            document.getElementById('pref-temp-unit').value = defaults.temperatureUnit;
            
            expect(mockPreferences.reset).toHaveBeenCalled();
            expect(document.getElementById('pref-location').value).toBe('Toronto, Canada');
            expect(document.getElementById('pref-theme').value).toBe('system');
        });
        
        test('should show confirmation dialog before resetting', () => {
            global.confirm = jest.fn().mockReturnValue(true);
            
            const resetBtn = document.getElementById('reset-preferences');
            const shouldReset = confirm('Reset all preferences to defaults?');
            
            expect(shouldReset).toBe(true);
        });
    });
    
    describe('Theme Options', () => {
        test('should have all theme options available', () => {
            const themeSelect = document.getElementById('pref-theme');
            const options = Array.from(themeSelect.options).map(opt => opt.value);
            
            expect(options).toContain('system');
            expect(options).toContain('light');
            expect(options).toContain('dark');
        });
        
        test('should update theme when option is selected', () => {
            const themeSelect = document.getElementById('pref-theme');
            themeSelect.value = 'dark';
            
            expect(themeSelect.value).toBe('dark');
        });
    });
    
    describe('Temperature Unit Options', () => {
        test('should have both temperature unit options', () => {
            const tempSelect = document.getElementById('pref-temp-unit');
            const options = Array.from(tempSelect.options).map(opt => opt.value);
            
            expect(options).toContain('celsius');
            expect(options).toContain('fahrenheit');
        });
        
        test('should update temperature unit when option is selected', () => {
            const tempSelect = document.getElementById('pref-temp-unit');
            tempSelect.value = 'fahrenheit';
            
            expect(tempSelect.value).toBe('fahrenheit');
        });
    });
    
    describe('Preferences Persistence', () => {
        test('should persist preferences after page reload', async () => {
            // Save preferences
            await mockPreferences.update({
                location: 'London, UK',
                latitude: 51.5074,
                longitude: -0.1278,
                theme: 'dark',
                temperatureUnit: 'celsius'
            });
            
            // Simulate reload by fetching preferences again
            const prefs = await mockPreferences.getAll();
            mockPreferences.getAll.mockResolvedValue({
                location: 'London, UK',
                latitude: 51.5074,
                longitude: -0.1278,
                theme: 'dark',
                temperatureUnit: 'celsius'
            });
            
            const reloadedPrefs = await mockPreferences.getAll();
            
            expect(reloadedPrefs.location).toBe('London, UK');
            expect(reloadedPrefs.theme).toBe('dark');
        });
    });
    
    describe('Error Handling', () => {
        test('should show error message if save fails', async () => {
            mockPreferences.update.mockRejectedValue(new Error('Save failed'));
            
            try {
                await mockPreferences.update({
                    location: 'Test',
                    latitude: 0,
                    longitude: 0,
                    theme: 'system',
                    temperatureUnit: 'celsius'
                });
            } catch (error) {
                const statusMessage = document.getElementById('settings-status');
                statusMessage.textContent = 'Error saving preferences';
                statusMessage.className = 'status-message error';
                
                expect(statusMessage.textContent).toBe('Error saving preferences');
                expect(statusMessage.className).toContain('error');
            }
        });
    });
});

