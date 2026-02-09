# Icon Picker Visual QA

Use this flow to visually assess the icon picker without auth friction.

## 1) Start local server with preview enabled

```bash
DEV_PREVIEW=true pnpm dev
```

Route:

`http://localhost:3000/dev/icon-picker`

## 2) Manual UX checks

- Select an icon, then edit text fields; selected icon should stay stable.
- Keyboard nav: focus an icon, use ArrowUp/ArrowDown/ArrowLeft/ArrowRight.
- Resize viewport: mobile, tablet, desktop.
- Confirm selected label and visual states remain clear.

## 3) Capture repeatable screenshots (Playwright CLI)

In a second terminal:

```bash
pnpm visual:icon-picker
```

Artifacts are written to:

`output/playwright/`

Generated files:

- `icon-picker-desktop-default.png`
- `icon-picker-desktop-manual-override.png`
- `icon-picker-desktop-keyboard-nav.png`
- `icon-picker-mobile-default.png`
- `icon-picker-tablet-default.png`

## Notes

- Preview route is gated by `DEV_PREVIEW=true`.
- When `DEV_PREVIEW` is not true, `/dev/icon-picker` is not publicly accessible.
