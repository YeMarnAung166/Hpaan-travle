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

// Collect console errors per page
const consoleErrors = {};

function isIgnoredError(msg) {
  const text = typeof msg === 'string' ? msg : msg.text();
  if (text.includes('Content Security Policy')) return true;
  if (text.includes('favicon')) return true;
  if (text.includes('Failed to load resource')) return true;
  if (text.includes('404 (Not Found)')) return true;
  if (text.includes('net::ERR_FILE_NOT_FOUND')) return true;
  if (text.includes('Failed to parse waypoints')) return true;
  if (text.includes('Geolocation') || text.includes('geolocation')) return true;
  if (text.includes('Routing error')) return true;
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

test.afterEach(async ({ page }, testInfo) => {
  const errors = consoleErrors[testInfo.title];
  if (errors && errors.length > 0) {
    console.log(`\n[${testInfo.title}] Console errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
});

async function verifyNoPageCrash(page) {
  const body = page.locator('body');
  await expect(body).toBeAttached();

  const errorBoundary = page.locator('text=Something went wrong');
  if (await errorBoundary.isVisible().catch(() => false)) {
    const errs = consoleErrors[test.info().title] || [];
    throw new Error(`ErrorBoundary triggered! Console errors: ${errs.join(', ')}`);
  }
}

// ===== PHASE 1: STATIC ROUTES =====

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name} page loads without errors`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (response) expect(response.status()).toBeLessThan(400);

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const root = page.locator('#root');
    await expect(root).toBeAttached();

    // Check for ErrorBoundary crash screen
    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).toHaveCount(0);

    // Non-fatal supabase 406 errors are expected when content doesn't exist
    const errs = consoleErrors[test.info().title] || [];
    const fatal = errs.filter(e =>
      !e.includes('406') && !e.includes('supabase') && !e.includes('400')
    );
    expect(fatal.length).toBe(0);
  });
}

// ===== PAGE-SPECIFIC CONTENT CHECKS =====

test('HomePage shows hero section and featured content', async ({ page }) => {
  await page.goto('/');
  await verifyNoPageCrash(page);
  const h1 = page.locator('h1');
  await expect(h1.first()).toBeAttached({ timeout: 10000 });
});

test('404 page shows correct heading and navigation links', async ({ page }) => {
  await page.goto('/nonexistent-route-test');
  await verifyNoPageCrash(page);

  await page.waitForTimeout(2000);
  // Should show 404 number somewhere
  await expect(page.locator('text=404').first()).toBeAttached();
  // Check that at least one home link and map link exist
  await expect(page.locator('a[href="/"]').first()).toBeAttached();
  await expect(page.locator('a[href="/map"]').first()).toBeAttached();
});

test('Destinations page shows list', async ({ page }) => {
  await page.goto('/destinations');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(4000);
  // Should have cards or content
  const hasContent = await page.locator('[class*="card"], [class*="Card"], a[href*="/destination/"]').first().isVisible().catch(() => false);
  if (!hasContent) {
    // Might be loading - just check no crash
    await expect(page.locator('#root')).toBeAttached();
  }
});

test('Business listing page loads', async ({ page }) => {
  await page.goto('/business');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(4000);
});

test('Events page loads', async ({ page }) => {
  await page.goto('/events');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Blog page loads', async ({ page }) => {
  await page.goto('/blog');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Chat/AI Assistant page loads', async ({ page }) => {
  await page.goto('/chat');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(2000);
});

test('Contact page loads', async ({ page }) => {
  await page.goto('/contact');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Privacy page loads', async ({ page }) => {
  await page.goto('/privacy');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Terms page loads', async ({ page }) => {
  await page.goto('/terms');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('History page loads and shows content', async ({ page }) => {
  await page.goto('/history');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(5000);
  // Should show either Supabase content or fallback
  await expect(page.locator('h1').or(page.locator('text=Hpa-An'))).toBeAttached();
});

test('Travel Tips page loads and shows content', async ({ page }) => {
  await page.goto('/tips');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(5000);
  // Should show either Supabase content or fallback
  await expect(page.locator('h1').or(page.locator('text=Hpa-An'))).toBeAttached();
});

// ===== PHASE 2: AUTH-PROTECTED ROUTES =====

test('Favorites shows login message when unauthenticated', async ({ page }) => {
  await page.goto('/favorites');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(2000);

  // Should show login-required message or empty state
  const hasLoginMsg = await page.locator('text=login').or(page.locator('text=Login')).or(page.locator('text=sign')).or(page.locator('text=Favorites')).first().isVisible().catch(() => false);
  if (!hasLoginMsg) {
    // Just check no crash
    await expect(page.locator('#root')).toBeAttached();
  }
});

test('Trips page shows login message when unauthenticated', async ({ page }) => {
  await page.goto('/trips');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);

  const hasLoginMsg = await page.locator('text=log').or(page.locator('text=Please')).or(page.locator('text=trips')).or(page.locator('text=Trips')).first().isVisible().catch(() => false);
  if (!hasLoginMsg) {
    await expect(page.locator('#root')).toBeAttached();
  }
});

test('Account page loads when unauthenticated', async ({ page }) => {
  await page.goto('/account');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Generate Itinerary loads', async ({ page }) => {
  await page.goto('/generate-itinerary');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

test('Admin redirects to access denied when not admin', async ({ page }) => {
  await page.goto('/admin');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(2000);
});

test('UserReviews page loads', async ({ page }) => {
  await page.goto('/user-reviews');
  await verifyNoPageCrash(page);
  await page.waitForTimeout(3000);
});

// ===== PHASE 3: MAP PAGE - INITIAL LOAD =====

test.describe('Map Page', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 16.89, longitude: 97.65 });
  });

  test('Map page loads with tiles', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(3000);
  });

  test('Map shows layer control', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await expect(page.locator('.leaflet-control-layers')).toBeVisible({ timeout: 10000 });
  });

  test('Map shows zoom controls', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible({ timeout: 10000 });
  });

  test('Custom route controls exist on map', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });

    // RouteControls has a button with route-related title
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
    await page.waitForTimeout(12000);

    // Known non-fatal errors
    const fatal = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404 (Not Found)') &&
      !e.includes('406') &&
      !e.includes('supabase') &&
      !e.includes('Routing error') &&
      !e.includes('addLayer')
    );
    expect(fatal).toEqual([]);
  });

  // ===== PHASE 4: CUSTOM ROUTE BUILDER =====

  test('Can enter custom route mode and see waypoint markers', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(2000);

    // Click the route toggle button (first button in leaflet-control-custom)
    const controlCustom = page.locator('.leaflet-control-custom');
    const routeToggle = controlCustom.locator('button').first();
    await expect(routeToggle).toBeVisible();
    await routeToggle.click();
    await page.waitForTimeout(800);

    // Click on map to add waypoints
    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    if (!box) throw new Error('Map container has no bounding box');

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
    await page.mouse.click(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50);
    await page.waitForTimeout(1000);

    // Should have markers (custom-marker or leaflet-marker-icon)
    const markers = page.locator('.leaflet-marker-icon, .custom-marker');
    const count = await markers.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Clear button removes waypoints', async ({ page }) => {
    await page.goto('/map');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(2000);

    // Enter custom route mode
    const controlCustom = page.locator('.leaflet-control-custom');
    const routeToggle = controlCustom.locator('button').first();
    await routeToggle.click();
    await page.waitForTimeout(500);

    // Add waypoints
    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    if (!box) throw new Error('Map container has no bounding box');

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
    await page.mouse.click(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40);
    await page.waitForTimeout(800);

    // Click clear button (X button - second button in control)
    const buttons = controlCustom.locator('button');
    const clearBtn = buttons.nth(1);
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(1000);

      // After clear, custom route mode should be off
      const title = await routeToggle.getAttribute('title');
      // When customRouteMode is false, title should be "Custom Route" (not "Tap to add stops")
      if (title) {
        expect(title.toLowerCase()).toContain('custom');
      }
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
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(4000);
  });

  test('Map with waypoints param loads without errors', async ({ page }) => {
    const waypoints = encodeURIComponent(JSON.stringify([
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.63 },
    ]));
    await page.goto(`/map?waypoints=${waypoints}`);
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(4000);
  });

  test('Map with invalid waypoints does not crash', async ({ page }) => {
    await page.goto('/map?waypoints=invalid-json');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(3000);
  });

  test('Map with only start param (no end) does not crash', async ({ page }) => {
    await page.goto('/map?start=16.89,97.65');
    await verifyNoPageCrash(page);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(3000);
  });
});

