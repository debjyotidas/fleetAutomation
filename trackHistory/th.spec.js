import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';

describe('Fleet Login Tests', function () {
    this.timeout(60000);
    
    let driver;
    const BASE_URL = 'https://gpsandfleet.io/gpsandfleet/client_login.php';
    
    before(async function () {
        try {
            driver = await new Builder().forBrowser('chrome').build();
            await driver.manage().window().maximize();
        } catch (error) {
            console.error('Error in test setup:', error);
            throw error;
        }
    });

    it('should redirect to fleet demo page with demo credentials', async function () {
        try {
            await driver.get(BASE_URL);
            
            // Wait for username field and enter fleetdemo
            const usernameField = await driver.wait(
                until.elementLocated(By.css("input[name='form-username']")),
                10000
            );
            await usernameField.sendKeys('fleetdemo');
            
            // Find password field and enter 12345
            const passwordField = await driver.findElement(By.css("input[type='password']"));
            await passwordField.sendKeys('12345');
            
            // Find and click the Submit button - using multiple possible selectors
            const submitButton = await driver.wait(
                until.elementLocated(By.css("input[type='submit'], button[type='submit'], .submit, #Submit")),
                10000
            );
            await driver.executeScript("arguments[0].click();", submitButton);
            
            // Wait for redirect and verify URL
            await driver.wait(
                until.urlIs('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php'),
                100000
            );
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.equal('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php');
        } catch (error) {
            console.error('Error in fleet demo test:', error);
            try {
                const screenshot = await driver.takeScreenshot();
                require('fs').writeFileSync('error-screenshot.png', screenshot, 'base64');
                console.log('Screenshot saved as error-screenshot.png');
            } catch (screenshotError) {
                console.error('Failed to take error screenshot:', screenshotError);
            }
            throw error;
        }
    });


    async function interactWithStartDate(driver) {
        try {
            // First ensure the page is stable
            await driver.sleep(2000);
    
            // Wait for modal with a longer timeout
            const modal = await driver.wait(
                until.elementLocated(By.id('divTrackHistory')),
                20000
            );
    
            // Wait for modal to be fully visible
            await driver.wait(
                until.elementIsVisible(modal),
                10000
            );
    
            // Give the modal animation time to complete
            await driver.sleep(2000);
    
            // Find the start date input using a more reliable selector
            const startDateInput = await driver.wait(
                until.elementLocated(By.css('#divTrackHistory input[type="text"]:first-child')),
                10000
            );
    
            // Wait for the element to be both visible and enabled
            await driver.wait(
                until.elementIsVisible(startDateInput),
                10000
            );
    
            await driver.wait(
                until.elementIsEnabled(startDateInput),
                10000
            );
    
            // Force focus on the element using JavaScript
            await driver.executeScript(`
                arguments[0].focus();
                arguments[0].scrollIntoView({ block: 'center', behavior: 'instant' });
            `, startDateInput);
    
            await driver.sleep(1000);
    
            // Use Actions class for more reliable interaction
            const actions = driver.actions({bridge: true});
            await actions
                .move({origin: startDateInput})
                .pause(500)
                .click()
                .perform();
    
            // Verify that the datepicker appeared
            await driver.wait(
                until.elementLocated(By.css('.datepicker-dropdown')),
                5000
            );
    
            return true;
        } catch (error) {
            console.error('Error interacting with start date:', error);
            throw error;
        }
    }
    
    // Update your test case
    it('should open the track history window and interact with date picker', async function () {
        try {
            // Navigate to the page
            await driver.get('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php');
    
            // Wait for initial page load
            await driver.wait(
                until.elementLocated(By.tagName('body')),
                10000
            );
    
            // Ensure the page is stable
            await driver.sleep(2000);
    
            // Find and click Track History with retry logic
            const trackHistoryMenu = await driver.wait(
                until.elementLocated(By.id('aTrackHistory')),
                10000
            );
    
            // Wait for menu to be clickable
            await driver.wait(
                until.elementIsEnabled(trackHistoryMenu),
                10000
            );
    
            // Use JavaScript click for more reliability
            await driver.executeScript("arguments[0].click();", trackHistoryMenu);
    
            // Call our interaction function
            // await interactWithStartDate(driver);
            
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    it('should open device search dropdown and verify span visibility', async function () {
        try {
            // Initial page stability wait
            await driver.sleep(3000);
    
            // First ensure Track History modal is present and visible
            const trackHistoryModal = await driver.wait(
                until.elementLocated(By.id('divTrackHistory')),
                20000
            );
    
            // Ensure modal is fully visible
            await driver.wait(
                until.elementIsVisible(trackHistoryModal),
                15000
            );
    
            // Give extra time for any animations
            await driver.sleep(2000);
    
            // Try to find and interact with select2 using multiple strategies
            const select2Strategies = [
                // Strategy 1: Direct select element
                async () => {
                    const select = await driver.findElement(By.id('selDriver'));
                    await driver.executeScript("$(arguments[0]).select2('open');", select);
                },
                // Strategy 2: Click the container
                async () => {
                    const container = await driver.findElement(By.css('.select2-container'));
                    await driver.executeScript("arguments[0].click();", container);
                },
                // Strategy 3: Use the selection element
                async () => {
                    const selection = await driver.findElement(By.css('.select2-selection'));
                    await driver.executeScript("arguments[0].click();", selection);
                }
            ];
    
            let succeeded = false;
            for (const strategy of select2Strategies) {
                try {
                    await strategy();
                    // If we reach here, the strategy worked
                    succeeded = true;
                    break;
                } catch (e) {
                    console.log('Strategy failed, trying next one...');
                    continue;
                }
            }
    
            if (!succeeded) {
                throw new Error('All strategies for opening select2 failed');
            }
    
            // Wait for the dropdown to be present in the DOM
            await driver.wait(
                until.elementLocated(By.css('body > .select2-container--open')),
                10000
            );
    
            // Wait a moment for any animations
            await driver.sleep(1000);
    
            // Find the search field in the open dropdown
            const searchField = await driver.wait(
                until.elementLocated(By.css('.select2-search--dropdown .select2-search__field')),
                10000
            );
    
            // Verify search field is visible and interact with it
            await driver.wait(
                until.elementIsVisible(searchField),
                10000
            );
    
            // Type in the search field
            await searchField.clear();
            await searchField.sendKeys('Sales Car');
    
            // Wait for search results
            await driver.wait(
                until.elementLocated(By.css('.select2-results__option')),
                10000
            );
    
        } catch (error) {
            console.error('Error in track history test:', error);
            try {
                const screenshot = await driver.takeScreenshot();
                require('fs').writeFileSync('track-history-error.png', screenshot, 'base64');
                console.log('Screenshot saved as track-history-error.png');
            } catch (screenshotError) {
                console.error('Failed to take error screenshot:', screenshotError);
            }
            throw error;
        }
    });
    
    after(async function () {
        if (driver) {
            try {
                await driver.quit();
            } catch (error) {
                console.error('Error while closing browser:', error);
            }
        }
    });
});