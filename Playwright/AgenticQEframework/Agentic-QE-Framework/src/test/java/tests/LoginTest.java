package tests;

import com.microsoft.playwright.*;
import org.testng.annotations.*;
import pages.LoginPage;
import java.nio.file.Paths;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class LoginTest {
    Playwright playwright;
    Browser browser;
    BrowserContext context;
    Page page;

    @BeforeClass
    void setup() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(true));

        // Instead of a standard page, we tell Healenium to watch this browser context
        context = browser.newContext();
        page = context.newPage();
    }
    @Test
    void testSuccessfulLogin() {
        // Start Tracing
        context = browser.newContext();
        context.tracing().start(new Tracing.StartOptions()
                .setScreenshots(true)
                .setSnapshots(true)
                .setSources(true));

        page = context.newPage();
        LoginPage loginPage = new LoginPage(page);

        loginPage.navigate();
        loginPage.login("standard_user", "secret_sauce");

        // Use Playwright's smart assertions
        assertThat(page).hasURL("https://www.saucedemo.com/inventory.html");

        // Stop tracing and save it
        context.tracing().stop(new Tracing.StopOptions()
                .setPath(Paths.get("trace.zip")));
    }

    @AfterClass
    void tearDown() {
        browser.close();
        playwright.close();
    }
}
