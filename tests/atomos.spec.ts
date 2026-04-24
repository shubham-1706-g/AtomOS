import { expect, test } from "@playwright/test";

test("renders the AtomOS shell and opens modules", async ({ page }) => {
  await page.goto("/");

  // Complete welcome screen if shown
  const welcomeInput = page.getByPlaceholder("Enter your name");
  if (await welcomeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await welcomeInput.fill("Test User");
    await page.getByRole("button", { name: /Get Started/i }).click();
  }

  await expect(page.getByRole("heading", { name: /Good (Morning|Afternoon|Evening)/i })).toBeVisible();
  await expect(page.getByLabel("Open launcher")).toBeVisible();
  await expect(page.getByLabel("Open Files")).toBeVisible();

  await page.getByLabel("Open launcher").click();
  await expect(page.getByRole("dialog", { name: /Launcher/i })).toBeVisible();
  await page.getByPlaceholder("Search apps, files, people and more...").fill("settings");
  await page.getByRole("button", { name: /^Settings$/i }).click();
  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();

  await page.getByLabel("Show notifications").first().click();
  await expect(page.getByRole("complementary", { name: /Notifications/i })).toBeVisible();
});
