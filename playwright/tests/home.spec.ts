import {expect, test} from "@playwright/test";

test('has Title', async ({page}) => {
    await page.goto('');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("Finance Project Management");
});

test('Navigation is Visible', async ({page}) => {
    await page.goto('');

    const navigation = page.getByTestId("nav_bar")
    await expect(navigation).toBeVisible()

    const homeRoute = navigation.getByTestId("nav_home")
    await expect(homeRoute).toBeVisible()

    const settingsRoute = navigation.getByTestId("nav_home")
    await expect(settingsRoute).toBeVisible()
});

test("Has Sections", async ({page}) => {
    await page.goto('')

    const overviewSection = page.getByTestId("overview_section")
    await expect(overviewSection).toBeVisible()
    await expect(overviewSection.getByText("Overview")).toBeVisible()

    const projectSection = page.getByTestId("project_section")
    await expect(projectSection).toBeVisible()
    await expect(projectSection.getByText("Projects")).toBeVisible()
});

test("Check Number Cards", async ({page}) => {
    await page.goto('')

    const numberCards = page.getByTestId("number_card")

    await expect(numberCards).toHaveCount(4)
});

test("Check new project card", async ({page}) => {
    await page.goto('')

    const projectCard = page.getByTestId("new_project_card")

    await expect(projectCard).toBeVisible()
});
