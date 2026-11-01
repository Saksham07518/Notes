import { test, expect } from '@playwright/test';

test.describe('You Notes Web App Full Suite', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Playwright Tester',
    email: `tester_${timestamp}@younotes.com`,
    password: 'Password123!',
  };

  test('1. User Registration Flow', async ({ page }) => {
    await page.goto('/register');

    // Page title and branding
    await expect(page).toHaveTitle(/You Notes/);
    await expect(page.locator('h1')).toContainText('Create your You Notes account');

    // Fill registration form
    await page.fill('input[placeholder="Eleanor Vance"]', testUser.name);
    await page.fill('input[placeholder="eleanor@younotes.com"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Verify password strength indicator reacted
    await expect(page.locator('.font-label-sm:has-text("Very Strong"), .font-label-sm:has-text("Strong")')).toBeVisible();

    // Check Terms checkbox
    await page.locator('input[type="checkbox"]').check();

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success banner and redirect to login
    await expect(page.locator('.alert-success')).toContainText('Account created');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('2. User Authentication and Dashboard Access', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/You Notes/);
    await expect(page.locator('h1')).toContainText('Welcome back');

    // Fill credentials
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Submit login
    await page.click('button[type="submit"]');

    // Verify redirect to /notes dashboard
    await expect(page).toHaveURL(/\/notes/, { timeout: 10000 });
    await expect(page.locator('.sidebar-username')).toContainText(testUser.name);
    await expect(page.locator('.sidebar')).toContainText('You Notes');
  });

  test('3. Complete Notes Lifecycle (Create, Edit, Auto-Save, Favorite, Search, Trash, Restore)', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/notes/);

    // A. Create new note
    await page.click('button:has-text("New")');
    const noteCard = page.locator('.note-item').first();
    await expect(noteCard).toBeVisible();

    // B. Edit Title and Content
    const noteTitle = `Playwright Note ${Date.now()}`;
    const noteContent = 'This is an automated test note created with Playwright.';

    await page.fill('.editor-title-input', noteTitle);
    await page.fill('.editor-body-input', noteContent);

    // Wait for auto-save indicator
    await expect(page.locator('.editor-status')).toContainText('Saved', { timeout: 5000 });

    // Verify title in note list card
    await expect(noteCard.locator('.note-item-title')).toHaveText(noteTitle);
    await expect(noteCard.locator('.note-item-excerpt')).toHaveText(noteContent);

    // C. Favorite Note
    await page.click('.editor-header button[title="Favorite"]');
    await expect(page.locator('.note-star-badge')).toBeVisible();

    // Switch to Favorites tab
    await page.click('.sidebar-item:has-text("Favorites")');
    await expect(page.locator('.note-item-title', { hasText: noteTitle })).toBeVisible();

    // Switch back to All Notes
    await page.click('.sidebar-item:has-text("All Notes")');

    // D. Search for note
    await page.fill('.notes-search input', 'Playwright');
    await expect(page.locator('.note-item')).toHaveCount(1);
    await page.fill('.notes-search input', 'NonExistentXYZ');
    await expect(page.locator('.note-item')).toHaveCount(0);
    // Clear search
    await page.click('.notes-search button');
    await expect(page.locator('.note-item')).toHaveCount(1);

    // E. Copy and Markdown Export buttons clickable
    await page.click('button[title="Copy note"]');
    await expect(page.locator('button[title="Copy note"]')).toBeVisible();

    // F. Move to Trash
    await page.click('.editor-header button[title="Move to trash"]');
    await expect(page.locator('.notes-list .note-item')).toHaveCount(0);

    // G. Verify in Trash tab
    await page.click('.sidebar-item:has-text("Trash")');
    await expect(page.locator('.note-item-title', { hasText: noteTitle })).toBeVisible();

    // Click trashed note to open in editor
    await page.click('.note-item');
    await expect(page.locator('.trash-banner')).toContainText('This note is in trash');

    // H. Restore note
    await page.click('.trash-banner button:has-text("Restore")');
    await expect(page.locator('.notes-list .note-item')).toHaveCount(0);

    // Verify back in All Notes
    await page.click('.sidebar-item:has-text("All Notes")');
    await expect(page.locator('.note-item-title', { hasText: noteTitle })).toBeVisible();
  });

  test('4. Mobile Responsive Layout & Drawer Interaction', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/notes/);

    // On mobile, hamburger menu button must be visible
    const hamburgerBtn = page.locator('.mobile-menu-btn');
    await expect(hamburgerBtn).toBeVisible();

    // Click hamburger button to open drawer
    await hamburgerBtn.click();
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveClass(/open/);

    // Close drawer via close button
    await page.click('.sidebar-close-btn');
    await expect(sidebar).not.toHaveClass(/open/);

    // Test mobile category pills bar
    const favPill = page.locator('.mobile-pill:has-text("Favorites")');
    await expect(favPill).toBeVisible();
    await favPill.click();
    await expect(favPill).toHaveClass(/active/);

    // Switch back to All pill
    await page.click('.mobile-pill:has-text("All")');

    // Click note to enter mobile editor view
    await page.click('.note-item');
    const backBtn = page.locator('.mobile-back-btn');
    await expect(backBtn).toBeVisible();

    // Click back button to return to notes list
    await backBtn.click();
    await expect(page.locator('.notes-panel')).toBeVisible();
  });

  test('5. Logout Flow & Logged Out View', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/notes/);

    // Click sign out button in sidebar footer
    await page.click('button[title="Sign out"]');

    // Verify redirect to /logged-out
    await expect(page).toHaveURL(/\/logged-out/);
    await expect(page.locator('h1')).toContainText('You’ve been securely signed out');
    await expect(page.locator('.font-headline-sm')).toContainText('You Notes');

    // Click "Sign Back In"
    await page.click('button:has-text("Sign Back In")');
    await expect(page).toHaveURL(/\/login/);
  });
});

