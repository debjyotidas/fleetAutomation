import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://gpsandfleet.io/gpsandfleet/client_login.php';

describe('Fleet Login Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        await driver.manage().setTimeouts({ implicit: 10000 });
        await driver.get(BASE_URL);
        await driver.sleep(3000);
    });

    async function waitForClickable(driver, locator, timeout = 20000) {
        try {
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.wait(until.elementIsVisible(element), timeout);
            await driver.wait(until.elementIsEnabled(element), timeout);
            return element;
        } catch (error) {
            console.error(`Error waiting for element: ${error.message}`);
            throw error;
        }
    }

    async function clickWithRetry(driver, element, maxAttempts = 3) {
        let lastError;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await driver.executeScript("arguments[0].scrollIntoView(true);", element);
                await driver.sleep(1000);
                await element.click();  // Try normal click first
                return;
            } catch (error) {
                try {
                    await driver.executeScript("arguments[0].click();", element);  // Fall back to JavaScript click
                    return;
                } catch (jsError) {
                    console.log(`Click attempt ${i + 1} failed, retrying...`);
                    lastError = jsError;
                    await driver.sleep(1000);
                }
            }
        }
        throw lastError;
    }

    it('should open List Of Devices modal, select Standard option, and verify warning', async function () {
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
            
            // Find and click the Submit button
            const submitButton = await driver.wait(
                until.elementLocated(By.css("input[type='submit'], button[type='submit'], .submit, #Submit")),
                10000
            );
            await clickWithRetry(driver, submitButton);
            
            // Wait for redirect and verify URL
            await driver.wait(
                until.urlIs('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php'),
                100000
            );
            
            // Wait for the page to load completely
            await driver.sleep(5000);

            // Find the Settings dropdown by ID and wait for it to be clickable
            const settingsDropdown = await waitForClickable(driver, By.id('aSettings'));
            await clickWithRetry(driver, settingsDropdown);
            
            // Wait a moment for the dropdown to open
            await driver.sleep(2000);

            // Find and click trackInfo in the dropdown
            const trackInfoLink = await waitForClickable(driver, By.id('aScheduledReport'));
            await clickWithRetry(driver, trackInfoLink);
            
            // Wait for modal to appear
            const modal = await waitForClickable(driver, By.id('divScheduledReport'));
            expect(await modal.isDisplayed()).to.be.true;
            
            // Find and click the Submit button in the modal
            // const modalSubmitButton = await waitForClickable(driver, By.css(".modal-content .modal-footer .submit"));
            // await clickWithRetry(driver, modalSubmitButton);

            //  Wait for and verify the warning message
            // const warningMessage = await driver.wait(
            //     until.elementLocated(By.css(".alert alert-success fade out")),
            //     // until.elementLocated(By.css(".alert-warning, .warning-message")),
            //     10000
            // );
            // expect(await warningMessage.isDisplayed()).to.be.true;
            
            // // Optionally verify the warning message text if needed
            // const warningText = await warningMessage.getText();
            // expect(warningText).to.include("Infobox Updated Successfully");

        } catch (error) {
            console.error('Test failed:', error);
            // Take screenshot on failure
            try {
                const screenshot = await driver.takeScreenshot();
                writeFileSync(`error-${Date.now()}.png`, screenshot, 'base64');
                console.log('Screenshot saved as error-screenshot.png');
            } catch (screenshotError) {
                console.error('Failed to take error screenshot:', screenshotError);
            }
            throw error;
        }
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });
});