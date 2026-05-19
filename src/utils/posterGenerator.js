import QRCode from 'qrcode';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import { DIMENSIONS, DIMENSION_LABELS } from './calculator';
import { calculateRank, calculateRarity } from './rankCalculator';

/** Base URL for share links */
const BASE_URL = typeof window !== 'undefined'
  ? window.location.origin + '/air-ai-rank/'
  : 'https://example.com/air-ai-rank/';

/**
 * Generate a share poster as a data URL using Canvas.
 * @param {Object} result - { typeId, scores, timestamp }
 * @returns {Promise<string>} Data URL of the generated poster image
 */
export async function generatePoster(result) {
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);

  // 2x DPI for retina
  const width = 750;
  const height = 1334;
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
  const accentGradient = ctx.createRadialGradient(width / 2, 300, 50, width / 2, 300, 500);
  accentGradient.addColorStop(0, type.color + '30');
  accentGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Personality emoji + name
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Emoji
  ctx.font = '120px sans-serif';
  ctx.fillText(type.emoji, width / 2, 200);

  // Type name
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.name, width / 2, 320);

  // 3. Golden quote
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#E5E7EB';
  const quoteText = `"${type.goldenQuote}"`;
  wrapText(ctx, quoteText, width / 2, 400, 600, 40);

  // 4. Rank label
  const rankY = 520;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = rank.color;
  ctx.fillText(`${rank.emoji} ${rank.name}段位`, width / 2, rankY);

  // 5. Rarity info
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(`仅 ${rarity}% 的人与你同频`, width / 2, rankY + 50);

  // 6. Mini radar chart
  drawMiniRadar(ctx, width / 2, 720, 150, result.scores, type.color);

  // Dimension labels around radar
  DIMENSIONS.forEach((dim, i) => {
    const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const labelR = 195;
    const lx = width / 2 + labelR * Math.cos(angle);
    const ly = 720 + labelR * Math.sin(angle);
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${DIMENSION_LABELS[dim]} ${result.scores[dim] || 0}`, lx, ly);
  });

  // 7. QR code
  const qrData = `${BASE_URL}?ref=${result.typeId}&personality=${result.typeId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 160,
      margin: 1,
      color: { dark: '#FFFFFF', light: '#0F0F1A00' },
    });
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, width / 2 - 80, 1000, 160, 160);
  } catch (e) {
    // Fallback: draw a placeholder rectangle
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 80, 1000, 160, 160);
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px sans-serif';
    ctx.fillText('扫码测试', width / 2, 1080);
  }

  // 8. Brand identity
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('AIR·AI段位实况', width / 2, 1220);
  ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(BASE_URL, width / 2, 1260);

  // Short label tag
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.shortLabel, width / 2, 1300);

  return canvas.toDataURL('image/png');
}

/**
 * Draw a mini radar chart on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius - Max radius
 * @param {Object} scores - Dimension scores
 * @param {string} color - Type color hex
 */
function drawMiniRadar(ctx, cx, cy, radius, scores, color) {
  const levels = 3;
  const dimCount = DIMENSIONS.length;

  // Grid levels
  for (let level = 1; level <= levels; level++) {
    const r = (level / levels) * radius;
    ctx.beginPath();
    for (let i = 0; i < dimCount; i++) {
      const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < dimCount; i++) {
    const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data area
  ctx.beginPath();
  for (let i = 0; i < dimCount; i++) {
    const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
    const value = (scores[DIMENSIONS[i]] || 0) / 100;
    const r = value * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color + '25';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  for (let i = 0; i < dimCount; i++) {
    const angle = (Math.PI * 2 * i) / dimCount - Math.PI / 2;
    const value = (scores[DIMENSIONS[i]] || 0) / 100;
    const r = value * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
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
