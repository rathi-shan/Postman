import org.testng.annotations.Test; // <--- MUST HAVE THIS

public class BookingTests {
@Test
public void automateBookingChain() {
    io.restassured.RestAssured.baseURI = "https://restful-booker.herokuapp.com";

    // 1. AUTH (Already working!)
    String token = io.restassured.RestAssured.given()
        .header("Content-Type", "application/json")
        .body("{ \"username\" : \"admin\", \"password\" : \"password123\" }")
    .when()
        .post("/auth")
    .then()
        .extract().path("token");

    // 2. CREATE BOOKING (H3-6: API Chaining)
    // We send a POST and save the 'bookingid' from the response
    int bookingId = io.restassured.RestAssured.given()
        .header("Content-Type", "application/json")
        .body("{" +
                "\"firstname\" : \"Jim\"," +
                "\"lastname\" : \"Brown\"," +
                "\"totalprice\" : 111," +
                "\"depositpaid\" : true," +
                "\"bookingdates\" : {" +
                    "\"checkin\" : \"2026-01-01\"," +
                    "\"checkout\" : \"2026-01-02\"" +
                "}," +
                "\"additionalneeds\" : \"Breakfast\"" +
            "}")
    .when()
        .post("/booking")
    .then()
        .statusCode(200)
        .extract().path("bookingid");

    System.out.println("Created Booking ID: " + bookingId);

    // 3. ASSERT JSON (H7-8: Verify the data is correct)
    io.restassured.RestAssured.given()
        .pathParam("id", bookingId) // Use the ID we just created
    .when()
        .get("/booking/{id}")
    .then()
        .statusCode(200)
        .body("firstname", org.hamcrest.Matchers.equalTo("Jim"))
        .body("totalprice", org.hamcrest.Matchers.is(111))
        .body("bookingdates.checkin", org.hamcrest.Matchers.equalTo("2026-01-01"));

    System.out.println("All Assertions Passed! The engine is working correctly.");
    
}
@Test
public void testGetNonExistentBooking() {
    // Try to get a booking ID that definitely doesn't exist
    io.restassured.RestAssured.given()
        .pathParam("id", 999999) 
    .when()
        .get("https://restful-booker.herokuapp.com/booking/{id}")
    .then()
        .statusCode(404); // Expecting Not Found
    
    System.out.println("Negative Test 1 Passed: Correctly received 404 for ghost booking.");
}

@Test
public void testUpdateWithoutAuth() {
    // Try to UPDATE (PUT) a booking without providing the required Token
    io.restassured.RestAssured.given()
        .header("Content-Type", "application/json")
        .body("{ \"firstname\" : \"Hacker\", \"lastname\" : \"Man\" }")
    .when()
        .put("https://restful-booker.herokuapp.com/booking/1")
    .then()
        .statusCode(403); // Expecting Forbidden/Unauthorized
        
    System.out.println("Negative Test 2 Passed: Correctly blocked unauthorized update with 403.");
}
}