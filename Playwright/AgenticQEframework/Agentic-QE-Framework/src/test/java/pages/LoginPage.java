package pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class LoginPage {
    private final Page page;

    // 1. Locators (Using the 2026 standard: Role-based locators)
    public LoginPage(Page page) {
        this.page = page;
    }

    // 2. Actions
    public void navigate() {
        page.navigate("https://www.saucedemo.com/");
    }

    public void login(String user, String pass) {
        page.getByPlaceholder("Username").fill(user);
        page.getByPlaceholder("Password").fill(pass);
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Login")).click();
    }
}