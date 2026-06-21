import { test, expect } from "@playwright/test";

async function signIn(page) {
  await page.goto("/index.html");
  await page.locator("#chLoginEmail").fill("demo@culturehive.ai");
  await page.locator("#chLoginPassword").fill("demo");
  await page.locator("#chLoginForm button[type=submit]").click();
  await expect(page.locator("#chWorkspaceApp")).not.toHaveClass(/d-none/);
}

function sidebarNav(page, key) {
  return page.locator(`.ch-sidebar a[data-ch-nav="${key}"]`).first();
}

function dockFab(page) {
  return page.locator(".ch-ai-dock__fab[data-ch-ai-dock-expand]");
}

test.describe("Culture Hive prototype", () => {
  test("loads home without JS errors after sign-in", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await signIn(page);
    await expect(page.locator("#chDashboardGreeting")).toBeVisible();
    await page.waitForTimeout(500);
    expect(errors, errors.join("; ")).toEqual([]);
  });

  test("sidebar collapse toggles and persists", async ({ page }) => {
    await signIn(page);
    const toggle = page.locator("[data-ch-sidebar-toggle]").first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
    await page.reload();
    await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
  });

  test("collapsed sidebar does not replay transition class after navigation", async ({ page }) => {
    await signIn(page);
    await page.locator("[data-ch-sidebar-toggle]").first().click();
    await sidebarNav(page, "analyses").click();
    await page.waitForURL(/analyses\/index\.html/);
    await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
    await expect(page.locator("body")).not.toHaveClass(/ch-sidebar--restoring/);
  });

  test("mobile nav drawer opens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await page.locator('[data-bs-toggle="offcanvas"][data-bs-target="#chNavDrawer"]').click();
    await expect(page.locator("#chNavDrawer")).toHaveClass(/show/);
  });

  test("navigates between key workspace pages", async ({ page }) => {
    await signIn(page);
    await sidebarNav(page, "analyses").click();
    await expect(page).toHaveURL(/analyses\/index\.html/);
    await sidebarNav(page, "audiences").click();
    await expect(page).toHaveURL(/audiences\.html/);
    await sidebarNav(page, "activations").click();
    await expect(page).toHaveURL(/activations\.html/);
  });

  test("Cultura AI dock expands", async ({ page }) => {
    await signIn(page);
    const fab = dockFab(page);
    await expect(fab).toBeVisible();
    await fab.click();
    await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
    await expect(page.locator("#chCopilotInput")).toBeVisible();
  });

  test("chat dock accepts a demo message", async ({ page }) => {
    await signIn(page);
    await dockFab(page).click();
    await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
    await page.locator('[data-ch-copilot-prompt="Explain how CRS scoring works"]').click();
    await expect(page.locator("#chCopilotThread .ch-chat-bubble-user")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#chCopilotThread .ch-chat-bubble-assistant")).toBeVisible({ timeout: 12000 });
  });

  test("Cultura AI icon present on analyses detail", async ({ page }) => {
    await signIn(page);
    await page.goto("/analyses/espn-detail.html");
    await dockFab(page).click();
    await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
    await page.locator('[data-ch-copilot-prompt="Explain why this scored 82"]').click();
    await expect(page.locator("#chCopilotThread .ch-chat-author__avatar")).toHaveAttribute(
      "src",
      /cultura-icon\.png/,
      { timeout: 12000 }
    );
  });
});
