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

    it('should add the "open" class to the parent Li element when the aBottomLast24 element is clicked', async function() {
        const aBottomLast24 = await driver.findElement(By.css('a.id="aBottomLast24"'));
        await aBottomLast24.click();
      
        const parentLi = await aBottomLast24.findElement(By.xpath('..'));
        const liClassAttribute = await parentLi.getAttribute('class');
        expect(liClassAttribute).to.include('open');
      
        const dropdownMenu = await driver.findElement(By.css('.dropdown-menu.show'));
        const displayStyle = await dropdownMenu.getCssValue('display');
        expect(displayStyle).to.equal('block');
      });
})