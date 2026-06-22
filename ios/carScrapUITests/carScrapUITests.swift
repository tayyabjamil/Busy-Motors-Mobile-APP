//
//  carScrapUITests.swift
//  carScrapUITests
//
//  Created by Affan Mahboob on 10/06/2026.
//

import XCTest

class carScrapUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
    }

    func testTakeScreenshots() {
        // 01 - Login Screen
        snapshot("01_Login")

        // Tap Sign Up to get to Register screen
        let signUpButton = app.buttons["Sign Up"]
        if signUpButton.waitForExistence(timeout: 3) {
            signUpButton.tap()
            snapshot("02_Register")
            app.navigationBars.buttons.firstMatch.tap()
        }

        // Login with test credentials
        let identifier = app.textFields.firstMatch
        if identifier.waitForExistence(timeout: 3) {
            identifier.tap()
            identifier.typeText("testuser@example.com")
        }

        let password = app.secureTextFields.firstMatch
        if password.waitForExistence(timeout: 3) {
            password.tap()
            password.typeText("password123")
        }

        let loginButton = app.buttons["Log In"]
        if loginButton.waitForExistence(timeout: 3) {
            loginButton.tap()
        }

        // 03 - Car Listings (Home)
        let listView = app.collectionViews.firstMatch
        if listView.waitForExistence(timeout: 10) {
            snapshot("03_CarListings")
        }

        // 04 - Tap first car for details
        let firstCard = app.cells.firstMatch
        if firstCard.waitForExistence(timeout: 5) {
            firstCard.tap()
            snapshot("04_CarDetails")
            app.navigationBars.buttons.firstMatch.tap()
        }

        // 05 - Favourites tab
        let favouritesTab = app.tabBars.buttons["Favourites"]
        if favouritesTab.waitForExistence(timeout: 3) {
            favouritesTab.tap()
            snapshot("05_Favourites")
        }

        // 06 - Profile tab
        let profileTab = app.tabBars.buttons["Profile"]
        if profileTab.waitForExistence(timeout: 3) {
            profileTab.tap()
            snapshot("06_Profile")
        }
    }
}
