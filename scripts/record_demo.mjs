/**
 * Demo recording script for PRD Quality Reviewer.
 * Takes screenshots at key interaction steps and compiles into a GIF.
 *
 * Usage: node scripts/record_demo.mjs
 * Requires: dev server running on localhost:3000
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "..", "demo");
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, "frames");
const GIF_PATH = path.join(OUTPUT_DIR, "prd-reviewer-demo.gif");
const URL = "http://localhost:3000";

// Sample PRD text to paste (short, good-quality PRD)
const SAMPLE_PRD = `# PRD: One-Click Checkout for Mobile Web

## Problem
Users on mobile web abandon the checkout flow at a 72% rate. The current 5-step checkout process is too cumbersome on mobile devices.

## Goal
Reduce mobile checkout abandonment by 30% within 3 months of launch by introducing a one-click checkout option for returning users.

## Success Metrics
- Primary: Checkout completion rate on mobile web improves from 28% → 58%
- Secondary: Average checkout time drops from 3:45 to under 1:00
- Counter-metric: Chargeback rate does not increase by more than 0.1%

## Target Users
- Returning users who have completed at least one purchase
- Mobile web traffic (iOS Safari + Android Chrome)
- Users with saved payment methods

## Timeline
- Week 1-2: Backend API for payment profile management
- Week 3-4: Frontend implementation
- Week 5: QA + load testing
- Week 6: Staged rollout (5% → 25% → 50% → 100%)
- Launch: End of Week 6

## Open Questions
- Should we offer one-click for guest users with email-based verification?
- What's the fraud liability difference between 3DS and biometric-only auth?`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 Captured: ${name}`);
  return filePath;
}

async function main() {
    // Clean and create output directories
  fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  console.log("🚀 Starting demo recording...\n");

  const frameTimestamps = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to the app
    console.log("1️⃣  Opening PRD Quality Reviewer...");
    await page.goto(URL, { waitUntil: "networkidle" });
    await sleep(500);
    await captureScreenshot(page, "01-landing");

    // Step 2: Click "Paste PRD Content" tab
    console.log("2️⃣  Switching to paste mode...");
    await page.click('text="Paste PRD Content"');
    await sleep(300);
    await captureScreenshot(page, "02-paste-mode");

    // Step 3: Type PRD text into the textarea
    console.log("3️⃣  Pasting PRD content...");
    const textarea = page.locator("#prd-input");
    await textarea.click();
    await textarea.fill(SAMPLE_PRD);
    await sleep(300);
    await captureScreenshot(page, "03-prd-pasted");

    // Step 4: Click "Review PRD" button
    console.log("4️⃣  Clicking Review PRD...");
    await page.click('text="Review PRD"');
    await sleep(500);
    await captureScreenshot(page, "04-loading");

    // Step 5: Wait for results to appear
    console.log("5️⃣  Waiting for review results...");
    // Wait for overall score to appear (may take several seconds for API)
    await page.waitForSelector("text=/\\d+\\/100/", { timeout: 60000 });
    await sleep(1000);
    await captureScreenshot(page, "05-results");

    // Scroll down to show all score cards
    console.log("6️⃣  Scrolling to show full results...");
    await page.evaluate(() => {
      const results = document.querySelector("section");
      if (results) results.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await sleep(300);
    await captureScreenshot(page, "06-smart-breakdown");

    // Step 7: Take a full-page screenshot for reference
    const fullPagePath = path.join(OUTPUT_DIR, "demo-fullpage.png");
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`  📸 Full page: demo-fullpage.png`);

    console.log("\n✅ All screenshots captured!\n");

    // Create numbered copies for ffmpeg sequential input
    console.log("🎞️  Preparing frames for GIF...");
    const frameFiles = fs.readdirSync(SCREENSHOTS_DIR)
      .filter(f => f.endsWith(".png"))
      .sort();
    
    frameFiles.forEach((f, i) => {
      const num = String(i + 1).padStart(2, "0");
      fs.copyFileSync(
        path.join(SCREENSHOTS_DIR, f),
        path.join(SCREENSHOTS_DIR, `frame_${num}.png`)
      );
    });

    // Compile into GIF using ffmpeg with sequential numbered files
    execSync(
      `ffmpeg -y -framerate 0.7 -i "${SCREENSHOTS_DIR}/frame_%02d.png" ` +
        `-vf "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" ` +
        `"${GIF_PATH}"`,
      { stdio: "inherit" }
    );
    console.log(`\n✅ GIF created: ${GIF_PATH}`);

    // Also create a video version
    const mp4Path = path.join(OUTPUT_DIR, "prd-reviewer-demo.mp4");
    execSync(
      `ffmpeg -y -framerate 0.7 -i "${SCREENSHOTS_DIR}/frame_%02d.png" ` +
        `-c:v libx264 -pix_fmt yuv420p "${mp4Path}"`,
      { stdio: "inherit" }
    );
    console.log(`✅ MP4 created: ${mp4Path}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);