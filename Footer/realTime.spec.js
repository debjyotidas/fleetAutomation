import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import fs from 'fs';

describe('Fleet Navigation Tests', function () {
    this.timeout(60000);
    
    let driver;
    const BASE_URL = 'https://gpsandfleet.io/gpsandfleet/client_login.php';
    
    before(async function () {
        try {
            driver = await new Builder().forBrowser('chrome').build();
            await driver.manage().window().maximize();
            
            // Login first since we need to be authenticated
            await driver.get(BASE_URL);
            
            const usernameField = await driver.wait(
                until.elementLocated(By.css("input[name='form-username']")),
                10000
            );
            await usernameField.sendKeys('fleetdemo');
            
            const passwordField = await driver.findElement(By.css("input[type='password']"));
            await passwordField.sendKeys('12345');
            
            const submitButton = await driver.wait(
                until.elementLocated(By.css("input[type='submit'], button[type='submit'], .submit, #Submit")),
                10000
            );
            await driver.executeScript("arguments[0].click();", submitButton);
            
            // Wait for initial page load after login
            await driver.wait(
                until.urlContains('gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/'),
                10000
            );
        } catch (error) {
            console.error('Error in test setup:', error);
            throw error;
        }
    });
    
    it('should open real-time tracking in new window and verify required elements', async function () {
        try {
            // Store the original window handle
            const originalWindow = await driver.getWindowHandle();
            
            // Wait for the real-time tracking link to be present and clickable
            const realTimeTrackingLink = await driver.wait(
                until.elementLocated(By.id('aBottomRealTimeTracking')),
                10000,
                'Real-time tracking link not found'
            );
            
            // Scroll element into view before clicking
            await driver.executeScript("arguments[0].scrollIntoView(true);", realTimeTrackingLink);
            await driver.sleep(1000); // Small wait after scroll
            
            // Click the link using JavaScript executor
            await driver.executeScript("arguments[0].click();", realTimeTrackingLink);
            
            // Wait for the new window/tab to appear
            await driver.wait(
                async () => (await driver.getAllWindowHandles()).length === 2,
                10000,
                'New window did not open'
            );
            
            // Get all window handles
            const windows = await driver.getAllWindowHandles();
            
            // Switch to the new window
            const newWindow = windows.find(handle => handle !== originalWindow);
            await driver.switchTo().window(newWindow);
            
            // Wait for the URL in the new window to contain index3.php
            await driver.wait(
                until.urlContains('index3.php'),
                15000,
                'New window URL did not contain index3.php'
            );
            
            // Verify the presence of specific elements in the new window
            // Wait for and verify the gifImage_30sec
            const gifImage = await driver.wait(
                until.elementLocated(By.id('gifImage_30sec')),
                10000,
                'GIF image element not found'
            );
            expect(await gifImage.isDisplayed()).to.be.true;
            
            // Wait for and verify the navbar
            const navbar = await driver.wait(
                until.elementLocated(By.css('ul.nav.navbar-nav.navbar-right')),
                10000,
                'Navbar element not found'
            );
            expect(await navbar.isDisplayed()).to.be.true;
            
            // Log success message
            console.log('Successfully verified all required elements in new window');
            
            // Switch back to original window
            await driver.switchTo().window(originalWindow);
            
        } catch (error) {
            console.error('Error in real-time tracking navigation test:', error);
            
            // Log additional debugging information
            try {
                const handles = await driver.getAllWindowHandles();
                console.log('Available window handles:', handles);
                
                const currentUrl = await driver.getCurrentUrl();
                console.log('Current URL:', currentUrl);
                
                const screenshot = await driver.takeScreenshot();
                fs.writeFileSync('real-time-tracking-error.png', screenshot, 'base64');
                console.log('Screenshot saved as real-time-tracking-error.png');
            } catch (debugError) {
                console.error('Error while collecting debug information:', debugError);
            }
            
            throw error;
        }
    });

    // New test case for dropdown functionality
    it('should open Tracker Info Display Options dropdown and verify LiveTrack menu', async function () {
        try {
            // Wait for and locate the dropdown toggle button
            const dropdownToggle = await driver.wait(
                until.elementLocated(By.id('aChangeDisplayOptions_liveTrack')),
                10000,
                'Tracker Info Display Options dropdown not found'
            );

            // Scroll the dropdown into view
            await driver.executeScript("arguments[0].scrollIntoView(true);", dropdownToggle);
            await driver.sleep(1000); // Small wait after scroll

            // Click the dropdown toggle
            await driver.executeScript("arguments[0].click();", dropdownToggle);

            // Wait for the dropdown menu to be visible
            const dropdownMenu = await driver.wait(
                until.elementLocated(By.css('.dropdown-menu.dropup.LiveTrack')),
                10000,
                'LiveTrack dropdown menu not found'
            );

            // Verify the dropdown menu is displayed
            expect(await dropdownMenu.isDisplayed()).to.be.true;

            // Verify the presence of "Name Only" option in the dropdown
            const nameOnlyOption = await dropdownMenu.findElement(By.css('.aLiveTrackOption[data-track_val="2"]'));
            expect(await nameOnlyOption.isDisplayed()).to.be.true;
            expect(await nameOnlyOption.getText()).to.equal('Name Only');

            // Log success message
            console.log('Successfully verified Tracker Info Display Options dropdown functionality');

        } catch (error) {
            console.error('Error in dropdown verification test:', error);

            // Log additional debugging information
            try {
                const screenshot = await driver.takeScreenshot();
                fs.writeFileSync('dropdown-test-error.png', screenshot, 'base64');
                console.log('Screenshot saved as dropdown-test-error.png');

                const currentUrl = await driver.getCurrentUrl();
                console.log('Current URL:', currentUrl);
            } catch (debugError) {
                console.error('Error while collecting debug information:', debugError);
            }

            throw error;
        }
    });
    
    after(async function () {
        if (driver) {
            try {
                // Close all windows and quit
                const handles = await driver.getAllWindowHandles();
                for (const handle of handles) {
                    await driver.switchTo().window(handle);
                    await driver.close();
                }
                await driver.quit();
            } catch (error) {
                console.error('Error while closing browser:', error);
            }
        }
    });
});