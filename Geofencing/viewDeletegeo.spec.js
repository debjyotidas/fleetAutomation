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

    it('should open geofencing dropdown menu and view/delete modal', async function () {
        try {
            // Add initial wait for page load
            await driver.sleep(2000); // Give extra time for page to stabilize
            
            // Wait for geofencing menu with extended timeout
            const geofencingMenu = await driver.wait(
                until.elementLocated(By.css('.GEOFENCING, #aGeofence')),
                15000
            );
            await driver.wait(until.elementIsVisible(geofencingMenu), 5000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", geofencingMenu);
            await driver.sleep(1000); // Wait for scroll
            await driver.executeScript("arguments[0].click();", geofencingMenu);
            
            // Wait for dropdown to be visible
            await driver.sleep(1000); // Wait for animation
            
            // Click View/Delete Geofences option with more robust selector
            const viewDeleteOption = await driver.wait(
                until.elementLocated(By.css('#aGeofenceView, .geofence-view-delete')),
                10000
            );
            await driver.wait(until.elementIsVisible(viewDeleteOption), 5000);
            await driver.executeScript("arguments[0].click();", viewDeleteOption);
            
            // Wait for modal with more specific selector and longer timeout
            await driver.sleep(1000); // Wait for modal animation
            const modalDialog = await driver.wait(
                until.elementLocated(By.css('#divGeofenceView .modal-dialog, .modal.fade.in .modal-dialog')),
                15000
            );
            
            // Verify modal is visible
            await driver.wait(
                until.elementIsVisible(modalDialog),
                10000
            );
            
            // Verify select element is present and visible
            const selectElement = await driver.wait(
                until.elementLocated(By.css('#divGeofenceView select, .modal.fade.in select')),
                10000
            );
            expect(await selectElement.isDisplayed()).to.be.true;
            
            // Optional: Verify modal title if needed
            const modalHeader = await modalDialog.findElement(By.css('.modal-header'));
            const headerText = await modalHeader.getText();
            console.log('Modal header text:', headerText);
            
        } catch (error) {
            console.error('Error in geofencing modal test:', error);
            console.error('Error details:', error.message);
            await takeErrorScreenshot(driver, error);
            throw error;
        }
    });

    it('should select a geofence from the dropdown', async function () {
        try {
            // Wait for and locate the select element
            const geofenceSelect = await driver.wait(
                until.elementLocated(By.css('.form-control.selGeofence')),
                10000
            );
            await driver.wait(until.elementIsVisible(geofenceSelect), 5000);

            // Click to open the dropdown
            await driver.executeScript("arguments[0].click();", geofenceSelect);
            await driver.sleep(1000); // Wait for dropdown to fully open

            // Get all options
            const options = await driver.findElements(By.css('.form-control.selGeofence option'));
            console.log(`Found ${options.length} geofence options`);

            // Select a specific geofence by index (e.g., the first non-default option)
            if (options.length > 1) {
                // Select the second option (index 1) since index 0 is usually "Select Geofence"
                const targetOption = options[2];
                const optionText = await targetOption.getText();
                console.log(`Selecting geofence: ${optionText}`);

                // Use Select class for proper dropdown handling
                await driver.executeScript(
                    "arguments[0].value = arguments[1];", 
                    geofenceSelect, 
                    await targetOption.getAttribute('value')
                );

                // Trigger change event
                await driver.executeScript(
                    "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                    geofenceSelect
                );

                // Verify selection
                const selectedValue = await geofenceSelect.getAttribute('value');
                expect(selectedValue).to.not.equal('0'); // '0' is typically the default "Select Geofence" value
                console.log(`Successfully selected geofence with value: ${selectedValue}`);
            } else {
                console.log('No geofence options available to select');
            }

        } catch (error) {
            console.error('Error in geofence selection test:', error);
            console.error('Error details:', error.message);
            await takeErrorScreenshot(driver, error);
            throw error;
        }
    })

    it('should complete geofence save workflow', async function () {
        try {
            // Wait for and select geofence from dropdown
            const geofenceSelect = await driver.wait(
                until.elementLocated(By.css('.form-control.selGeofence')),
                10000
            );
            await driver.wait(until.elementIsVisible(geofenceSelect), 5000);

            // Select a specific geofence (e.g., "Name 1 (San Ramon, CA, United States)")
            await driver.executeScript(
                "arguments[0].value = arguments[1];", 
                geofenceSelect, 
                "33" // Assuming this is the value for the desired option
            );
            await driver.executeScript(
                "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                geofenceSelect
            );

            // Click the Submit button
            const submitButton = await driver.wait(
                until.elementLocated(By.css('#btnEditGeofence')),
                10000
            );
            await driver.wait(until.elementIsVisible(submitButton), 5000);
            await driver.executeScript("arguments[0].click();", submitButton);

            // Wait for the geofence list to become visible
            const geofenceList = await driver.wait(
                until.elementLocated(By.css('.divGeofenceList')),
                10000
            );
            await driver.wait(until.elementIsVisible(geofenceList), 5000);

            // Verify the geofence list is displayed
            const displayStyle = await geofenceList.getCssValue('display');
            expect(displayStyle).to.equal('block');

            await driver.sleep(6000);

            // Click the Save image
            await driver.findElement(By.css('div[style*="width: 92px"][style*="height: 22px"] img[src*="https://maps.gstatic.com/mapfiles/transparent.png"]')).click();
    
            // Wait for save confirmation modal
            const saveConfirmationModal = await driver.wait(
                until.elementLocated(By.css('#saveConfirmation')),
                10000
            );
            await driver.wait(until.elementIsVisible(saveConfirmationModal), 5000);

            // Click the Confirm button in the save confirmation modal
            const confirmButton = await saveConfirmationModal.findElement(
                By.css('button.btn-confirm, button.btn.btn-info[type="button"]')
            );
            await driver.executeScript("arguments[0].click();", confirmButton);

            // Wait for success alert to be visible
            const successAlert = await driver.wait(
                until.elementLocated(By.css('.alert.alert-success')),
                10000
            );
            await driver.wait(until.elementIsVisible(successAlert), 5000);

            // Verify success message is displayed
            const alertText = await successAlert.getText();
            expect(alertText).to.include('Geofence updated Successfully');

            await driver.sleep(2000);

            console.log('Geofence save workflow completed successfully');

        } catch (error) {
            console.error('Error in geofence save workflow:', error);
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