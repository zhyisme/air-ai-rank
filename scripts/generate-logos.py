"""
Generate PNG images for logo and OG image from the SVG logo.
Run: python scripts/generate-logos.py
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')


def create_logo_192():
    """Create 192x192 favicon/logo PNG"""
    size = 192
    img = Image.new('RGBA', (size, size), (15, 15, 26, 255))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background
    margin = 8
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=32,
        fill=(15, 15, 26, 255),
        outline=(139, 92, 246, 80),
        width=2
    )

    # Crystal ball (circle)
    cx, cy, r = size // 2, 70, 45
    # Outer glow
    for i in range(5, 0, -1):
        alpha = int(20 * i / 5)
        draw.ellipse(
            [cx - r - i * 3, cy - r - i * 3, cx + r + i * 3, cy + r + i * 3],
            fill=(139, 92, 246, alpha)
        )
    # Main sphere
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(124, 58, 237, 220))
    # Highlight
    draw.ellipse([cx - 25, cy - 30, cx + 5, cy - 5], fill=(196, 181, 253, 80))
    # Sparkle dots
    for dx, dy, dot_r in [(-15, -5, 3), (12, 10, 2), (0, 18, 2)]:
        draw.ellipse([cx + dx - dot_r, cy + dy - dot_r, cx + dx + dot_r, cy + dy + dot_r],
                     fill=(224, 215, 255, 200))

    # Base
    draw.rounded_rectangle([cx - 30, cy + r - 5, cx + 30, cy + r + 8], radius=3, fill=(46, 27, 75, 200))

    # "AIR" text — white to match new vibrant design
    try:
        font_large = ImageFont.truetype("arial.ttf", 48)
        font_small = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 14)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.text((cx, cy + r + 30), "AIR", fill=(255, 255, 255, 255), font=font_large, anchor="mm")
    draw.text((cx, cy + r + 55), "AI段位实况", fill=(196, 181, 253, 255), font=font_small, anchor="mm")

    path = os.path.join(PUBLIC_DIR, 'logo-192.png')
    img.save(path, 'PNG')
    print(f"Created: {path} ({size}x{size})")


def create_og_image():
    """Create 1200x630 OG image — bold, eye-catching design"""
    w, h = 1200, 630
    img = Image.new('RGBA', (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background: vivid gradient purple → pink/magenta
    for x in range(w):
        progress = x / w
        r_val = int(124 + progress * 99)   # 7C → DB
        g_val = int(58 + progress * (39 - 58))  # 3A → 27
        b_val = int(237 + progress * (119 - 237))  # ED → 77
        draw.line([(x, 0), (x, h)], fill=(r_val, g_val, b_val, 255))

    # 2. Subtle vertical light streaks for energy
    for x_pos in [200, 400, 600, 800, 1000]:
        for dx in range(-15, 16):
            alpha = max(0, 20 - abs(dx))
            draw.line([(x_pos + dx, 0), (x_pos + dx, h)], fill=(255, 255, 255, alpha))

    # 3. Crystal ball (decorative, top-right)
    cx, cy, r = 980, 140, 70
    for i in range(12, 0, -1):
        alpha = int(15 * i / 12)
        draw.ellipse(
            [cx - r - i * 4, cy - r - i * 4, cx + r + i * 4, cy + r + i * 4],
            fill=(255, 255, 255, min(alpha, 40))
        )
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 50))
    draw.ellipse([cx - 30, cy - 40, cx + 5, cy - 5], fill=(255, 255, 255, 40))
    for dx, dy, dot_r in [(-20, -10, 4), (15, 15, 3), (0, 25, 3)]:
        draw.ellipse([cx + dx - dot_r, cy + dy - dot_r, cx + dx + dot_r, cy + dy + dot_r],
                     fill=(255, 255, 255, 100))

    # 4. "AIR" top-left branding
    try:
        font_brand = ImageFont.truetype("arial.ttf", 40)
        font_main = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 180)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 36)
    except:
        font_brand = ImageFont.load_default()
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # AIR branding
    draw.text((80, 50), "AIR", fill=(255, 255, 255, 180), font=font_brand)

    # 5. Main text "你的AI灵魂" — huge, white, center
    main_y = h // 2 + 10
    # Shadow
    draw.text((w // 2 + 3, main_y + 3), "你的AI灵魂", fill=(0, 0, 0, 80), font=font_main, anchor="mm")
    # Main
    draw.text((w // 2, main_y), "你的AI灵魂", fill=(255, 255, 255, 255), font=font_main, anchor="mm")

    # 6. Subtitle at bottom
    draw.text((w // 2, h - 70), "3分钟测出你的AI人格 · 12种AI灵魂等你解锁", fill=(255, 255, 255, 160), font=font_sub, anchor="mm")

    # 7. Decorative dots
    for x, y, dot_r, color in [
        (120, 500, 4, (255, 255, 255, 60)),
        (300, 550, 3, (255, 255, 255, 50)),
        (500, 580, 2, (255, 255, 255, 40)),
        (700, 580, 3, (255, 255, 255, 50)),
        (900, 550, 4, (255, 255, 255, 60)),
        (1080, 500, 3, (255, 255, 255, 50)),
        (150, 200, 3, (255, 255, 255, 40)),
        (400, 100, 2, (255, 255, 255, 30)),
    ]:
        draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=color)

    # 8. Bottom accent line
    draw.line([(100, h - 30), (w - 100, h - 30)], fill=(255, 255, 255, 40), width=2)

    path = os.path.join(PUBLIC_DIR, 'logo-og.png')
    img.save(path, 'PNG')
    print(f"Created: {path} ({w}x{h})")


if __name__ == '__main__':
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    create_logo_192()
    create_og_image()
    print("Done! Logo images generated.")
