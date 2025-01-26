const { Builder, By, until } = require('selenium-webdriver');

(async function loginTest() {
  // Set up WebDriver
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // Navigate to the login page
    const url = "https://example.com/login"; // Replace with your application's login URL
    await driver.get(url);

    // Maximize the browser window
    await driver.manage().window().maximize();

    // Wait for the username field to be present and enter username
    const usernameField = await driver.wait(
      until.elementLocated(By.id('username')), // Replace ID as needed
      10000
    );
    await usernameField.sendKeys('your_username'); // Replace with your username

    // Wait for the password field to be present and enter password
    const passwordField = await driver.wait(
      until.elementLocated(By.id('password')), // Replace ID as needed
      10000
    );
    await passwordField.sendKeys('your_password'); // Replace with your password

    // Wait for the login button to be clickable and click it
    const loginButton = await driver.wait(
      until.elementIsEnabled(driver.findElement(By.id('loginButton'))), // Replace ID as needed
      10000
    );
    await loginButton.click();

    // Wait for the dashboard element to confirm login success
    try {
      await driver.wait(until.elementLocated(By.id('dashboard')), 1000000); // Replace ID as needed
      console.log('Login successful!');
    } catch (error) {
      console.log('Login failed. Dashboard not found.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Quit the driver
    await driver.quit();
  }
})();
