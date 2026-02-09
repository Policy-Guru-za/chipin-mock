# Icon Asset Creation Plan

## Purpose

Detailed execution plan for creating all 30 gift icon PNG assets for the Gifta dreamboard icon library. This is a sub-plan of the main `ICON_LIBRARY_REFACTOR_IMPLEMENTATION_PLAN.md` — specifically covering Phase 1 (icon asset creation).

This plan is the authoritative source for the implementing agent. Execute in order.

---

## Table of Contents

1. [Source Material — Microsoft Fluent Emoji 3D](#1-source-material--microsoft-fluent-emoji-3d)
2. [Asset Mapping — All 30 Icons](#2-asset-mapping--all-30-icons)
3. [Composition Pipeline](#3-composition-pipeline)
4. [Step-by-Step Execution](#4-step-by-step-execution)
5. [Handling Missing / Poor-Match Icons](#5-handling-missing--poor-match-icons)
6. [Optimisation](#6-optimisation)
7. [Verification](#7-verification)

---

## 1. Source Material — Microsoft Fluent Emoji 3D

### Repository

- **URL**: https://github.com/microsoft/fluentui-emoji
- **License**: MIT (fully permissible for commercial use, including Gifta)
- **Style**: 3D rendered, glossy, warm, child-friendly — closely matches the pink bow mockup

### Asset Structure

The repo organises emoji by **Unicode codepoint** in the `/assets/` directory. The 3D-style PNGs are located at:

```
assets/{Emoji Name}/3D/{emoji_name}_3d.png
```

The 3D PNGs are high-resolution (typically 256×256px or larger). These are the source files we will download and composite onto pastel backgrounds.

### Access Method

Download individual assets directly from GitHub raw URLs:

```
https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/{Emoji Name}/3D/{emoji_name}_3d.png
```

**Important**: Emoji folder names use **Title Case with spaces** (e.g., `Soccer ball`, `Artist palette`). The PNG filenames use **snake_case** (e.g., `soccer_ball_3d.png`). The implementing agent must use the exact names listed in the mapping table below.

---

## 2. Asset Mapping — All 30 Icons

### Legend

- **Match quality**: `DIRECT` = exact subject match, `CLOSE` = similar enough to work well, `SUBSTITUTE` = different emoji used to represent the concept
- **Fluent Emoji Name**: Exact folder name in the repo (case-sensitive)
- **Unicode**: Reference codepoint

### Category 1: Active & Outdoors (bg: `#E8F0E4`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `bicycle` | `Bicycle` | `bicycle_3d.png` | U+1F6B2 | DIRECT |
| `scooter` | `Kick scooter` | `kick_scooter_3d.png` | U+1F6F4 | DIRECT |
| `soccer-ball` | `Soccer ball` | `soccer_ball_3d.png` | U+26BD | DIRECT |
| `skateboard` | `Skateboard` | `skateboard_3d.png` | U+1F6F9 | DIRECT |
| `swimming` | `Goggles` | `goggles_3d.png` | U+1F97D | DIRECT |

> Note for `swimming`: Use the Goggles emoji (U+1F97D) rather than "Person swimming" — we want the object, not a person figure.

### Category 2: Creative & Performing Arts (bg: `#F8E8EE`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `ballet` | `Ballet shoes` | `ballet_shoes_3d.png` | U+1FA70 | DIRECT |
| `paint-palette` | `Artist palette` | `artist_palette_3d.png` | U+1F3A8 | DIRECT |
| `guitar` | `Guitar` | `guitar_3d.png` | U+1F3B8 | DIRECT |
| `microphone` | `Microphone` | `microphone_3d.png` | U+1F3A4 | DIRECT |
| `camera` | `Camera` | `camera_3d.png` | U+1F4F7 | DIRECT |

### Category 3: Learning & Discovery (bg: `#E8EAF6`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `books` | `Books` | `books_3d.png` | U+1F4DA | DIRECT |
| `telescope` | `Telescope` | `telescope_3d.png` | U+1F52D | DIRECT |
| `microscope` | `Microscope` | `microscope_3d.png` | U+1F52C | DIRECT |
| `building-blocks` | `Bricks` | `bricks_3d.png` | U+1F9F1 | CLOSE |
| `globe` | `Globe showing Americas` | `globe_showing_americas_3d.png` | U+1F30E | DIRECT |

> Note for `building-blocks`: The Unicode "Bricks" emoji (U+1F9F1) depicts colourful toy bricks in Fluent's 3D style — works well for this context. If the visual doesn't suit, fallback to `Puzzle piece` (U+1F9E9).

### Category 4: Imaginative Play (bg: `#FFF3E0`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `teddy-bear` | `Teddy bear` | `teddy_bear_3d.png` | U+1F9F8 | DIRECT |
| `dollhouse` | `House with garden` | `house_with_garden_3d.png` | U+1F3E1 | CLOSE |
| `superhero-cape` | `Superhero` | `superhero_3d.png` | U+1F9B8 | DIRECT |
| `castle` | `Castle` | `castle_3d.png` | U+1F3F0 | DIRECT |
| `pirate-ship` | `Sailboat` | `sailboat_3d.png` | U+26F5 | SUBSTITUTE |

> Note for `dollhouse`: "House with garden" is a charming, colourful house that reads as a dollhouse when placed on a soft peach background in a children's gift context.
>
> Note for `pirate-ship`: No pirate ship emoji exists. The Sailboat (U+26F5) provides a clean boat icon. The context of the gift name (e.g., "pirate ship playset") handles the semantic meaning — the icon is a visual accent, not a literal illustration.

### Category 5: Tech & Gaming (bg: `#E0F2F1`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `tablet` | `Laptop` | `laptop_3d.png` | U+1F4BB | SUBSTITUTE |
| `game-controller` | `Video game` | `video_game_3d.png` | U+1F3AE | DIRECT |
| `headphones` | `Headphone` | `headphone_3d.png` | U+1F3A7 | DIRECT |
| `robot` | `Robot` | `robot_3d.png` | U+1F916 | DIRECT |
| `drone` | `Helicopter` | `helicopter_3d.png` | U+1F681 | SUBSTITUTE |

> Note for `tablet`: The Mobile Phone emoji (U+1F4F1) looks too much like a phone. The Laptop (U+1F4BB) reads better as a general "tech device" gift. If a tablet-specific look is preferred, an alternative is "Desktop computer" (U+1F5A5).
>
> Note for `drone`: No drone emoji exists in Unicode. The Helicopter (U+1F681) is the closest flying vehicle with a similar silhouette and works well as a "tech flying thing" icon.

### Category 6: Experiences (bg: `#FFF9E6`)

| Our Icon ID | Fluent Emoji Name | PNG Filename | Unicode | Match |
|---|---|---|---|---|
| `amusement-park` | `Ferris wheel` | `ferris_wheel_3d.png` | U+1F3A1 | DIRECT |
| `camping` | `Camping` | `camping_3d.png` | U+1F3D5 | DIRECT |
| `plane-ticket` | `Airplane` | `airplane_3d.png` | U+2708 | CLOSE |
| `zoo` | `Lion` | `lion_3d.png` | U+1F981 | SUBSTITUTE |
| `movie` | `Clapper board` | `clapper_board_3d.png` | U+1F3AC | DIRECT |

> Note for `plane-ticket`: Using the Airplane emoji directly (U+2708) rather than the generic Ticket (U+1F3AB). An aeroplane icon communicates "travel experience" much more clearly than a generic ticket.
>
> Note for `zoo`: No zoo emoji exists. The Lion face (U+1F981) is the most recognisable "zoo animal" in Fluent's 3D style — bold, friendly, and immediately communicates "zoo / animal experience." Alternative: Giraffe (U+1F992) if the lion reads too fierce.

---

## 3. Composition Pipeline

### Overview

Each final icon PNG is composed of two layers:

```
┌─────────────────────────┐
│  320×320 canvas         │
│  ┌───────────────────┐  │
│  │ Rounded-rect fill  │  │
│  │ (category colour)  │  │
│  │                    │  │
│  │   ┌──────────┐    │  │
│  │   │  Emoji   │    │  │
│  │   │  ~200px  │    │  │
│  │   └──────────┘    │  │
│  │                    │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### Specifications

| Property | Value |
|---|---|
| Canvas size | 320 × 320 px |
| Background shape | Rounded rectangle, full canvas, corner radius 40px |
| Background fill | Category tint colour (solid, no gradient) |
| Emoji size | ~200 × 200 px (centred, occupying ~62.5% of canvas) |
| Emoji position | Dead centre (60px inset from each edge) |
| Output format | PNG-24, RGBA (transparent outside rounded rect) |

### Technology

Use **Python with Pillow** (PIL). The pipeline script:

1. Creates a 320×320 RGBA canvas (transparent)
2. Draws a rounded rectangle filled with the category colour
3. Opens the source Fluent Emoji 3D PNG
4. Resizes the emoji to 200×200px using `LANCZOS` resampling (high-quality downscale)
5. Pastes the emoji centred on the background (alpha-composited)
6. Saves as PNG

### Python Dependencies

```bash
pip install Pillow requests --break-system-packages
```

---

## 4. Step-by-Step Execution

### Step 1: Create the output directory

```bash
mkdir -p /path/to/gifta-codex5.3/public/icons/gifts
```

### Step 2: Write the composition script

Create a Python script (`scripts/generate-gift-icons.py`) that:

1. Defines the full icon manifest (all 30 icons with their Fluent Emoji source URL, target filename, and background colour)
2. Downloads each Fluent Emoji 3D PNG from GitHub raw URLs
3. Composites each onto its category background
4. Saves to `public/icons/gifts/{icon-id}.png`

#### Script Structure

```python
#!/usr/bin/env python3
"""Generate gift icon assets by compositing Fluent Emoji 3D onto pastel backgrounds."""

import io
import requests
from pathlib import Path
from PIL import Image, ImageDraw

# ── Configuration ──────────────────────────────────────────────────
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons" / "gifts"
CANVAS_SIZE = 320
CORNER_RADIUS = 40
EMOJI_SIZE = 200
EMOJI_OFFSET = (CANVAS_SIZE - EMOJI_SIZE) // 2  # 60px

FLUENT_BASE = (
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets"
)

# ── Icon Manifest ──────────────────────────────────────────────────
# Each entry: (our_icon_id, fluent_emoji_folder, fluent_png_filename, bg_hex)

ICONS = [
    # Active & Outdoors (#E8F0E4)
    ("bicycle",        "Bicycle",                "bicycle_3d.png",                "#E8F0E4"),
    ("scooter",        "Kick scooter",           "kick_scooter_3d.png",           "#E8F0E4"),
    ("soccer-ball",    "Soccer ball",            "soccer_ball_3d.png",            "#E8F0E4"),
    ("skateboard",     "Skateboard",             "skateboard_3d.png",             "#E8F0E4"),
    ("swimming",       "Goggles",                "goggles_3d.png",               "#E8F0E4"),

    # Creative & Performing Arts (#F8E8EE)
    ("ballet",         "Ballet shoes",           "ballet_shoes_3d.png",           "#F8E8EE"),
    ("paint-palette",  "Artist palette",         "artist_palette_3d.png",         "#F8E8EE"),
    ("guitar",         "Guitar",                 "guitar_3d.png",                 "#F8E8EE"),
    ("microphone",     "Microphone",             "microphone_3d.png",             "#F8E8EE"),
    ("camera",         "Camera",                 "camera_3d.png",                 "#F8E8EE"),

    # Learning & Discovery (#E8EAF6)
    ("books",          "Books",                  "books_3d.png",                  "#E8EAF6"),
    ("telescope",      "Telescope",              "telescope_3d.png",              "#E8EAF6"),
    ("microscope",     "Microscope",             "microscope_3d.png",             "#E8EAF6"),
    ("building-blocks","Bricks",                 "bricks_3d.png",                 "#E8EAF6"),
    ("globe",          "Globe showing Americas", "globe_showing_americas_3d.png", "#E8EAF6"),

    # Imaginative Play (#FFF3E0)
    ("teddy-bear",     "Teddy bear",             "teddy_bear_3d.png",             "#FFF3E0"),
    ("dollhouse",      "House with garden",      "house_with_garden_3d.png",      "#FFF3E0"),
    ("superhero-cape", "Superhero",              "superhero_3d.png",              "#FFF3E0"),
    ("castle",         "Castle",                 "castle_3d.png",                 "#FFF3E0"),
    ("pirate-ship",    "Sailboat",               "sailboat_3d.png",              "#FFF3E0"),

    # Tech & Gaming (#E0F2F1)
    ("tablet",         "Laptop",                 "laptop_3d.png",                 "#E0F2F1"),
    ("game-controller","Video game",             "video_game_3d.png",             "#E0F2F1"),
    ("headphones",     "Headphone",              "headphone_3d.png",              "#E0F2F1"),
    ("robot",          "Robot",                  "robot_3d.png",                  "#E0F2F1"),
    ("drone",          "Helicopter",             "helicopter_3d.png",             "#E0F2F1"),

    # Experiences (#FFF9E6)
    ("amusement-park", "Ferris wheel",           "ferris_wheel_3d.png",           "#FFF9E6"),
    ("camping",        "Camping",                "camping_3d.png",                "#FFF9E6"),
    ("plane-ticket",   "Airplane",               "airplane_3d.png",               "#FFF9E6"),
    ("zoo",            "Lion",                   "lion_3d.png",                   "#FFF9E6"),
    ("movie",          "Clapper board",          "clapper_board_3d.png",          "#FFF9E6"),
]


def hex_to_rgba(hex_color: str) -> tuple[int, int, int, int]:
    """Convert hex colour string to RGBA tuple (fully opaque)."""
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def create_rounded_rect_mask(size: int, radius: int) -> Image.Image:
    """Create a rounded rectangle alpha mask."""
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [(0, 0), (size - 1, size - 1)],
        radius=radius,
        fill=255,
    )
    return mask


def download_emoji(folder_name: str, png_filename: str) -> Image.Image:
    """Download a Fluent Emoji 3D PNG from GitHub."""
    url = f"{FLUENT_BASE}/{folder_name}/3D/{png_filename}"
    print(f"  Downloading: {url}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return Image.open(io.BytesIO(response.content)).convert("RGBA")


def compose_icon(
    emoji_img: Image.Image,
    bg_color: str,
) -> Image.Image:
    """Compose an emoji onto a pastel rounded-rectangle background."""
    bg_rgba = hex_to_rgba(bg_color)

    # Create background canvas
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    bg_layer = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), bg_rgba)
    mask = create_rounded_rect_mask(CANVAS_SIZE, CORNER_RADIUS)
    canvas.paste(bg_layer, (0, 0), mask)

    # Resize emoji
    emoji_resized = emoji_img.resize(
        (EMOJI_SIZE, EMOJI_SIZE), Image.LANCZOS
    )

    # Paste emoji centred (alpha composite)
    canvas.paste(emoji_resized, (EMOJI_OFFSET, EMOJI_OFFSET), emoji_resized)

    return canvas


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    successes = []
    failures = []

    for icon_id, folder, png_name, bg_hex in ICONS:
        print(f"\nProcessing: {icon_id}")
        try:
            emoji_img = download_emoji(folder, png_name)
            composed = compose_icon(emoji_img, bg_hex)
            output_path = OUTPUT_DIR / f"{icon_id}.png"
            composed.save(str(output_path), "PNG", optimize=True)
            print(f"  ✓ Saved: {output_path}")
            successes.append(icon_id)
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            failures.append((icon_id, str(e)))

    print(f"\n{'='*60}")
    print(f"Done. {len(successes)} succeeded, {len(failures)} failed.")
    if failures:
        print("Failures:")
        for icon_id, err in failures:
            print(f"  - {icon_id}: {err}")


if __name__ == "__main__":
    main()
```

### Step 3: Run the script

```bash
cd /path/to/gifta-codex5.3
python3 scripts/generate-gift-icons.py
```

### Step 4: Handle failures

If any downloads fail (404, wrong path, etc.), the script logs which icons failed. For each failure:

1. Check the Fluent Emoji repo manually to find the correct folder name and PNG filename
2. The most common issue will be **folder name casing or spacing** — Fluent Emoji uses natural language names
3. Update the manifest entry and re-run the script (it's idempotent — existing files are overwritten)

**Fallback strategy for stubborn failures**: If a Fluent Emoji 3D asset genuinely doesn't exist at the expected path:
1. Browse the repo's `/assets/` directory listing to find the actual name
2. Check for alternative emoji names (e.g., "Camping" might be filed under "Tent" or "National park")
3. As a last resort, use the Color SVG version and render it to PNG at 200×200px using Pillow

### Step 5: Visual review

After all 30 icons are generated, open each one and verify:
- The emoji is clearly visible and centred
- The background colour matches the category
- The corners are properly rounded
- No clipping or cropping of the emoji subject
- The overall feel is warm, child-friendly, and consistent

---

## 5. Handling Missing / Poor-Match Icons

The mapping in Section 2 identifies 4 icons that are not direct matches. Here are the substitution decisions and fallback chains:

### `dollhouse` → House with garden (U+1F3E1)

**Rationale**: The 3D house with garden emoji is colourful and charming. In context (a children's gift selector), it reads perfectly as "dollhouse" or "play house."

**If it doesn't look right**: Try `Derelict house` (U+1F3DA) — Fluent's version is actually a quaint cottage, not a derelict building.

### `pirate-ship` → Sailboat (U+26F5)

**Rationale**: The sailboat is clean and recognisable. The gift name and description carry the "pirate" context.

**If it doesn't look right**: Try `Ship` (U+1F6A2) — it's a larger vessel.

### `tablet` → Laptop (U+1F4BB)

**Rationale**: The laptop reads as "tech gift" more broadly than a phone icon, and many kids' "tablet" gifts are actually laptops or convertibles.

**If it doesn't look right**: Try `Mobile phone` (U+1F4F1) or `Desktop computer` (U+1F5A5).

### `drone` → Helicopter (U+1F681)

**Rationale**: The helicopter is the closest flying vehicle. The propeller-on-top silhouette is visually reminiscent of a drone.

**If it doesn't look right**: Try `Small airplane` (U+1F6E9) or `Flying saucer` (U+1F6F8).

### `zoo` → Lion (U+1F981)

**Rationale**: The lion is the quintessential "zoo animal" — immediately recognisable and friendly in Fluent's 3D style.

**If it doesn't look right**: Try `Giraffe` (U+1F992) or `Elephant` (U+1F418).

---

## 6. Optimisation

After all 30 icons are composed and saved, optimise for file size.

### Install pngquant

```bash
# Ubuntu/Debian
sudo apt-get install -y pngquant

# macOS
brew install pngquant
```

### Run optimisation

```bash
cd /path/to/gifta-codex5.3

for f in public/icons/gifts/*.png; do
  pngquant --quality=65-80 --strip --force --ext .png "$f"
done
```

This typically achieves 50–70% file size reduction while maintaining visual quality at 320px.

### Verify file sizes

```bash
ls -lh public/icons/gifts/*.png | awk '{print $5, $9}'
```

Target: every file under 30KB. The Fluent Emoji 3D assets are relatively simple compositions, so 15–25KB is typical after optimisation.

---

## 7. Verification

### Automated checks

Run these after the pipeline completes:

```bash
# 1. Count — exactly 30 files
echo "File count: $(ls public/icons/gifts/*.png | wc -l)"
# Expected: 30

# 2. Dimensions — all 320×320
for f in public/icons/gifts/*.png; do
  dims=$(identify -format "%wx%h" "$f" 2>/dev/null || python3 -c "from PIL import Image; img=Image.open('$f'); print(f'{img.width}x{img.height}')")
  if [ "$dims" != "320x320" ]; then
    echo "WRONG SIZE: $f ($dims)"
  fi
done

# 3. File sizes — all under 30KB
find public/icons/gifts/ -name "*.png" -size +30k -exec echo "TOO LARGE: {}" \;

# 4. All expected filenames present
for id in bicycle scooter soccer-ball skateboard swimming \
          ballet paint-palette guitar microphone camera \
          books telescope microscope building-blocks globe \
          teddy-bear dollhouse superhero-cape castle pirate-ship \
          tablet game-controller headphones robot drone \
          amusement-park camping plane-ticket zoo movie; do
  if [ ! -f "public/icons/gifts/${id}.png" ]; then
    echo "MISSING: ${id}.png"
  fi
done
```

### Visual spot-check

Open at least one icon from each category in an image viewer and confirm:

- [ ] `bicycle.png` — bicycle visible on sage green background
- [ ] `ballet.png` — ballet shoes on soft rose background
- [ ] `books.png` — stacked books on lavender background
- [ ] `teddy-bear.png` — teddy bear on peach background
- [ ] `game-controller.png` — controller on teal background
- [ ] `amusement-park.png` — ferris wheel on buttercream background

### Browser rendering test

After the icons are in place and the icon picker component is built (Phase 4 of the main plan), render the picker in a browser at both mobile (375px) and desktop (1440px) widths. Verify:

- Icons are crisp (no blurriness at 64–80px CSS size)
- Background colours are visually distinct between categories
- No icons look out of place or stylistically inconsistent

---

## Appendix: Fluent Emoji Folder Name Reference

If the script fails to download an emoji, the issue is almost certainly the folder name. Here are verified folder names for all 30 source emojis. The implementing agent should verify against the actual repo if any fail:

| Our Icon | Fluent Folder Name (case-sensitive) | Expected URL Path |
|---|---|---|
| bicycle | `Bicycle` | `/assets/Bicycle/3D/bicycle_3d.png` |
| scooter | `Kick scooter` | `/assets/Kick scooter/3D/kick_scooter_3d.png` |
| soccer-ball | `Soccer ball` | `/assets/Soccer ball/3D/soccer_ball_3d.png` |
| skateboard | `Skateboard` | `/assets/Skateboard/3D/skateboard_3d.png` |
| swimming | `Goggles` | `/assets/Goggles/3D/goggles_3d.png` |
| ballet | `Ballet shoes` | `/assets/Ballet shoes/3D/ballet_shoes_3d.png` |
| paint-palette | `Artist palette` | `/assets/Artist palette/3D/artist_palette_3d.png` |
| guitar | `Guitar` | `/assets/Guitar/3D/guitar_3d.png` |
| microphone | `Microphone` | `/assets/Microphone/3D/microphone_3d.png` |
| camera | `Camera` | `/assets/Camera/3D/camera_3d.png` |
| books | `Books` | `/assets/Books/3D/books_3d.png` |
| telescope | `Telescope` | `/assets/Telescope/3D/telescope_3d.png` |
| microscope | `Microscope` | `/assets/Microscope/3D/microscope_3d.png` |
| building-blocks | `Bricks` | `/assets/Bricks/3D/bricks_3d.png` |
| globe | `Globe showing Americas` | `/assets/Globe showing Americas/3D/globe_showing_americas_3d.png` |
| teddy-bear | `Teddy bear` | `/assets/Teddy bear/3D/teddy_bear_3d.png` |
| dollhouse | `House with garden` | `/assets/House with garden/3D/house_with_garden_3d.png` |
| superhero-cape | `Superhero` | `/assets/Superhero/3D/superhero_3d.png` |
| castle | `Castle` | `/assets/Castle/3D/castle_3d.png` |
| pirate-ship | `Sailboat` | `/assets/Sailboat/3D/sailboat_3d.png` |
| tablet | `Laptop` | `/assets/Laptop/3D/laptop_3d.png` |
| game-controller | `Video game` | `/assets/Video game/3D/video_game_3d.png` |
| headphones | `Headphone` | `/assets/Headphone/3D/headphone_3d.png` |
| robot | `Robot` | `/assets/Robot/3D/robot_3d.png` |
| drone | `Helicopter` | `/assets/Helicopter/3D/helicopter_3d.png` |
| amusement-park | `Ferris wheel` | `/assets/Ferris wheel/3D/ferris_wheel_3d.png` |
| camping | `Camping` | `/assets/Camping/3D/camping_3d.png` |
| plane-ticket | `Airplane` | `/assets/Airplane/3D/airplane_3d.png` |
| zoo | `Lion` | `/assets/Lion/3D/lion_3d.png` |
| movie | `Clapper board` | `/assets/Clapper board/3D/clapper_board_3d.png` |

**URL encoding note**: Folder names with spaces must be URL-encoded when used in raw GitHub URLs. The `requests` library in Python handles this automatically, but if constructing URLs manually, replace spaces with `%20`.

---

*End of icon asset creation plan.*
