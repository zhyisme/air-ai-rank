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
    # Main sphere gradient
    for y in range(cy - r, cy + r):
        progress = (y - (cy - r)) / (2 * r)
        r_val = int(224 - progress * 100)
        g_val = int(215 - progress * 150)
        b_val = int(255 - progress * 50)
        alpha = int(200 + progress * 55)
        draw.line([cx - r + abs(y - cy) * r // r, y, cx + r - abs(y - cy) * r // r, y],
                   fill=(r_val, g_val, b_val, alpha))

    # Simpler: solid gradient sphere
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(124, 58, 237, 220))
    # Highlight
    draw.ellipse([cx - 25, cy - 30, cx + 5, cy - 5], fill=(196, 181, 253, 80))
    # Sparkle dots
    for dx, dy, dot_r in [(-15, -5, 3), (12, 10, 2), (0, 18, 2)]:
        draw.ellipse([cx + dx - dot_r, cy + dy - dot_r, cx + dx + dot_r, cy + dy + dot_r],
                     fill=(224, 215, 255, 200))

    # Base
    draw.rounded_rectangle([cx - 30, cy + r - 5, cx + 30, cy + r + 8], radius=3, fill=(46, 27, 75, 200))

    # "AIR" text
    try:
        font_large = ImageFont.truetype("arial.ttf", 48)
        font_small = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 14)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.text((cx, cy + r + 30), "AIR", fill=(139, 92, 246, 255), font=font_large, anchor="mm")
    draw.text((cx, cy + r + 55), "AI段位实况", fill=(139, 139, 167, 255), font=font_small, anchor="mm")

    path = os.path.join(PUBLIC_DIR, 'logo-192.png')
    img.save(path, 'PNG')
    print(f"Created: {path} ({size}x{size})")


