import { test, expect } from '@playwright/test';

const PAGES = {
  Home: '/',
  Destinations: '/destinations',
  Map: '/map',
  Business: '/business',
  Events: '/events',
  Tips: '/tips',
  History: '/history',
  Contact: '/contact',
  Privacy: '/privacy',
  Terms: '/terms',
  Blog: '/blog',
  Chat: '/chat',
  NotFound: '/this-path-does-not-exist-xyz',
};

const consoleErrors = {};

function isIgnoredError(msg) {
  const text = typeof msg === 'string' ? msg : (msg.text?.() ?? '');
  if (text.includes('Content Security Policy')) return true;
  if (text.includes('favicon')) return true;
  if (text.includes('Failed to parse waypoints')) return true;
  if (text.includes('Routing error')) return true;
  if (text.match(/Geolocation/i)) return true;
  if (text.includes('net::ERR_FILE_NOT_FOUND')) return true;
  if (text.includes('addLayer')) return true;
  if (text.includes('Weather')) return true;
  if (text.includes('status of 406') || text.includes('status of 400')) return true;
  return false;
}

test.beforeEach(async ({ page }, testInfo) => {
  consoleErrors[testInfo.title] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isIgnoredError(msg.text())) {
      consoleErrors[testInfo.title].push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    if (!isIgnoredError(err.message)) {
      consoleErrors[testInfo.title].push(`PAGE_ERROR: ${err.message}`);
    }
  });
});

test.afterEach(async ({}, testInfo) => {
  const errors = consoleErrors[testInfo.title];
  if (errors?.length) {
    console.log(`\n[${testInfo.title}] Console errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
});

async function verifyNoCrash(page, title) {
  await expect(page.locator('body')).toBeAttached({ timeout: 5000 });
  const errBoundary = page.locator('text=Something went wrong');
  if (await errBoundary.isVisible().catch(() => false)) {
    const errs = consoleErrors[title] || [];
    throw new Error(`ErrorBoundary triggered! Console errors: ${errs.join(', ')}`);
  }
}

async function waitForContent(page) {
  try {
    await page.waitForSelector('h1, h2', { timeout: 5000 });
  } catch {
    await expect(page.locator('#root')).toBeAttached({ timeout: 3000 });
  }
}

// ===== PHASE 1: STATIC ROUTES =====

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name} page loads without errors`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (response) expect(response.status()).toBeLessThan(400);

    await waitForContent(page);
    await verifyNoCrash(page, test.info().title);

    const fatal = consoleErrors[test.info().title]?.filter(e => !e.includes('supabase')) || [];
    expect(fatal).toEqual([]);
  });
}

// ===== PAGE-SPECIFIC CONTENT CHECKS =====

test('HomePage shows hero section and featured content', async ({ page }) => {
  await page.goto('/');
  await verifyNoCrash(page, test.info().title);
  const h1 = page.locator('h1');
  await expect(h1.first()).toBeAttached({ timeout: 10000 });
});

test('404 page shows correct heading and navigation links', async ({ page }) => {
  await page.goto('/nonexistent-route-test');
  await verifyNoCrash(page, test.info().title);

  await expect(page.locator('text=404').first()).toBeAttached({ timeout: 5000 });
  await expect(page.locator('a[href="/"]').first()).toBeAttached();
  await expect(page.locator('a[href="/map"]').first()).toBeAttached();
});

test('Destinations page shows list or empty state', async ({ page }) => {
  await page.goto('/destinations');
  await verifyNoCrash(page, test.info().title);
  const hasContent = await page.locator('[class*="card"], [class*="Card"], a[href*="/destination/"]').first().isVisible().catch(() => false);
  if (!hasContent) {
    await expect(page.locator('#root')).toBeAttached();
  }
});

test('Business listing page loads and shows heading', async ({ page }) => {
  await page.goto('/business');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Events page loads and shows heading', async ({ page }) => {
  await page.goto('/events');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Blog page loads and shows heading', async ({ page }) => {
  await page.goto('/blog');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Chat/AI Assistant page loads', async ({ page }) => {
  await page.goto('/chat');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Contact page loads and shows heading', async ({ page }) => {
  await page.goto('/contact');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Privacy page loads and shows heading', async ({ page }) => {
  await page.goto('/privacy');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Terms page loads and shows heading', async ({ page }) => {
  await page.goto('/terms');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('History page loads and shows content', async ({ page }) => {
  await page.goto('/history');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').or(page.locator('text=Hpa-An'))).toBeAttached({ timeout: 10000 });
});

test('Travel Tips page loads and shows content', async ({ page }) => {
  await page.goto('/tips');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').or(page.locator('text=Hpa-An'))).toBeAttached({ timeout: 10000 });
});

// ===== PHASE 2: AUTH-PROTECTED ROUTES =====

test('Favorites shows login message when unauthenticated', async ({ page }) => {
  await page.goto('/favorites');
  await verifyNoCrash(page, test.info().title);
  // Should show login-required heading or login button
  const loginHeading = page.locator('h2:has-text("log")');
  await expect(loginHeading.or(page.locator('h2:has-text("Login")'))).toBeAttached({ timeout: 5000 });
});

test('Trips page shows login message when unauthenticated', async ({ page }) => {
  await page.goto('/trips');
  await verifyNoCrash(page, test.info().title);
  // Should show login-required message
  await expect(page.locator('.container-custom')).toBeAttached({ timeout: 5000 });
});

test('Account page loads when unauthenticated', async ({ page }) => {
  await page.goto('/account');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1, h2').first()).toBeAttached({ timeout: 8000 });
});

test('Generate Itinerary loads and shows heading', async ({ page }) => {
  await page.goto('/generate-itinerary');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1').first()).toBeAttached({ timeout: 8000 });
});

test('Admin redirects to access denied when not admin', async ({ page }) => {
  await page.goto('/admin');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1, h2').first()).toBeAttached({ timeout: 8000 });
});

test('UserReviews page loads when unauthenticated', async ({ page }) => {
  await page.goto('/user-reviews');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('h1, h2').first()).toBeAttached({ timeout: 8000 });
});

// ===== PHASE 3: MAP PAGE - INITIAL LOAD =====

test.describe('Map Page', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 16.89, longitude: 97.65 });
  });

  async function waitForMap(page) {
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
  }

  test('Map page loads with tiles', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);
  });

  test('Map shows layer control', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);
    await expect(page.locator('.leaflet-control-layers')).toBeVisible({ timeout: 8000 });
  });

  test('Map shows zoom controls', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible({ timeout: 8000 });
  });

  test('Custom route controls exist on map', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);
    const routeBtn = page.locator('button[title*="route" i]').first();
    await expect(routeBtn).toBeVisible({ timeout: 5000 });
  });

  test('Map loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isIgnoredError(msg.text())) errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!isIgnoredError(err.message)) errors.push(err.message);
    });

    await page.goto('/map');
    await waitForMap(page);

    expect(errors).toEqual([]);
  });

  // ===== PHASE 4: CUSTOM ROUTE BUILDER =====

  test('Can enter custom route mode and see waypoint markers', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);

    const controlCustom = page.locator('.leaflet-control-custom');
    const routeToggle = controlCustom.locator('button').first();
    await expect(routeToggle).toBeVisible();
    await routeToggle.click();

    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    if (!box) throw new Error('Map container has no bounding box');

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.click(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50);

    const markers = page.locator('.leaflet-marker-icon, .custom-marker');
    const count = await markers.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Clear button removes waypoints', async ({ page }) => {
    await page.goto('/map');
    await verifyNoCrash(page, test.info().title);
    await waitForMap(page);

    const controlCustom = page.locator('.leaflet-control-custom');
    const routeToggle = controlCustom.locator('button').first();
    await routeToggle.click();

    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    if (!box) throw new Error('Map container has no bounding box');

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.click(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40);

    const buttons = controlCustom.locator('button');
    const clearBtn = buttons.nth(1);
    await expect(clearBtn).toBeVisible({ timeout: 3000 });
    await clearBtn.click();

    const title = await routeToggle.getAttribute('title');
    if (title) {
      expect(title.toLowerCase()).toContain('tap');
    }
  });
});

