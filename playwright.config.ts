import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node backend/week10/server.js',
      url: 'http://localhost:8080',
      reuseExistingServer: true,
      timeout: 20000,
    },
    {
      command: 'npm --prefix frontend/Notes run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 20000,
    },
  ],
});
