import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import fs from 'fs'; // Importing 'fs' for file operations

async function testReportDropdownAndTravel(driver) {
    try {
        // Wait for page to be fully loaded
        await driver.sleep(2000); // Give the page time to stabilize

        // Wait for and click the Reports dropdown button
        const reportsDropdown = await waitForElementVisible(
            driver,
            By.css('a[id="aReport"]')
        );
        await driver.executeScript("arguments[0].scrollIntoView(true);", reportsDropdown);
        await driver.sleep(500); // Brief pause for scrolling
        await driver.executeScript("arguments[0].click();", reportsDropdown);

        // Wait for dropdown animation
        await driver.sleep(1000);

        // Wait for and click the Travel Log Report link
        const travelLogReport = await waitForElementVisible(
            driver,
            By.css('a[id="aTrackReport"]')
        );
        await driver.executeScript("arguments[0].click();", travelLogReport);

        // Wait for modal animation
        await driver.sleep(1000);

        // Wait for the modal dialog with improved locator strategy
        const reportModal = await waitForElementVisible(
            driver,
            By.css('div#divTrackReport_here.modal.fade.in')
        );

        // Additional verification steps with more specific selectors
        const modalContent = await waitForElementVisible(
            driver,
            By.css('#divTrackReport_here .modal-content')
        );

        // Verify specific elements within the modal
        const modalHeader = await modalContent.findElement(By.css('.modal-header'));
        const modalBody = await modalContent.findElement(By.css('.modal-body'));

        // Verify date inputs are present
        const startDate = await modalContent.findElement(By.css('input[type="text"]'));
        const isStartDateDisplayed = await startDate.isDisplayed();
        
        if (!isStartDateDisplayed) {
            throw new Error('Date input fields not visible in modal');
        }

        return true;
    } catch (error) {
        console.error('Error in report dropdown test:', error);
        await takeErrorScreenshot(driver, error);
        throw error;
    }
}


// Utility function for taking error screenshots
async function takeErrorScreenshot(driver, error) {
    try {
        const screenshot = await driver.takeScreenshot();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `error-screenshot-${timestamp}.png`;
        require('fs').writeFileSync(fileName, screenshot, 'base64');
        console.log(`Screenshot saved as ${fileName}`);
    } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
    }
}

async function waitForElementVisible(driver, locator, timeout = 10000) {
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
}


async function testDeviceDropdown(driver) {
    try {
        // Wait for the select2 selection container to be visible
        const dropdownTrigger = await waitForElementVisible(
            driver,
            By.css('span.select2-selection.select2-selection--single')
        );
        
        // Click to open the dropdown
        await driver.executeScript("arguments[0].click();", dropdownTrigger);
        
        // Wait for dropdown to open and search field to be visible
        const searchField = await waitForElementVisible(
            driver,
            By.css('.select2-search.select2-search--dropdown input.select2-search__field')
        );
        
        // Verify dropdown is open by checking if search results container is present
        const resultsContainer = await waitForElementVisible(
            driver,
            By.css('span.select2-results')
        );
        
        // Optional: Type "Sales Car 1" into search
        await searchField.sendKeys('Sales Car 1');
        await driver.sleep(1000); // Wait for search results
        
        // Verify search results appear
        const searchResults = await waitForElementVisible(
            driver,
            By.css('ul.select2-results__options')
        );
        
        // Verify at least one option is visible
        const options = await searchResults.findElements(By.css('li.select2-results__option'));
        if (options.length === 0) {
            throw new Error('No search results found');
        }
        
        return true;
    } catch (error) {
        console.error('Error in device dropdown test:', error);
        await takeErrorScreenshot(driver, error);
        throw error;
    }
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

    // Add this to your test suite
    it('should open Travel Log Report from Reports dropdown', async function() {
        try {
            // Add an initial wait to ensure the page is fully loaded after login
            await driver.sleep(2000);
            await testReportDropdownAndTravel(driver);
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    it('should open device dropdown and show search options', async function() {
        try {
            // Initial wait for page load
            await driver.sleep(2000);
    
            // First, locate and click the select2 trigger element with the specific class shown in screenshots
            const select2Trigger = await driver.wait(
                until.elementLocated(By.css('span.select2-selection.select2-selection--single[role="combobox"]')),
                10000
            );
            await driver.wait(until.elementIsVisible(select2Trigger), 5000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", select2Trigger);
            await driver.sleep(1000);
    
            // Click to open dropdown
            await driver.executeScript("arguments[0].click();", select2Trigger);
            await driver.sleep(1500); // Increased wait time for dropdown to fully open
    
            // Wait for and verify the search container using the exact class from screenshots
            const searchContainer = await driver.wait(
                until.elementLocated(By.css('.select2-search.select2-search--dropdown')),
                10000
            );
            await driver.wait(until.elementIsVisible(searchContainer), 5000);
    
            // Find and interact with the search input
            const searchInput = await searchContainer.findElement(
                By.css('input.select2-search__field')
            );
            await searchInput.sendKeys('Sales Car 1');
            await driver.sleep(1500); // Wait for search results
    
            // Look for results using the specific classes from screenshots
            const resultsContainer = await driver.wait(
                until.elementLocated(By.css('ul.select2-results__options')),
                5000
            );
            
            // Wait for and find specific result option
            const resultOption = await driver.wait(
                until.elementLocated(By.xpath("//li[contains(text(), 'Sales Car 1')]")),
                5000
            );
            
            // Click the result
            await driver.executeScript("arguments[0].click();", resultOption);
            await driver.sleep(1000);
    
            console.log('Device dropdown test completed successfully');
            
        } catch (error) {
            console.error('Error in device dropdown test:', error);
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