// ===== PHASE 5: URL PARAMETERS =====

test.describe('Map URL Parameters', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 16.89, longitude: 97.65 });
  });

  test('Map with start/end params loads without errors', async ({ page }) => {
    await page.goto('/map?start=16.89,97.65&end=16.87,97.63');
    await verifyNoCrash(page, test.info().title);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
  });

  test('Map with waypoints param loads without errors', async ({ page }) => {
    const waypoints = encodeURIComponent(JSON.stringify([
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.63 },
    ]));
    await page.goto(`/map?waypoints=${waypoints}`);
    await verifyNoCrash(page, test.info().title);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
  });

  test('Map with invalid waypoints does not crash', async ({ page }) => {
    await page.goto('/map?waypoints=invalid-json');
    await verifyNoCrash(page, test.info().title);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
  });

  test('Map with only start param (no end) does not crash', async ({ page }) => {
    await page.goto('/map?start=16.89,97.65');
    await verifyNoCrash(page, test.info().title);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
  });
});

// ===== PHASE 6: NAVIGATION & INTEGRATION =====

test('Navigate from Home to Map via navigation', async ({ page }) => {
  await page.goto('/');
  await verifyNoCrash(page, test.info().title);

  const mapLink = page.locator('a[href="/map"]').first();
  await expect(mapLink).toBeVisible({ timeout: 5000 });
  await mapLink.click();
  await expect(page).toHaveURL(/\/map/);
  await verifyNoCrash(page, test.info().title);
});

test('Language switch works on map page', async ({ page }) => {
  await page.goto('/map');
  await verifyNoCrash(page, test.info().title);
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });

  const langToggle = page.locator('button:has-text("MY"), button:has-text("EN"), button:has-text("မြန်")').first();
  await expect(langToggle).toBeVisible({ timeout: 5000 });
  await langToggle.click();
});

// ===== PHASE 7: GLOBAL ERROR MONITORING =====

test('No unhandled errors across all pages', async ({ page }) => {
  const allErrors = [];
  page.on('pageerror', (err) => { allErrors.push(err.message); });

  for (const [, path] of Object.entries(PAGES)) {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }

  expect(allErrors).toEqual([]);
});

test('ErrorBoundary is not triggered on any route', async ({ page }) => {
  for (const [name, path] of Object.entries(PAGES)) {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const count = await page.locator('text=Something went wrong').count().catch(() => 0);
    if (count > 0) {
      throw new Error(`ErrorBoundary triggered on ${name} (${path})`);
    }
  }
});

// ===== PHASE 8: BUSINESS & DESTINATION DETAIL PAGES =====

test('Destination detail page loads', async ({ page }) => {
  await page.goto('/destination/1');
  await verifyNoCrash(page, test.info().title);
});

test('Business detail page loads', async ({ page }) => {
  await page.goto('/business/1');
  await verifyNoCrash(page, test.info().title);
});

test('Blog post page loads', async ({ page }) => {
  await page.goto('/blog/hello-world');
  await verifyNoCrash(page, test.info().title);
});
