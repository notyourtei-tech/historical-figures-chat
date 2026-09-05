# Real-device E2E acceptance

The Playwright suite covers desktop Chromium and an emulated Pixel 7 viewport. Emulation is not a physical-device sign-off.

## Android, free local verification

1. On an Android phone, enable Developer options and USB debugging; connect it by USB and approve the computer.
2. Confirm `adb devices` shows the handset. Start the app on a LAN-reachable address (not `localhost`), for example `npm run dev -- --hostname 0.0.0.0`.
3. Run PowerShell: `$env:E2E_BASE_URL='http://YOUR_LAN_IP:3001'; npm run test:e2e:android`.
4. On the same physical phone manually confirm: Google callback returns to the app, magic-link return works, keyboard does not cover Send, no horizontal scroll, history restores after reload, export downloads, and delete-account confirmation works.

The Android script fails clearly when no device is attached. It does not send production credentials or user data.

## iPhone/iPad acceptance

Because this Windows workspace cannot attach Safari through Playwright, use a real iPhone/iPad on the production/staging URL and perform the same checklist manually. Record iOS version, Safari version, viewport/device, network type, and result in the release checklist. A device-farm run can be added later, but most such services are paid and need separate credentials.
