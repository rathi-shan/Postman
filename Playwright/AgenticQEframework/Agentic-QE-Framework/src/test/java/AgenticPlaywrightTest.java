import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;
import java.util.HashMap;
import java.util.Map;

public class AgenticPlaywrightTest {
    private Playwright playwright;
    private Browser browser;
    private Page page;

    @BeforeEach
    void setup() {
        playwright = Playwright.create();

        // Switch from .connect() to .launch()
        // This bypasses Docker and the WebSocket entirely
        System.out.println("🚀 Launching Local Browser (Bypassing Docker Version Issues)...");

        browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(false) // Set to true if you don't want to see the window
                .setSlowMo(1500));   // Slows down so you can watch it

        page = browser.newPage();
    }

    @Test
    void testHealing() {
        page.navigate("https://the-internet.herokuapp.com/login");
        page.locator("button[type='submit']").click();
        System.out.println("✅ Test Finished.");
    }

    @AfterEach
    void tearDown() {
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }
}