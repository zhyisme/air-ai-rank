import QRCode from 'qrcode';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import { calculateRank, calculateRarity } from './rankCalculator';

/** Base URL for share links */
const BASE_URL = typeof window !== 'undefined'
  ? window.location.origin + '/air-ai-rank/'
  : 'https://example.com/air-ai-rank/';

/**
 * Generate a share poster as a data URL using Canvas.
 * Compact layout without radar chart for better first-screen visibility.
 * @param {Object} result - { typeId, scores, timestamp }
 * @returns {Promise<string>} Data URL of the generated poster image
 */
export async function generatePoster(result) {
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);

  // Compact poster — 750x1100 (no radar chart, tighter layout)
  const width = 750;
  const height = 1100;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Gradient background based on type color
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0F0F1A');
  bgGradient.addColorStop(0.5, '#1A1A2E');
  bgGradient.addColorStop(1, '#0F0F1A');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Colored accent gradient overlay
  const accentGradient = ctx.createRadialGradient(width / 2, 200, 50, width / 2, 200, 500);
  accentGradient.addColorStop(0, type.color + '30');
  accentGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Personality emoji — 160px, Y=180
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '160px sans-serif';
  ctx.fillText(type.emoji, width / 2, 180);

  // 3. Type name — 72px, Y=310
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.name, width / 2, 310);

  // 4. Golden quote — 36px, Y=390, wrapText maxWidth=620, lineHeight=48
  ctx.font = '36px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#E5E7EB';
  const quoteText = `"${type.goldenQuote}"`;
  wrapText(ctx, quoteText, width / 2, 390, 620, 48);

  // 5. Rank label — 42px, Y=510
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = rank.color;
  ctx.fillText(`${rank.emoji} ${rank.name}段位`, width / 2, 510);

  // 6. Rarity info — 30px, Y=560
  ctx.font = '30px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(`仅 ${rarity}% 的人与你同频`, width / 2, 560);

  // 7. QR code — 200x200, Y=640
  const qrData = `${BASE_URL}?ref=${result.typeId}&personality=${result.typeId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: { dark: '#FFFFFF', light: '#0F0F1A00' },
    });
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, width / 2 - 100, 640, 200, 200);
  } catch (e) {
    // Fallback: draw a placeholder rectangle
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 100, 640, 200, 200);
    ctx.fillStyle = '#6B7280';
    ctx.font = '20px sans-serif';
    ctx.fillText('扫码测试', width / 2, 740);
  }

  // 8. Brand identity — 32px, Y=910
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('AIR·AI段位实况', width / 2, 910);

  // URL — 24px, Y=950
  ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(BASE_URL, width / 2, 950);

  // Short label tag — 28px, Y=990
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.shortLabel, width / 2, 990);

  return canvas.toDataURL('image/png');
}

/**
 * Wrap text on canvas within a given width.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @param {number} lineHeight
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let lineY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, lineY);
      line = chars[i];
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY);
}
