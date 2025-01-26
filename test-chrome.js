const { Builder } = import('selenium-webdriver');

(async function testChrome() {
    try {
        console.log("Starting WebDriver...");
        let driver = await new Builder().forBrowser('chrome').build();

        console.log("Opening Google...");
        await driver.get('https://www.google.com');

        console.log("Test completed successfully!");
        await driver.quit();
    } catch (error) {
        console.error("Error starting WebDriver:", error);
    }
})();
