```gherkin
Feature: Biometric Bi-weekly Authentication Bypass Lockout
  As a mobile banking user
  I want the application to automatically lock my account after 3 consecutive failed FaceID attempts
  So that my financial data remains secure against unauthorized biometric access

  # ============================================================
  # HAPPY PATH SCENARIOS
  # ============================================================

  Scenario: Successful FaceID login on first attempt clears any prior failed attempt counter
    Given a registered mobile banking user with FaceID enabled
    And the user has 1 previously recorded failed FaceID attempt
    When the user successfully authenticates via FaceID
    Then the user should be granted access to the mobile banking dashboard
    And the consecutive failed FaceID attempt counter should be reset to 0
    And no lockout warning push notification should be dispatched

  Scenario: Successful FaceID login on second attempt after one failure grants access and resets counter
    Given a registered mobile banking user with FaceID enabled
    And the user has 1 previously recorded failed FaceID attempt
    When the user successfully authenticates via FaceID on the next attempt
    Then the user should be granted full access to the mobile banking application
    And the consecutive failed FaceID attempt counter should be reset to 0
    And the account status should remain "active" and unlocked

  Scenario: Administrator successfully unlocks a locked account via the secure admin dashboard
    Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    And a system administrator is authenticated on the secure admin dashboard
    When the administrator locates the locked user profile
    And the administrator applies a manual override unlock action on the profile
    Then the user account status should be updated to "active" and unlocked
    And the consecutive failed FaceID attempt counter should be reset to 0
    And the lockout timer should be cleared immediately regardless of remaining duration
    And an audit log entry should be recorded capturing the administrator ID, timestamp, and action taken

  Scenario: Account lockout expires automatically after exactly 15 minutes and user can authenticate
    Given a mobile banking user account was locked due to 3 consecutive failed FaceID attempts
    And exactly 15 minutes have elapsed since the lockout was imposed
    When the user attempts FaceID authentication
    Then the account should be automatically unlocked
    And the user should be permitted to attempt FaceID authentication again
    And the consecutive failed FaceID attempt counter should be reset to 0

  # ============================================================
  # SAD PATH / EDGE CASE SCENARIOS
  # ============================================================

  Scenario: Warning push notification is dispatched on exactly the 2nd consecutive failed FaceID attempt
    Given a registered mobile banking user with FaceID enabled
    And the user has 1 previously recorded failed FaceID attempt
    And the user has push notifications enabled on their device
    When the user fails FaceID authentication for the 2nd consecutive time
    Then the user should NOT be locked out of the account
    And a warning push notification should be dispatched immediately to the user's registered device
    And the push notification message should warn the user that one more failed attempt will lock the account
    And the consecutive failed FaceID attempt counter should be incremented to 2

  Scenario: Account is locked immediately and precisely on the 3rd consecutive failed FaceID attempt
    Given a registered mobile banking user with FaceID enabled
    And the user has 2 previously recorded consecutive failed FaceID attempts
    When the user fails FaceID authentication for the 3rd consecutive time
    Then the account should be locked immediately
    And the user should be denied access to the mobile banking application
    And an account lockout push notification should be dispatched to the user's registered device
    And the lockout duration should be set to exactly 15 minutes from the moment of the 3rd failure
    And the consecutive failed FaceID attempt counter should reflect 3 failed attempts

  Scenario: Account remains locked if user attempts FaceID authentication before the 15-minute lockout expires
    Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    And only 14 minutes and 59 seconds have elapsed since the lockout was imposed
    When the user attempts FaceID authentication
    Then the authentication attempt should be rejected without processing the biometric scan
    And the user should be presented with a lockout message indicating the remaining lockout time
    And the account should remain in a locked state
    And the lockout timer should NOT be reset by this attempt

  Scenario: No push notification is dispatched on the 1st consecutive failed FaceID attempt
    Given a registered mobile banking user with FaceID enabled
    And the user has 0 previously recorded failed FaceID attempts
    When the user fails FaceID authentication for the 1st consecutive time
    Then the user should NOT be locked out of the account
    And no warning push notification should be dispatched
    And the consecutive failed FaceID attempt counter should be incremented to 1
    And the user should be permitted to retry FaceID authentication

  Scenario: Failed attempt counter does not increment during an active lockout period
    Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    And the lockout timer shows 10 minutes remaining
    When the user attempts FaceID authentication and it is rejected due to the active lockout
    Then the consecutive failed FaceID attempt counter should remain at 3
    And the lockout expiry time should NOT be extended
    And no additional push notification should be dispatched for this blocked attempt

  Scenario: Unauthorized administrator cannot perform a manual unlock override from the admin dashboard
    Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    And a user with non-administrator credentials attempts to access the secure admin dashboard
    When the unauthorized user attempts to apply a manual override unlock action on the locked profile
    Then the override action should be denied
    And the user account should remain locked
    And a security violation event should be logged capturing the unauthorized access attempt
    And the legitimate account lockout state and timer should remain unchanged

  Scenario: Consecutive failed attempt counter resets after a non-consecutive failure separated by a successful login
    Given a registered mobile banking user with FaceID enabled
    And the user has 2 previously recorded consecutive failed FaceID attempts
    When the user successfully authenticates via FaceID
    And subsequently the user fails FaceID authentication once
    Then the consecutive failed FaceID attempt counter should be set to 1
    And no account lockout should be triggered
    And no warning push notification should be dispatched for this single non-consecutive failure
```