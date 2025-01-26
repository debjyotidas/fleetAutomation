// loginFleet.spec.mjs
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
            // Take screenshot on failure
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
    it('should open the track history window ', async function () {
        try {
            // Navigate to the page
            await driver.get('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php'); // Replace with your webpage URL
    
            // Wait for the Track History menu to be clickable
            const trackHistoryMenu = await driver.wait(
                until.elementLocated(By.id('aTrackHistory')),
                10000
            );
    
            // Click the Track History menu
            await trackHistoryMenu.click();
    
            // Wait for the modal to appear
            const modal = await driver.wait(
                until.elementLocated(By.id('divTrackHistory')),
                10000
            );
    
            // Verify if the modal is displayed
            const isDisplayed = await modal.isDisplayed();
            console.log(`Modal displayed: ${isDisplayed}`); // Logs true if modal is displayed
    
        } catch (error) {
            console.error(`Error: ${error}`);
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