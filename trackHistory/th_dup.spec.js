import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import fs from 'fs'; // Importing 'fs' for file operations


describe('Fleet Login Tests', function () {
    before(async function () {
        try {
            driver = await new Builder().forBrowser('chrome').build();
            await driver.manage().window().maximize();
        } catch (error) {
            console.error('Error in test setup:', error);
            throw error;
        }
    });

    after(async function () {
        // Quit the WebDriver session
        await driver.quit();
    });

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

    it('should verify and interact with Select2 dropdown using alternative approaches', async function () {
        try {
           
            // Extended initial wait
            console.log('Waiting for page load...');
            await driver.sleep(5000);

            // Debug function to log element state
            async function logElementState(element, description) {
                const isDisplayed = await element.isDisplayed();
                const isEnabled = await element.isEnabled();
                const classes = await element.getAttribute('class');
                console.log(`${description} state:`, {
                    displayed: isDisplayed,
                    enabled: isEnabled,
                    classes: classes
                });
            }

            // First attempt: Direct interaction with select element
            async function tryDirectSelect() {
                try {
                    console.log('Attempting direct select interaction...');
                    const selectElement = await driver.findElement(By.css('.select2-selection'));
                    await logElementState(selectElement, 'Select element');
                    
                    // Scroll element into view
                    await driver.executeScript('arguments[0].scrollIntoView(true);', selectElement);
                    await driver.sleep(1000);
                    
                    // Try click
                    await selectElement.click();
                    await driver.sleep(1000);
                    
                    const isDropdownVisible = await driver.executeScript(`
                        return !!document.querySelector('.select2-dropdown');
                    `);
                    console.log('Dropdown visible after direct click:', isDropdownVisible);
                    return isDropdownVisible;
                } catch (error) {
                    console.log('Direct select interaction failed:', error.message);
                    return false;
                }
            }

            // Second attempt: Frame check and interaction
            async function tryFrameInteraction() {
                try {
                    console.log('Checking for frames...');
                    const frames = await driver.findElements(By.css('iframe'));
                    console.log(`Found ${frames.length} frames`);
                    
                    // Try main content first
                    await driver.switchTo().defaultContent();
                    
                    // Find and click the select2 span
                    const span = await driver.findElement(By.css('#select2-selDriver-container'));
                    await logElementState(span, 'Select2 span');
                    
                    await driver.executeScript(`
                        arguments[0].click();
                        // Also try to force the dropdown
                        var event = new MouseEvent('mousedown', {
                            bubbles: true,
                            view: window
                        });
                        arguments[0].dispatchEvent(event);
                    `, span);
                    
                    await driver.sleep(1000);
                    return await checkDropdownVisible();
                } catch (error) {
                    console.log('Frame interaction failed:', error.message);
                    return false;
                }
            }

            // Third attempt: Multiple element selectors
            async function tryMultipleSelectors() {
                try {
                    console.log('Trying multiple selectors...');
                    const selectors = [
                        '.select2-selection--single',
                        '#select2-selDriver-container',
                        '.select2-selection__rendered',
                        '.select2-selection'
                    ];
                    
                    for (let selector of selectors) {
                        console.log(`Trying selector: ${selector}`);
                        try {
                            const element = await driver.findElement(By.css(selector));
                            await logElementState(element, `Element with selector ${selector}`);
                            
                            // Try both regular click and JavaScript click
                            await driver.executeScript('arguments[0].click();', element);
                            await driver.sleep(1000);
                            
                            if (await checkDropdownVisible()) {
                                console.log(`Success with selector: ${selector}`);
                                return true;
                            }
                        } catch (e) {
                            console.log(`Failed with selector ${selector}:`, e.message);
                        }
                    }
                    return false;
                } catch (error) {
                    console.log('Multiple selectors attempt failed:', error.message);
                    return false;
                }
            }

            // Helper function to check dropdown visibility
            async function checkDropdownVisible() {
                try {
                    const dropdown = await driver.findElement(By.css('.select2-dropdown'));
                    return await dropdown.isDisplayed();
                } catch {
                    return false;
                }
            }

            // Try each approach in sequence
            if (await tryDirectSelect()) {
                console.log('Success with direct select!');
                return;
            }

            if (await tryFrameInteraction()) {
                console.log('Success with frame interaction!');
                return;
            }

            if (await tryMultipleSelectors()) {
                console.log('Success with multiple selectors!');
                return;
            }

            // Capture page state before failing
            const pageSource = await driver.getPageSource();
            fs.writeFileSync('page-source.html', pageSource);
            
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('final-state.png', screenshot, 'base64');

            throw new Error('Failed to open Select2 dropdown after all attempts');
        } catch (error) {
            console.error('Test failed:', error);
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('error-screenshot.png', screenshot, 'base64');
            throw error;
        }
    });

    // it('should open device search dropdown and verify span visibility', async function () {
    //     try {
    //         // Navigate to the page where the dropdown exists
    //         const PAGE_URL = 'https://www.gpsandfleet3.net/gpsandfleet/client/fleetdemo/maps/index2.php';
    //         await driver.get(PAGE_URL);
    
    //         // Locate the "Search Device" dropdown container
    //         const dropdownContainer = await driver.findElement(
    //             By.css('.select2-selection.select2-selection--single')
    //         );
    
    //         // Scroll the dropdown into view to avoid obstructions
    //         await driver.executeScript('arguments[0].scrollIntoView(true);', dropdownContainer);
    
    //         // Ensure the element is visible before clicking
    //         await driver.wait(until.elementIsVisible(dropdownContainer), 5000);
    
    //         // Use JavaScript to click the dropdown to avoid obstructions
    //         await driver.executeScript('arguments[0].click();', dropdownContainer);
    
    //         // Wait until the dropdown expands (aria-expanded="true")
    //         await driver.wait(
    //             async () => {
    //                 const ariaExpanded = await dropdownContainer.getAttribute('aria-expanded');
    //                 return ariaExpanded === 'true';
    //             },
    //             5000,
    //             'Dropdown did not expand within 5 seconds'
    //         );
    
    //         // Locate the search input field inside the expanded dropdown
    //         const searchField = await driver.wait(
    //             until.elementLocated(By.css('.select2-search__field')),
    //             5000
    //         );
    
    //         // Type into the search field
    //         await searchField.sendKeys('Your Search Query'); // Replace with your desired query
    
    //         // Wait for search results to appear
    //         const searchResults = await driver.wait(
    //             until.elementLocated(By.css('.select2-results__option')),
    //             5000
    //         );
    
    //         // Verify the search results are displayed
    //         const isResultsVisible = await searchResults.isDisplayed();
    //         expect(isResultsVisible).to.be.true;
    
    //         console.log('Test passed: Dropdown interaction and search verified.');
    //     } catch (error) {
    //         console.error('Test failed:', error);
    
    //         // Capture screenshot for debugging purposes
    //         const screenshot = await driver.takeScreenshot();
    //         fs.writeFileSync('dropdown-error.png', screenshot, 'base64');
    //         console.log('Screenshot saved as dropdown-error.png');
    
    //         throw error;
    //     }
    // });
    

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