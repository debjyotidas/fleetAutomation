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
                await element.click();
                return;
            } catch (error) {
                try {
                    await driver.executeScript("arguments[0].click();", element);
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

    it('should open Contacts For Alert modal when clicking Contact Email/Phone Number', async function () {
        try {
            await driver.get(BASE_URL);
            
            // Login steps
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
            await clickWithRetry(driver, submitButton);
            
            // Wait for redirect and verify URL
            await driver.wait(
                until.urlIs('https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php'),
                10000
            );
            
            // Wait for page load
            await driver.sleep(5000);

            // Find and click the ACCOUNT dropdown (corrected selector)
            const accountDropdown = await waitForClickable(driver, By.id('#account'));
            await clickWithRetry(driver, accountDropdown);
            
            await driver.sleep(2000);

            // Click Contact Email/Phone Number link (corrected selector)
            const contactsLink = await waitForClickable(driver, By.id('deviceDetailsLinkBtn'));
            await clickWithRetry(driver, contactsLink);
            
            // Wait for Contacts For Alert modal (corrected selector)
            const modal = await waitForClickable(driver, By.id('divDeviceDetailsModal'));
            expect(await modal.isDisplayed()).to.be.true;

            // Click on the search dropdown
            const searchContainer = await waitForClickable(driver, 
                By.id('select2-searchDriverField-container')
            );
            await clickWithRetry(driver, searchContainer);

            const displayDriver = await waitForClickable(driver, 
                By.id('select2-searchDriverField-results')
            );
            await clickWithRetry(driver, displayDriver);

            // Wait for search dropdown to open
            // await driver.wait(
            //     until.elementLocated(By.id('select2-searchDriverField-results')),
            //     5000
            // );

            // Find and click close button
            const closeButton = await modal.findElement(By.css('button.btn.btn-default[data-dismiss="modal"]'));
            await clickWithRetry(driver, closeButton);

            // Verify modal closes
            await driver.wait(until.elementIsNotVisible(modal), 10000);

        } catch (error) {
            console.error('Test failed:', error);
            try {
                const screenshot = await driver.takeScreenshot();
                writeFileSync(`error-${Date.now()}.png`, screenshot, 'base64');
                console.log('Screenshot saved');
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