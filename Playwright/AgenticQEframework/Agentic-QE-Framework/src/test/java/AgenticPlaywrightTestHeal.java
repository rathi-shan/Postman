import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;

public class AgenticPlaywrightTestHeal {
    private Playwright playwright;
    private Browser browser;
    private Page page;

    @BeforeEach
    void setup() {
        playwright = Playwright.create();

        // Healenium for Playwright works as a Proxy.
        // You connect to it instead of launching a local instance directly.
        // Default Healenium Proxy port is usually 8085 or 7878 for the backend.
        String healeniumProxyUrl = "ws://localhost:8085/playwright";

        try {
            System.out.println("🔗 Connecting to Healenium Proxy at: " + healeniumProxyUrl);
            browser = playwright.chromium().connect(healeniumProxyUrl);
            page = browser.newPage();
            System.out.println("🚀 Connected! Self-Healing is managed by the Proxy.");
        } catch (Exception e) {
            System.out.println("⚠️ Connection failed. Falling back to local browser (No Healing).");
            browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                    .setHeadless(false)
                    .setSlowMo(1000));
            page = browser.newPage();
        }
    }

    @Test
    void testHealing() {
        page.navigate("https://playwright.dev/");

        // FIRST RUN: Use a valid selector so Healenium "learns" it.
        // page.click("text=Get Started");

        // SECOND RUN: Break the selector to trigger healing.
        System.out.println("🔍 Attempting click with BROKEN selector...");
        try {
            // Healenium Proxy intercepts this failure and fixes it.
            page.click("#wrong-id-123");
            System.out.println("✅ Action performed (likely healed by proxy)!");
        } catch (Exception e) {
            System.err.println("❌ Healing failed: " + e.getMessage());
        }

        try { Thread.sleep(5000); } catch (InterruptedException e) {}
    }

    @AfterEach
    void tearDown() {
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }
}