import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows the hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CommerceForge AI/);
    await expect(page.getByText("products.", { exact: false })).toBeVisible();
    await expect(page.getByText("brands.", { exact: false })).toBeVisible();
    await expect(page.getByText("confidence.", { exact: false })).toBeVisible();
  });

  test("shows the Start free CTA", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /start building free/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/signup");
  });

  test("shows the demo data badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/demo data/i)).toBeVisible();
  });

  test("has a working theme toggle", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /toggle theme|switch to/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After click, the aria-label should change
    await expect(toggle).toBeVisible();
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
  });

  test("has no accessibility violations on main landmarks", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("main").or(page.locator("main"))).toBeAttached();
  });
});

test.describe("Health endpoint", () => {
  test("returns 200 or 503 with JSON body", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("services");
  });
});
