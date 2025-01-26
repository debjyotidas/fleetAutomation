// loginFleet.spec.mjs
import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { writeFileSync } from 'fs';

 // Initialize WebDriver before tests
 before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: 10000 });
    // Navigate to the page first
    await driver.get('https://gpsandfleet.io/gpsandfleet/client_login.php');
    // Wait for page load
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
            await driver.executeScript("arguments[0].click();", element);
            return;
        } catch (error) {
            console.log(`Click attempt ${i + 1} failed, retrying...`);
            lastError = error;
            await driver.sleep(1000);
        }
    }
    throw lastError;
}


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
    it('should click Account menu and verify dropdown options', async function () {
        try {
            // Wait for the page to load
            await driver.wait(until.elementLocated(By.tagName('body')), 10000);
            await driver.sleep(2000); // Give extra time for JS to initialize
    
            // Find and click the Account dropdown toggle
            // Using XPath
            const accountToggle = await driver.wait(
                until.elementLocated(By.xpath("//a[@data-toggle='dropdown'][contains(text(), 'ACCOUNT')]")),
                10000
            );
            await driver.executeScript("arguments[0].click();", accountToggle);
    
            // Wait for dropdown menu to be visible
            const dropdownMenu = await driver.wait(
                until.elementLocated(By.css('.dropdown-menu')),
                10000
            );
            await driver.wait(until.elementIsVisible(dropdownMenu), 5000);
    
            // Verify the presence of specific menu items
            const expectedOptions = [
                'List Of Devices',
                'Device Details',
                'Contact Email/Phone Number'
            ];
    
            // Check each expected option
            for (const optionText of expectedOptions) {
                const optionElement = await driver.wait(
                    until.elementLocated(By.xpath(`//a[contains(text(), '${optionText}')]`)),
                    5000,
                    `Option "${optionText}" not found in dropdown`
                );
                const isDisplayed = await optionElement.isDisplayed();
                expect(isDisplayed).to.be.true;
            }
    
            // Optional: Click on "List Of Devices" option
            const listDevicesOption = await driver.wait(
                until.elementLocated(By.id('aAccInfoListDevices')),
                5000
            );
            await driver.executeScript("arguments[0].click();", listDevicesOption);
    
        } catch (error) {
            console.error('Error in account menu test:', error);
            // Take screenshot on failure
            try {
                const screenshot = await driver.takeScreenshot();
                require('fs').writeFileSync('account-menu-error.png', screenshot, 'base64');
                console.log('Screenshot saved as account-menu-error.png');
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