# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prototype.spec.js >> Culture Hive prototype >> Cultura AI icon present on analyses detail
- Location: tests/e2e/prototype.spec.js:83:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('#chCopilotThread .ch-chat-author__avatar')
Expected pattern: /cultura-icon\.png/
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" with timeout 12000ms
  - waiting for locator('#chCopilotThread .ch-chat-author__avatar')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- complementary:
  - link "Culture Hive home":
    - /url: ../index.html
  - navigation "Primary navigation":
    - list:
      - listitem:
        - link "Home":
          - /url: ../index.html
      - listitem:
        - link "Analyses":
          - /url: index.html
      - listitem:
        - link "Audiences":
          - /url: ../audiences.html
      - listitem:
        - link "Activations":
          - /url: ../activations.html
      - listitem:
        - link "Library":
          - /url: ../library.html
      - listitem:
        - link "Settings":
          - /url: ../settings.html
  - text: Nate Chandra Free Plan
  - link "Upgrade Plan":
    - /url: ../settings.html#plan
- banner:
  - button "Collapse sidebar" [expanded]
  - group "History":
    - button "Back"
    - button "Forward" [disabled]
  - button "Jump to page (Command K)":
    - text: Jump to…
    - 'group "Keyboard shortcut: Control or Command K"': Cmd K
  - button "Account menu"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Analyses":
          - /url: index.html
      - listitem: / ESPN.com Evaluation
  - heading "ESPN.com Evaluation" [level=1]
  - text: Completed Domain www.espn.com Latino Millennial Sports Fans Completed Jun 4, 2026 Requested by User
  - paragraph:
    - strong: "Prompt:"
    - text: Give me CRS for www.espn.com
  - button "Create Activation"
  - button "Ask Cultura AI"
  - button "More actions"
  - text: 82 Strong cultural relevance ESPN.com resonates with Latino millennial sports fans through bilingual coverage, athlete storytelling, and community-driven commentary. 82 of 100
  - button "Score breakdown"
  - tablist:
    - tab "Overview" [selected]
    - tab "Audience"
    - tab "Inventory"
    - tab "Blueprint"
    - tab "Campaign Plan"
    - tab "Activation"
    - tab "History"
  - tabpanel "Overview":
    - region "Recommendations":
      - heading "Recommendations" [level=2]
      - term: Most relevant to
      - definition: Latino Millennial Sports Fans
      - term: Suggested action
      - definition: Elevate with bilingual and intersectional content; curate Spanish-language sports inventory.
      - term: Impact potential
      - definition: High engagement and brand affinity with targeted cultural enhancements.
    - region "Score breakdown":
      - heading "Score breakdown" [level=2]
      - text: 82 of 100
      - list "CRS dimensions and point contributions":
        - listitem:
          - heading "Audience Alignment" [level=3]
          - text: "+32"
          - paragraph: Strong overlap with Latino millennial sports interests, bilingual content, and athlete narratives.
          - text: 32 / 40
          - button "View evidence"
        - listitem:
          - heading "Ownership & Authenticity" [level=3]
          - text: "+20"
          - paragraph: Credible sports authority with growing Spanish-language verticals and community features.
          - text: 20 / 25
          - button "View evidence"
        - listitem:
          - heading "Editorial/UX Signals" [level=3]
          - text: "+18"
          - paragraph: Mobile-first layout, highlight clips, and personalized team feeds support daily rituals.
          - text: 18 / 25
          - button "View evidence"
        - listitem:
          - heading "Intersectional Representation" [level=3]
          - text: "+12"
          - paragraph: Coverage spans soccer, baseball, and basketball with Latino athlete spotlights; visibility for women and LGBTQ+ athletes is improving but uneven.
          - text: 12 / 15
          - button "View evidence"
      - text: Total CRS 82
    - heading "Campaign context" [level=2]
    - term: Culture / Subculture
    - definition: Latino Millennial Sports Fans
    - term: Psychographics
    - definition: Passionate about sports, mobile-first, bilingual or English-dominant with cultural affinity.
    - term: Sociodemographics
    - definition: Urban, middle-income, family-oriented; concentrated in Southwest US, California, and Texas.
    - heading "Stereotype & authenticity flags" [level=2]
    - paragraph: No significant stereotypes detected in editorial coverage or brand positioning for this evaluation.
    - paragraph: ESPN shows sustained Latino athlete narratives and bilingual pathways rather than token representation.
    - region "Recommended next steps":
      - heading "Recommended next steps" [level=2]
      - list:
        - listitem:
          - button "Review audience persona Diego Ramirez profile"
        - listitem:
          - button "Curate inventory 13 domains selected"
        - listitem:
          - button "Review blueprint Client-ready report"
        - listitem:
          - button "Customize campaign plan Budget and geo mix"
        - listitem:
          - button "Create activation Send to DSP"
    - region "Ask Cultura AI":
      - heading "Ask Cultura AI" [level=2]
      - button "Explain why this scored 82"
      - button "What would improve the score?"
      - button "Summarize for a client"
      - button "What are the top risks?"
  - region "Feedback":
    - heading "Feedback" [level=2]
    - paragraph:
      - text: If you notice any missed cultural nuance or have suggestions for improvement, please share feedback to enhance future evaluations. You can also email
      - link "info@culturehivemedia.com":
        - /url: mailto:info@culturehivemedia.com
      - text: .
    - button "Submit Feedback"
