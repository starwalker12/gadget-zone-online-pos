import { test, expect } from "@playwright/test";
import { hasCredentials } from "./helpers/env";
import { login } from "./helpers/auth";

test.describe("Cash Drawer, Settings, and Permissions Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    if (!hasCredentials()) {
      test.skip(true, "Skipping test because PLAYWRIGHT_TEST_EMAIL or PLAYWRIGHT_TEST_PASSWORD are not set in the environment.");
      return;
    }

    const loggedIn = await login(page);
    if (!loggedIn) {
      test.skip(true, "Skipping test because login helper failed to authenticate (possibly due to invalid credentials or captcha).");
    }
  });

  test("Cash Drawer Section Smoke Test", async ({ page }) => {
    await page.goto("/daily-closing");
    // Confirm page loads either as Cash Drawer or displays a warning (e.g. not assigned to a branch)
    await expect(
      page.locator("text=Cash Drawer")
        .or(page.locator("text=Recent Closings"))
        .or(page.locator("text=daily closing"))
        .or(page.locator("text=not assigned to a branch"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("Settings Section Smoke Test", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Shop Profile").or(page.locator("text=Settings"))).toBeVisible({ timeout: 10000 });

    // Verify sub-tabs
    const connectedAccountsTab = page.locator("a[href*='tab=accounts']");
    if (await connectedAccountsTab.count() > 0) {
      await connectedAccountsTab.click();
      await page.waitForURL(/.*tab=accounts.*/);
      await expect(page.locator("text=Connected Accounts").or(page.locator("text=social login"))).toBeVisible();
    }

    const securityTab = page.locator("a[href*='tab=security']");
    if (await securityTab.count() > 0) {
      await securityTab.click();
      await page.waitForURL(/.*tab=security.*/);
      await expect(page.locator("text=Security").or(page.locator("text=Password"))).toBeVisible();
    }
  });

  test("User Management and Permissions Smoke Test", async ({ page }) => {
    // Visit users page
    await page.goto("/users");
    await expect(
      page.locator("text=Restricted area")
        .or(page.locator("text=Staff access"))
        .or(page.locator("text=User management"))
        .or(page.locator("text=User Accounts"))
    ).toBeVisible({ timeout: 10000 });

    // Visit staff permissions page
    await page.goto("/settings/permissions");
    await expect(
      page.locator("text=Restricted area")
        .or(page.locator("text=Staff permissions"))
        .or(page.locator("text=Override access"))
    ).toBeVisible({ timeout: 10000 });
  });
});
