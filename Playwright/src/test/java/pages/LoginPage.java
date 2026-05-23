package pages;

import com.microsoft.playwright.Page;

public class LoginPage {
	
	private Page page;
	private final String usernameTextbox = "input[name='username']";
	private final String passwordTextbox = "input[name='password']";
	private final String loginButton = "button[type='submit']";
	
	public LoginPage(Page page) {
		this.page = page;
	}
	
	public void addUsername(String username) {
		page.fill(usernameTextbox, username);
	}
	
	public void addPassword(String password) {
		page.fill(passwordTextbox, password);
	}
	
	public void clickLoginButton() {
		page.click(loginButton);
	}
	
	public void login(String username, String password) {
		page.fill(usernameTextbox, username);
		page.fill(passwordTextbox, password);
		page.click(loginButton);
	}
	
	

}
