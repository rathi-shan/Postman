```gherkin
Feature: Apply PREMIUM15 Discount Coupon at Checkout
  As a premium user of the e-commerce app
  I want to apply a 15% discount coupon code (PREMIUM15) at checkout
  So that I can save money on my order

  Background:
    Given the e-commerce application is running
    And the coupon code "PREMIUM15" exists in the system with a 15% discount

  # =====================
  # HAPPY PATH SCENARIOS
  # =====================

  Scenario: Premium user successfully applies PREMIUM15 coupon to an eligible cart
    Given I am logged in as a user with "Premium" account status
    And my cart contains the following non-clearance items:
      | Item          | Price  |
      | Running Shoes | $80.00 |
      | Water Bottle  | $20.00 |
    And my cart subtotal is $100.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be accepted
    And a 15% discount of $15.00 should be applied to my order
    And my new order total should be $85.00

  Scenario: Premium user successfully applies PREMIUM15 coupon to a cart at the minimum threshold
    Given I am logged in as a user with "Premium" account status
    And my cart contains the following non-clearance items:
      | Item       | Price  |
      | Yoga Mat   | $50.00 |
    And my cart subtotal is exactly $50.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be accepted
    And a 15% discount of $7.50 should be applied to my order
    And my new order total should be $42.50

  Scenario: Premium user applies PREMIUM15 coupon to a mixed cart where only non-clearance items are discounted
    Given I am logged in as a user with "Premium" account status
    And my cart contains the following items:
      | Item            | Price  | Status    |
      | Denim Jacket    | $60.00 | Regular   |
      | Clearance Shirt | $15.00 | Clearance |
    And my cart subtotal is $75.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be accepted
    And the 15% discount should be applied only to the "Denim Jacket" for a discount of $9.00
    And the "Clearance Shirt" price should remain unchanged at $15.00
    And my new order total should be $66.00

  # ==============================
  # SAD PATH / EDGE CASE SCENARIOS
  # ==============================

  Scenario: Guest user is denied the PREMIUM15 coupon when not logged in
    Given I am not logged in to the application
    And I have non-clearance items in my cart totaling $100.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be rejected
    And I should see the error message "Please log in to apply this coupon code."
    And no discount should be applied to my order

  Scenario: Standard (non-premium) user is denied the PREMIUM15 coupon
    Given I am logged in as a user with "Standard" account status
    And my cart contains non-clearance items totaling $100.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be rejected
    And I should see the error message "This coupon is only available to Premium account holders."
    And no discount should be applied to my order

  Scenario: Premium user is denied the PREMIUM15 coupon when cart value is below the minimum threshold
    Given I am logged in as a user with "Premium" account status
    And my cart contains the following non-clearance items:
      | Item      | Price  |
      | Socks     | $10.00 |
      | Headband  | $15.00 |
    And my cart subtotal is $25.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be rejected
    And I should see the error message "A minimum cart value of $50.00 is required to use this coupon."
    And no discount should be applied to my order

  Scenario: Premium user is denied the PREMIUM15 coupon when cart value is one cent below the minimum threshold
    Given I am logged in as a user with "Premium" account status
    And my cart contains non-clearance items totaling $49.99
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be rejected
    And I should see the error message "A minimum cart value of $50.00 is required to use this coupon."
    And no discount should be applied to my order

  Scenario: Premium user attempts to apply PREMIUM15 coupon to a cart containing only clearance items
    Given I am logged in as a user with "Premium" account status
    And my cart contains only clearance items:
      | Item              | Price  | Status    |
      | Clearance Jacket  | $55.00 | Clearance |
      | Clearance Shoes   | $45.00 | Clearance |
    And my cart subtotal is $100.00
    When I enter the coupon code "PREMIUM15" at checkout
    Then the coupon should be rejected
    And I should see the error message "The coupon code PREMIUM15 cannot be applied to clearance items."
    And no discount should be applied to my order

  Scenario: Premium user enters an invalid or misspelled coupon code
    Given I am logged in as a user with "Premium" account status
    And my cart contains non-clearance items totaling $100.00
    When I enter the coupon code "PREMIUM20" at checkout
    Then the coupon should be rejected
    And I should see the error message "The coupon code entered is invalid."
    And no discount should be applied to my order

  Scenario: Premium user attempts to apply the PREMIUM15 coupon code more than once in the same order
    Given I am logged in as a user with "Premium" account status
    And my cart contains non-clearance items totaling $100.00
    And I have already successfully applied the coupon code "PREMIUM15"
    When I attempt to apply the coupon code "PREMIUM15" again
    Then the second application should be rejected
    And I should see the error message "This coupon code has already been applied to your order."
    And the discount should remain at 15% applied only once
```