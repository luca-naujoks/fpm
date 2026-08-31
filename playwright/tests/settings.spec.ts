import {expect, test} from "@playwright/test";

test('Settings Navigation is Visible', async ({page}) => {
    await page.goto('');

    const navigation = page.getByTestId("nav_bar")
    await expect(navigation).toBeVisible()

    const homeRoute = navigation.getByTestId("nav_home")
    await expect(homeRoute).toBeVisible()

    const settingsRoute = navigation.getByTestId("nav_home")
    await expect(settingsRoute).toBeVisible()
});

test("Check for Settings Navigation", async ({page}) => {
    await page.goto('')

    const navigationAside = page.getByTestId("settings_navigation")

    await expect(navigationAside.getByText("PROJECTS")).toBeVisible()

    await expect(navigationAside.getByTestId("general_settings_nav_button")).toBeVisible()
});

test("Check General Settings Container", async ({page}) => {
    await page.goto('')

    const container = page.getByTestId("general_settings_container")

    await expect(container).toBeVisible()

    await expect(container.getByText("General Settings")).toBeVisible()
    await expect(container.getByText("General Application Settings")).toBeVisible()
});

test("Check General Settings", async ({page}) => {
    await page.goto('')

    const container = page.getByTestId("general_settings_container")

    await expect(container).toBeVisible()
    await expect(container.getByTestId("light_mode_checkbox")).toBeVisible()
});