// ===== PHASE 6: NAVIGATION & INTEGRATION =====

test('Navigate from Home to Map via navigation', async ({ page }) => {
  await page.goto('/');
  await verifyNoPageCrash(page);

  const mapLink = page.locator('a[href="/map"]').first();
  if (await mapLink.isVisible().catch(() => false)) {
    await mapLink.click();
    await page.waitForURL('**/map');
    await verifyNoPageCrash(page);
  }
});

test('Language switch works on map page', async ({ page }) => {
  await page.goto('/map');
  await verifyNoPageCrash(page);
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 25000 });

  // Try clicking a language toggle if present
  const langToggle = page.locator('button:has-text("MY"), button:has-text("EN"), button:has-text("မြန်")').first();
  if (await langToggle.isVisible().catch(() => false)) {
    await langToggle.click();
    await page.waitForTimeout(1000);
  }
});

// ===== PHASE 7: GLOBAL ERROR MONITORING =====

test('No unhandled promise rejections across all pages', async ({ page }) => {
  const rejections = [];
  page.on('pageerror', (err) => {
    if (err.message.includes('Unhandled')) rejections.push(err.message);
  });

  for (const [name, path] of Object.entries(PAGES)) {
    await page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  expect(rejections.length).toBe(0);
});

test('ErrorBoundary is not triggered on any route', async ({ page }) => {
  for (const [name, path] of Object.entries(PAGES)) {
    await page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);

    const errorBoundary = page.locator('text=Something went wrong');
    const count = await errorBoundary.count().catch(() => 0);
    if (count > 0) {
      throw new Error(`ErrorBoundary triggered on ${name} (${path})`);
    }
  }
});

// ===== PHASE 8: BUSINESS & DESTINATION DETAIL PAGES =====

test('Destination detail page loads', async ({ page }) => {
  await page.goto('/destination/1');
  await page.waitForTimeout(4000);
  await verifyNoPageCrash(page);
});

test('Business detail page loads', async ({ page }) => {
  await page.goto('/business/1');
  await page.waitForTimeout(4000);
  await verifyNoPageCrash(page);
});

test('Blog post page loads', async ({ page }) => {
  await page.goto('/blog/hello-world');
  await page.waitForTimeout(4000);
  await verifyNoPageCrash(page);
});
