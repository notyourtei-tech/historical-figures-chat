import { _android as android } from "playwright";

const baseURL = process.env.E2E_BASE_URL;
if (!baseURL) {
  console.error("Set E2E_BASE_URL to a LAN-reachable URL, for example http://192.168.1.20:3001.");
  process.exit(2);
}

const devices = await android.devices();
if (devices.length === 0) {
  console.error("No Android device found. Enable USB debugging, connect the phone, and confirm 'adb devices' lists it.");
  process.exit(2);
}

const device = devices[0];
const context = await device.launchBrowser();
try {
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle", timeout: 45_000 });
  const title = await page.title();
  if (!title.includes("万古灵犀")) throw new Error(`Unexpected page title: ${title}`);
  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  if (!fitsViewport) throw new Error("Horizontal overflow detected on the connected Android device.");
  console.log(`Android device smoke test passed: ${await device.model()} at ${baseURL}`);
} finally {
  await context.close();
  await device.close();
}