- region "Cultura AI":
  - text: Cultura AI
  - button "Start new chat (no messages yet)": New chat
  - button "Expand chat panel": Expand
  - button "Close chat"
  - text: Ask Cultura AI
  - textbox "Ask Cultura AI":
    - /placeholder: Ask about CRS scores, cultural fit, or recommendations…
  - button "Ask" [disabled]
  - button "Ask Cultura AI"
```

```
Error: write EPIPE
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | async function signIn(page) {
  4  |   await page.goto("/index.html");
  5  |   await page.locator("#chLoginEmail").fill("demo@culturehive.ai");
  6  |   await page.locator("#chLoginPassword").fill("demo");
  7  |   await page.locator("#chLoginForm button[type=submit]").click();
  8  |   await expect(page.locator("#chWorkspaceApp")).not.toHaveClass(/d-none/);
  9  | }
  10 | 
  11 | function sidebarNav(page, key) {
  12 |   return page.locator(`.ch-sidebar a[data-ch-nav="${key}"]`).first();
  13 | }
  14 | 
  15 | function dockFab(page) {
  16 |   return page.locator(".ch-ai-dock__fab[data-ch-ai-dock-expand]");
  17 | }
  18 | 
  19 | test.describe("Culture Hive prototype", () => {
  20 |   test("loads home without JS errors after sign-in", async ({ page }) => {
  21 |     const errors = [];
  22 |     page.on("pageerror", (e) => errors.push(e.message));
  23 |     await signIn(page);
  24 |     await expect(page.locator("#chDashboardGreeting")).toBeVisible();
  25 |     await page.waitForTimeout(500);
  26 |     expect(errors, errors.join("; ")).toEqual([]);
  27 |   });
  28 | 
  29 |   test("sidebar collapse toggles and persists", async ({ page }) => {
  30 |     await signIn(page);
  31 |     const toggle = page.locator("[data-ch-sidebar-toggle]").first();
  32 |     await expect(toggle).toBeVisible();
  33 |     await toggle.click();
  34 |     await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
  35 |     await page.reload();
  36 |     await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
  37 |   });
  38 | 
  39 |   test("collapsed sidebar does not replay transition class after navigation", async ({ page }) => {
  40 |     await signIn(page);
  41 |     await page.locator("[data-ch-sidebar-toggle]").first().click();
  42 |     await sidebarNav(page, "analyses").click();
  43 |     await page.waitForURL(/analyses\/index\.html/);
  44 |     await expect(page.locator("body")).toHaveClass(/ch-sidebar-collapsed/);
  45 |     await expect(page.locator("body")).not.toHaveClass(/ch-sidebar--restoring/);
  46 |   });
  47 | 
  48 |   test("mobile nav drawer opens", async ({ page }) => {
  49 |     await page.setViewportSize({ width: 390, height: 844 });
  50 |     await signIn(page);
  51 |     await page.locator('[data-bs-toggle="offcanvas"][data-bs-target="#chNavDrawer"]').click();
  52 |     await expect(page.locator("#chNavDrawer")).toHaveClass(/show/);
  53 |   });
  54 | 
  55 |   test("navigates between key workspace pages", async ({ page }) => {
  56 |     await signIn(page);
  57 |     await sidebarNav(page, "analyses").click();
  58 |     await expect(page).toHaveURL(/analyses\/index\.html/);
  59 |     await sidebarNav(page, "audiences").click();
  60 |     await expect(page).toHaveURL(/audiences\.html/);
  61 |     await sidebarNav(page, "activations").click();
  62 |     await expect(page).toHaveURL(/activations\.html/);
  63 |   });
  64 | 
  65 |   test("Cultura AI dock expands", async ({ page }) => {
  66 |     await signIn(page);
  67 |     const fab = dockFab(page);
  68 |     await expect(fab).toBeVisible();
  69 |     await fab.click();
  70 |     await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
  71 |     await expect(page.locator("#chCopilotInput")).toBeVisible();
  72 |   });
  73 | 
  74 |   test("chat dock accepts a demo message", async ({ page }) => {
  75 |     await signIn(page);
  76 |     await dockFab(page).click();
  77 |     await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
  78 |     await page.locator('[data-ch-copilot-prompt="Explain how CRS scoring works"]').click();
  79 |     await expect(page.locator("#chCopilotThread .ch-chat-bubble-user")).toBeVisible({ timeout: 5000 });
  80 |     await expect(page.locator("#chCopilotThread .ch-chat-bubble-assistant")).toBeVisible({ timeout: 12000 });
  81 |   });
  82 | 
  83 |   test("Cultura AI icon present on analyses detail", async ({ page }) => {
  84 |     await signIn(page);
  85 |     await page.goto("/analyses/espn-detail.html");
  86 |     await dockFab(page).click();
  87 |     await expect(page.locator("#chAiDock")).toHaveClass(/ch-ai-dock--expanded/);
  88 |     await page.locator('[data-ch-copilot-prompt="Explain why this scored 82"]').click();
> 89 |     await expect(page.locator("#chCopilotThread .ch-chat-author__avatar")).toHaveAttribute(
     |     ^ Error: write EPIPE
  90 |       "src",
  91 |       /cultura-icon\.png/,
  92 |       { timeout: 12000 }
  93 |     );
  94 |   });
  95 | });
  96 | 
```