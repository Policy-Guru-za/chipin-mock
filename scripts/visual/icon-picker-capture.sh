#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

TARGET_URL="${1:-http://localhost:3000/dev/icon-picker}"
OUTPUT_DIR="output/playwright"
SESSION_NAME="icon-picker-visual"

export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"

if [[ -x "$PWCLI" ]]; then
  CLI=("$PWCLI")
elif command -v playwright-cli >/dev/null 2>&1; then
  CLI=("playwright-cli")
else
  echo "Playwright CLI not found. Install with: npm install -g @playwright/mcp@latest"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

"${CLI[@]}" --session "$SESSION_NAME" open "$TARGET_URL"
"${CLI[@]}" --session "$SESSION_NAME" resize 1280 900
"${CLI[@]}" --session "$SESSION_NAME" run-code "await page.waitForLoadState('networkidle'); await page.screenshot({ path: '$OUTPUT_DIR/icon-picker-desktop-default.png', fullPage: true });"

"${CLI[@]}" --session "$SESSION_NAME" run-code "await page.getByRole('radio', { name: 'Train' }).click(); await page.getByLabel('Gift name').fill('soccer ball gift'); await page.waitForTimeout(400); await page.screenshot({ path: '$OUTPUT_DIR/icon-picker-desktop-manual-override.png', fullPage: true });"

"${CLI[@]}" --session "$SESSION_NAME" run-code "await page.getByRole('radio', { name: 'Bicycle' }).focus(); await page.keyboard.press('ArrowDown'); const activeLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')); if (activeLabel !== 'Fishing') { throw new Error('Expected keyboard focus on Fishing after ArrowDown, got ' + String(activeLabel)); } await page.screenshot({ path: '$OUTPUT_DIR/icon-picker-desktop-keyboard-nav.png', fullPage: true });"

"${CLI[@]}" --session "$SESSION_NAME" resize 390 844
"${CLI[@]}" --session "$SESSION_NAME" run-code "await page.goto('$TARGET_URL', { waitUntil: 'networkidle' }); await page.screenshot({ path: '$OUTPUT_DIR/icon-picker-mobile-default.png', fullPage: true });"

"${CLI[@]}" --session "$SESSION_NAME" resize 768 1024
"${CLI[@]}" --session "$SESSION_NAME" run-code "await page.goto('$TARGET_URL', { waitUntil: 'networkidle' }); await page.screenshot({ path: '$OUTPUT_DIR/icon-picker-tablet-default.png', fullPage: true });"

"${CLI[@]}" --session "$SESSION_NAME" close

echo "Saved screenshots to $OUTPUT_DIR"
