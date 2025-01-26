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
            
            await driver.wait(
                until.urlIs('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php'),
                100000
            );
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.equal('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php');
        } catch (error) {
            console.error('Error in fleet demo test:', error);
            await takeErrorScreenshot(driver, error);
            throw error;
        }
    });

    it('should open landmark menu', async function () {
        try {
            // Add initial wait for page load
            await driver.sleep(2000); // Give extra time for page to stabilize
            
            // Wait for geofencing menu with extended timeout
            const landmarkMenu = await driver.wait(
                until.elementLocated(By.css('#aGeofence')),
                15000
            );
            await driver.wait(until.elementIsVisible(landmarkMenu), 5000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", landmarkMenu);
            await driver.sleep(1000); // Wait for scroll
            await driver.executeScript("arguments[0].click();", landmarkMenu);
            
            // Wait for dropdown to be visible
            await driver.sleep(1000); // Wait for animation
            
            // Click landmark report option with more robust selector
            const lanmarkrepo = await driver.wait(
                until.elementLocated(By.css('#aLandmarkReport')),
                10000
            );
            await driver.wait(until.elementIsVisible(lanmarkrepo), 5000);
            await driver.executeScript("arguments[0].click();", lanmarkrepo);
            
            // Wait for modal with more specific selector and longer timeout
            await driver.sleep(1000); // Wait for modal animation
            const modalDialog = await driver.wait(
                until.elementLocated(By.css('#divLandReportData .modal-dialog, .modal.fade.in .modal-dialog')),
                15000
            );
            
            // Verify modal is visible
            await driver.wait(
                until.elementIsVisible(modalDialog),
                10000
            );
            
        } catch (error) {
            console.error('Error in geofencing modal test:', error);
            console.error('Error details:', error.message);
            await takeErrorScreenshot(driver, error);
            throw error;
        }
    });


    async function takeErrorScreenshot(driver, error) {
        try {
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('error-screenshot.png', screenshot, 'base64');
            console.log('Screenshot saved as error-screenshot.png');
        } catch (screenshotError) {
            console.error('Failed to take error screenshot:', screenshotError);
        }
    }

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });
});