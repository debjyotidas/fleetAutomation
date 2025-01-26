import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.time.Duration;

public class DeviceWindowTests {
    private WebDriver driver;
    private WebDriverWait wait;
    
    @BeforeClass
    public void setup() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
        #  Navigate to your application URL
        driver.get("YOUR_APPLICATION_URL");
    }

    @Test
    public void testOpenAddEditDeviceWindow() {
        #  Click on Settings menu
        WebElement settingsMenu = wait.until(ExpectedConditions.elementToBeClickable(By.id("settings-menu")));
        settingsMenu.click();

        #  Click on Add/Edit Device option
        WebElement addEditDevice = wait.until(ExpectedConditions.elementToBeClickable(By.id("add-edit-device")));
        addEditDevice.click();

        #  Verify the window is opened
        WebElement deviceWindow = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div[contains(text(),'Add/Edit Device')]")));
        Assert.assertTrue(deviceWindow.isDisplayed(), "Add/Edit Device window should be visible");
    }

    @Test
    public void testAddNewDevice() {
        // Open Add/Edit Device window first
        openAddEditDeviceWindow();

        // Select Add Device radio button
        WebElement addDeviceRadio = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='radio' and @value='Add Device']")));
        addDeviceRadio.click();

        // Enter device name
        WebElement deviceNameInput = driver.findElement(By.xpath("//input[contains(@placeholder,'Device Name')]"));
        deviceNameInput.sendKeys("Test Device");

        #  Check "Show as Pulsing Icon" checkbox
        WebElement pulsingIconCheckbox = driver.findElement(By.xpath("//input[@type='checkbox']"));
        if (!pulsingIconCheckbox.isSelected()) {
            pulsingIconCheckbox.click();
        }

        #  Set pulse radius values
        WebElement sidebarPulseRadius = driver.findElement(By.xpath("//input[contains(@placeholder,'Sidebar Pulse Radius')]"));
        sidebarPulseRadius.clear();
        sidebarPulseRadius.sendKeys("20");

        WebElement mapPulseRadius = driver.findElement(By.xpath("//input[contains(@placeholder,'Map Pulse Radius')]"));
        mapPulseRadius.clear();
        mapPulseRadius.sendKeys("20");

        #  Select an icon
        WebElement vehicleIcon = driver.findElement(By.xpath("//input[@type='radio' and @name='icon-selection'][2]"));
        vehicleIcon.click();

        #  Click Update Device button
        WebElement updateButton = driver.findElement(By.xpath("//button[text()='Update Device']"));
        updateButton.click();

        #  Verify success ("add appropriate verification based on your application's behavior)
        #  For example, checking if the window closes or success message appears
    }

    @Test
    public void testEditExistingDevice() {
        #  Open Add/Edit Device window first
        openAddEditDeviceWindow();

        #  Select Edit Device radio button
        WebElement editDeviceRadio = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='radio' and @value='Edit Device']")));
        editDeviceRadio.click();

        #  Search for existing device
        WebElement searchDevice = driver.findElement(By.xpath("//input[contains(@placeholder,'Search Device')]"));
        searchDevice.sendKeys("Test Device");

        #  Modify device properties
        WebElement deviceNameInput = driver.findElement(By.xpath("//input[contains(@placeholder,'Device Name')]"));
        deviceNameInput.clear();
        deviceNameInput.sendKeys("Updated Device Name");

        #  Click Update Device button
        WebElement updateButton = driver.findElement(By.xpath("//button[text()='Update Device']"));
        updateButton.click();

        #  Verify the update was successful
    }

    @Test
    public void testRemoveDevice() {
        #  Open Add/Edit Device window first
        openAddEditDeviceWindow();

        #  Select Edit Device radio button
        WebElement editDeviceRadio = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//input[@type='radio' and @value='Edit Device']")));
        editDeviceRadio.click();

        #  Search for existing device
        WebElement searchDevice = driver.findElement(By.xpath("//input[contains(@placeholder,'Search Device')]"));
        searchDevice.sendKeys("Test Device");

        #  Click Remove Device button
        WebElement removeButton = driver.findElement(By.xpath("//button[text()='Remove Device']"));
        removeButton.click();

        #  Verify device removal (add appropriate verification)
    }

    private void openAddEditDeviceWindow() {
        WebElement settingsMenu = wait.until(ExpectedConditions.elementToBeClickable(By.id("settings-menu")));
        settingsMenu.click();
        
        WebElement addEditDevice = wait.until(ExpectedConditions.elementToBeClickable(By.id("add-edit-device")));
        addEditDevice.click();
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}