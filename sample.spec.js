import { Builder, By } from "selenium-webdriver";
import { expect } from "chai";

describe("Firefox Test", function () {
  let driver;

  // Initialize Firefox before tests
  before(async function () {
    driver = await new Builder().forBrowser("firefox").build();
  });

  // Quit Firefox after tests
  after(async function () {
    await driver.quit();
  });

  it("should open a webpage and validate the title", async function () {
    await driver.get("https://example.com");
    const title = await driver.getTitle();
    expect(title).to.equal("Example Domain");
  });
});
