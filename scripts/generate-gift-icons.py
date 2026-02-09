#!/usr/bin/env python3
"""Generate gift icon assets by compositing Fluent Emoji 3D onto pastel backgrounds.

Source: Microsoft Fluent Emoji (MIT license)
Repo cloned to: /tmp/fluentui-emoji (sparse checkout, 3D assets only)
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw

# ── Configuration ──────────────────────────────────────────────────
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons" / "gifts"
FLUENT_DIR = Path("/tmp/fluentui-emoji/assets")
CANVAS_SIZE = 320
CORNER_RADIUS = 40
EMOJI_SIZE = 200
EMOJI_OFFSET = (CANVAS_SIZE - EMOJI_SIZE) // 2  # 60px

# ── Icon Manifest ──────────────────────────────────────────────────
# (our_icon_id, relative_path_to_3d_png_under_assets_dir, bg_hex)

ICONS = [
    # Active & Outdoors (#E8F0E4)
    ("bicycle",         "Bicycle/3D/bicycle_3d.png",                                     "#E8F0E4"),
    ("scooter",         "Kick scooter/3D/kick_scooter_3d.png",                           "#E8F0E4"),
    ("soccer-ball",     "Soccer ball/3D/soccer_ball_3d.png",                              "#E8F0E4"),
    ("skateboard",      "Skateboard/3D/skateboard_3d.png",                                "#E8F0E4"),
    ("swimming",        "Goggles/3D/goggles_3d.png",                                     "#E8F0E4"),

    # Creative & Performing Arts (#F8E8EE)
    ("ballet",          "Ballet shoes/3D/ballet_shoes_3d.png",                            "#F8E8EE"),
    ("paint-palette",   "Artist palette/3D/artist_palette_3d.png",                        "#F8E8EE"),
    ("guitar",          "Guitar/3D/guitar_3d.png",                                        "#F8E8EE"),
    ("microphone",      "Microphone/3D/microphone_3d.png",                                "#F8E8EE"),
    ("camera",          "Camera/3D/camera_3d.png",                                        "#F8E8EE"),

    # Learning & Discovery (#E8EAF6)
    ("books",           "Books/3D/books_3d.png",                                          "#E8EAF6"),
    ("telescope",       "Telescope/3D/telescope_3d.png",                                  "#E8EAF6"),
    ("microscope",      "Microscope/3D/microscope_3d.png",                                "#E8EAF6"),
    ("building-blocks", "Brick/3D/brick_3d.png",                                          "#E8EAF6"),
    ("globe",           "Globe showing americas/3D/globe_showing_americas_3d.png",        "#E8EAF6"),

    # Imaginative Play (#FFF3E0)
    ("teddy-bear",      "Teddy bear/3D/teddy_bear_3d.png",                                "#FFF3E0"),
    ("dollhouse",       "House with garden/3D/house_with_garden_3d.png",                   "#FFF3E0"),
    ("superhero-cape",  "Person superhero/Default/3D/person_superhero_3d_default.png",     "#FFF3E0"),
    ("castle",          "Castle/3D/castle_3d.png",                                         "#FFF3E0"),
    ("pirate-ship",     "Sailboat/3D/sailboat_3d.png",                                     "#FFF3E0"),

    # Tech & Gaming (#E0F2F1)
    ("tablet",          "Laptop/3D/laptop_3d.png",                                         "#E0F2F1"),
    ("game-controller", "Video game/3D/video_game_3d.png",                                 "#E0F2F1"),
    ("headphones",      "Headphone/3D/headphone_3d.png",                                   "#E0F2F1"),
    ("robot",           "Robot/3D/robot_3d.png",                                           "#E0F2F1"),
    ("drone",           "Helicopter/3D/helicopter_3d.png",                                 "#E0F2F1"),

    # Experiences (#FFF9E6)
    ("amusement-park",  "Ferris wheel/3D/ferris_wheel_3d.png",                             "#FFF9E6"),
    ("camping",         "Camping/3D/camping_3d.png",                                       "#FFF9E6"),
    ("plane-ticket",    "Airplane/3D/airplane_3d.png",                                     "#FFF9E6"),
    ("zoo",             "Lion/3D/lion_3d.png",                                             "#FFF9E6"),
    ("movie",           "Clapper board/3D/clapper_board_3d.png",                           "#FFF9E6"),
]


def hex_to_rgba(hex_color: str) -> tuple:
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


def compose_icon(emoji_path: Path, bg_color: str) -> Image.Image:
    """Compose an emoji onto a pastel rounded-rectangle background."""
    bg_rgba = hex_to_rgba(bg_color)

    # Create background canvas (transparent outside rounded rect)
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    bg_layer = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), bg_rgba)
    mask = create_rounded_rect_mask(CANVAS_SIZE, CORNER_RADIUS)
    canvas.paste(bg_layer, (0, 0), mask)

    # Load and resize emoji
    emoji_img = Image.open(emoji_path).convert("RGBA")
    emoji_resized = emoji_img.resize((EMOJI_SIZE, EMOJI_SIZE), Image.LANCZOS)

    # Alpha-composite the emoji centred on the background
    canvas.paste(emoji_resized, (EMOJI_OFFSET, EMOJI_OFFSET), emoji_resized)

    return canvas


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    successes = []
    failures = []

    for i, (icon_id, rel_path, bg_hex) in enumerate(ICONS):
        print(f"[{i+1}/{len(ICONS)}] {icon_id}")
        source_path = FLUENT_DIR / rel_path
        try:
            if not source_path.exists():
                raise FileNotFoundError(f"Source not found: {source_path}")

            composed = compose_icon(source_path, bg_hex)
            output_path = OUTPUT_DIR / f"{icon_id}.png"
            composed.save(str(output_path), "PNG", optimize=True)

            size_kb = output_path.stat().st_size / 1024
            dims = composed.size
            print(f"  ✓ {output_path.name} — {dims[0]}x{dims[1]}, {size_kb:.1f} KB")
            successes.append(icon_id)
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            failures.append((icon_id, str(e)))

    print(f"\n{'='*60}")
    print(f"Result: {len(successes)}/30 succeeded, {len(failures)} failed.")
    if failures:
        print("\nFailed icons:")
        for icon_id, err in failures:
            print(f"  - {icon_id}: {err}")

    return len(failures)


if __name__ == "__main__":
    sys.exit(main())
