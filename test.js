const { Builder, By, Key, until } = require('selenium-webdriver');

(async function example() {
    // Set up the WebDriver (use "chrome" or "firefox" as per your preference)
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Open a website
        await driver.get('https://www.google.com');
        
        // Find the search box and input a query
        await driver.findElement(By.name('q')).sendKeys('Selenium WebDriver', Key.RETURN);
        
        // Wait for the results to load
        await driver.wait(until.titleContains('Selenium WebDriver'), 5000);
    } finally {
        // Close the browser
        await driver.quit();
    }
})();
