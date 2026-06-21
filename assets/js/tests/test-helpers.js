/** Shared helpers for Playwright tests. */
export async function signIn(page) {
  await page.goto("/index.html");
  await page.locator("#chLoginEmail").fill("demo@culturehive.ai");
  await page.locator("#chLoginPassword").fill("demo");
  await page.locator("#chLoginForm button[type=submit]").click();
  await page.waitForSelector("body.ch-auth-hidden", { timeout: 5000 });
}

export async function collectJsErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}