def create_og_image():
    """Create 1200x630 OG image for social sharing — redesigned with vibrant, eye-catching visuals"""
    w, h = 1200, 630
    img = Image.new('RGBA', (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background gradient: deep purple (#1a0a2e) → bright purple (#4c1d95)
    for y in range(h):
        progress = y / h
        r_val = int(26 + progress * 50)   # 1a → 4c
        g_val = int(10 + progress * 19)    # 0a → 1d
        b_val = int(46 + progress * 103)   # 2e → 95
        draw.line([(0, y), (w, y)], fill=(r_val, g_val, b_val, 255))

    # 2. Radial glow from center-top for depth
    glow_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    cx, cy = w // 2, 220
    for i in range(80, 0, -1):
        alpha = int(3 * i / 80 * 60)
        r_glow = int(100 + i * 5)
        glow_draw.ellipse(
            [cx - r_glow, cy - r_glow, cx + r_glow, cy + r_glow],
            fill=(139, 92, 246, min(alpha, 80))
        )
    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # 3. Subtle grid for tech feel
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(139, 92, 246, 10))
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(139, 92, 246, 10))

    # 4. Crystal ball with enhanced glow
    cx, cy, r = w // 2, 230, 110
    # Multiple glow layers for vibrant effect
    glow_layers = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layers)
    # Outer glow — larger and brighter
    for i in range(25, 0, -1):
        alpha = int(25 * i / 25 * 3)
        glow_draw.ellipse(
            [cx - r - i * 5, cy - r - i * 5, cx + r + i * 5, cy + r + i * 5],
            fill=(139, 92, 246, min(alpha, 100))
        )
    # Secondary warm glow
    for i in range(15, 0, -1):
        alpha = int(15 * i / 15 * 2)
        glow_draw.ellipse(
            [cx - r - i * 6, cy - r - i * 6, cx + r + i * 6, cy + r + i * 6],
            fill=(192, 132, 252, min(alpha, 60))
        )
    img = Image.alpha_composite(img, glow_layers)
    draw = ImageDraw.Draw(img)

    # Main sphere with brighter purple
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(139, 92, 246, 240))
    # Inner gradient highlight
    draw.ellipse([cx - r + 20, cy - r + 20, cx + r - 20, cy + r - 20], fill=(167, 139, 250, 80))
    # Bright highlight spot
    draw.ellipse([cx - 55, cy - 70, cx + 10, cy - 10], fill=(224, 215, 255, 90))
    # Sparkle dots — more of them, brighter
    for dx, dy, dot_r in [(-35, -15, 6), (30, 20, 5), (5, 45, 4), (-45, 28, 4), (20, -35, 3), (-20, 45, 3)]:
        draw.ellipse([cx + dx - dot_r, cy + dy - dot_r, cx + dx + dot_r, cy + dy + dot_r],
                     fill=(240, 230, 255, 230))
    # Base with glow
    draw.rounded_rectangle([cx - 70, cy + r - 8, cx + 70, cy + r + 18], radius=6, fill=(76, 29, 149, 220))
    # Base highlight line
    draw.rounded_rectangle([cx - 50, cy + r - 6, cx + 50, cy + r - 2], radius=2, fill=(167, 139, 250, 60))

    # 5. "AIR" text — 200px, white with purple tint (simulated gradient with two layers)
    try:
        font_air = ImageFont.truetype("arial.ttf", 200)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 48)
        font_tag = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 36)
    except:
        font_air = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_tag = ImageFont.load_default()

    air_y = cy + r + 90
    # Shadow layer — darker purple, slightly offset
    draw.text((cx + 3, air_y + 3), "AIR", fill=(88, 28, 135, 180), font=font_air, anchor="mm")
    # Main layer — white with slight purple tint
    draw.text((cx, air_y), "AIR", fill=(240, 230, 255, 255), font=font_air, anchor="mm")
    # Highlight layer — bright core
    draw.text((cx - 1, air_y - 1), "AIR", fill=(255, 255, 255, 60), font=font_air, anchor="mm")

    # 6. Subtitle "AI段位实况" — 48px, white
    sub_y = air_y + 75
    draw.text((cx, sub_y), "AI 段 位 实 况", fill=(255, 255, 255, 240), font=font_sub, anchor="mm")

    # 7. Tagline — 36px, bright cyan (#06B6D4)
    tag_y = sub_y + 55
    draw.text((cx, tag_y), "承认吧，这才是你的AI灵魂", fill=(6, 182, 212, 255), font=font_tag, anchor="mm")

    # 8. Decorative particles / light dots scattered around
    particles = [
        (150, 120, 3, (139, 92, 246, 120)),
        (250, 80, 2, (6, 182, 212, 100)),
        (350, 150, 4, (167, 139, 250, 80)),
        (950, 100, 3, (6, 182, 212, 100)),
        (1050, 130, 4, (139, 92, 246, 120)),
        (850, 80, 2, (167, 139, 250, 90)),
        (180, 500, 3, (139, 92, 246, 80)),
        (300, 530, 2, (6, 182, 212, 70)),
        (900, 530, 2, (139, 92, 246, 70)),
        (1020, 500, 3, (6, 182, 212, 80)),
        (120, 350, 2, (252, 211, 77, 60)),
        (1080, 350, 2, (252, 211, 77, 60)),
        (500, 570, 2, (139, 92, 246, 50)),
        (700, 580, 3, (6, 182, 212, 60)),
        (400, 50, 2, (6, 182, 212, 50)),
        (800, 50, 2, (252, 211, 77, 50)),
        (600, 590, 2, (167, 139, 250, 40)),
    ]
    for px, py, pr, color in particles:
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=color)
        # Tiny glow around each particle
        for gi in range(3, 0, -1):
            ga = max(color[3] // (gi + 1), 5)
            draw.ellipse([px - pr - gi * 2, py - pr - gi * 2, px + pr + gi * 2, py + pr + gi * 2],
                         fill=(color[0], color[1], color[2], ga))

    # 9. Bottom decorative line
    draw.line([(100, h - 30), (w - 100, h - 30)], fill=(139, 92, 246, 30), width=1)

    path = os.path.join(PUBLIC_DIR, 'logo-og.png')
    img.save(path, 'PNG')
    print(f"Created: {path} ({w}x{h})")


if __name__ == '__main__':
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    create_logo_192()
    create_og_image()
    print("Done! Logo images generated.")
