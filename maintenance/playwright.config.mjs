import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  webServer: [
    {
      command: "node scripts/serve-catalog.mjs --port 4173",
      url: "http://127.0.0.1:4173/index.html",
      reuseExistingServer: !process.env.CI
    }
  ],
  use: {
    browserName: "chromium",
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce"
  },
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}"
});
