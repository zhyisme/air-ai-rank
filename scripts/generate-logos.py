"""
Generate PNG images for logo and OG image from the SVG logo.
Run: python scripts/generate-logos.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

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
    """Create 1200x630 OG image for social sharing"""
    w, h = 1200, 630
    img = Image.new('RGBA', (w, h), (15, 15, 26, 255))
    draw = ImageDraw.Draw(img)

    # Gradient overlay
    for x in range(w):
        progress = x / w
        r = int(15 + progress * 20)
        g = int(15 + progress * 10)
        b = int(26 + progress * 30)
        draw.line([(x, 0), (x, h)], fill=(r, g, b, 255))

    # Subtle grid
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(139, 92, 246, 8))
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(139, 92, 246, 8))

    # Crystal ball
    cx, cy, r = w // 2, 230, 100
    # Outer glow
    for i in range(15, 0, -1):
        alpha = int(15 * i / 15)
        draw.ellipse(
            [cx - r - i * 4, cy - r - i * 4, cx + r + i * 4, cy + r + i * 4],
            fill=(139, 92, 246, alpha)
        )
    # Main sphere
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(124, 58, 237, 230))
    # Highlight
    draw.ellipse([cx - 55, cy - 65, cx + 10, cy - 10], fill=(196, 181, 253, 60))
    # Sparkle dots
    for dx, dy, dot_r in [(-30, -10, 5), (25, 20, 4), (5, 40, 3), (-40, 25, 3)]:
        draw.ellipse([cx + dx - dot_r, cy + dy - dot_r, cx + dx + dot_r, cy + dy + dot_r],
                     fill=(224, 215, 255, 200))
    # Base
    draw.rounded_rectangle([cx - 60, cy + r - 8, cx + 60, cy + r + 15], radius=5, fill=(46, 27, 75, 200))

    # "AIR" text
    try:
        font_air = ImageFont.truetype("arial.ttf", 96)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 32)
        font_tag = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 24)
    except:
        font_air = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_tag = ImageFont.load_default()

    # AIR with gradient effect (simplified: use purple)
    draw.text((cx, cy + r + 60), "AIR", fill=(139, 92, 246, 255), font=font_air, anchor="mm")
    draw.text((cx, cy + r + 110), "AI 段 位 实 况", fill=(139, 139, 167, 255), font=font_sub, anchor="mm")
    draw.text((cx, cy + r + 150), "12种AI人格 · 3分钟测出你的AI灵魂", fill=(107, 114, 128, 255), font=font_tag, anchor="mm")

    # Decorative dots
    for x, y, dot_r, color in [
        (200, 500, 4, (139, 92, 246, 80)),
        (280, 520, 3, (6, 182, 212, 60)),
        (920, 520, 3, (139, 92, 246, 60)),
        (1000, 500, 4, (6, 182, 212, 80)),
    ]:
        draw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=color)

    path = os.path.join(PUBLIC_DIR, 'logo-og.png')
    img.save(path, 'PNG')
    print(f"Created: {path} ({w}x{h})")


if __name__ == '__main__':
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    create_logo_192()
    create_og_image()
    print("Done! Logo images generated.")
