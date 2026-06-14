import { test, expect } from "@playwright/test";
import { hasCredentials } from "./helpers/env";
import { login } from "./helpers/auth";

test.describe("Customers, Products, Expenses, and Suppliers Smoke Tests", () => {
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

  test("Customers Section Smoke Test", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.locator("text=Total customers").or(page.locator("text=Customer Management"))).toBeVisible({ timeout: 10000 });
    
    // Verify search input or search label is visible
    const searchHeader = page.locator("text=Search");
    await expect(searchHeader).toBeVisible();

    // If there is at least one customer, click edit/view detail page
    const firstCustomerLink = page.locator("a[href^='/customers/']").first();
    if (await firstCustomerLink.count() > 0) {
      await firstCustomerLink.click();
      await page.waitForURL(/.*\/customers\/.+/);
      await expect(page.locator("text=Customer Details").or(page.locator("text=Ledger")).or(page.locator("text=Statement"))).toBeVisible();
    }
  });

  test("Products Section Smoke Test", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("text=Active products").or(page.locator("text=Catalog"))).toBeVisible({ timeout: 10000 });

    // Verify Tab navigation
    // Click Categories tab
    const categoriesTabLink = page.locator("a[href*='tab=categories']");
    await expect(categoriesTabLink).toBeVisible();
    await categoriesTabLink.click();
    await page.waitForURL(/.*tab=categories.*/);
    await expect(page.locator("text=Active categories").or(page.locator("text=Category"))).toBeVisible();

    // Click Suppliers tab
    const suppliersTabLink = page.locator("a[href*='tab=suppliers']");
    await expect(suppliersTabLink).toBeVisible();
    await suppliersTabLink.click();
    await page.waitForURL(/.*tab=suppliers.*/);
    await expect(page.locator("text=Active suppliers").or(page.locator("text=Supplier"))).toBeVisible();

    // Click Products tab
    const productsTabLink = page.locator("a[href*='tab=products']");
    await expect(productsTabLink).toBeVisible();
    await productsTabLink.click();
    await page.waitForURL(/.*tab=products.*/);
    await expect(page.locator("text=Active products").or(page.locator("text=Catalog"))).toBeVisible();
  });

  test("Expenses Section Smoke Test", async ({ page }) => {
    await page.goto("/expenses");
    await expect(page.locator("text=Today expenses").or(page.locator("text=All expenses"))).toBeVisible({ timeout: 10000 });
  });

  test("Suppliers Section Smoke Test", async ({ page }) => {
    // Visit Dues page
    await page.goto("/suppliers/dues");
    await expect(page.locator("text=Total supplier dues").or(page.locator("text=Supplier dues"))).toBeVisible({ timeout: 10000 });

    // Visit Purchases page
    await page.goto("/suppliers/purchases");
    await expect(page.locator("text=Purchases this month").or(page.locator("text=Supplier Purchases"))).toBeVisible({ timeout: 10000 });
  });
});
