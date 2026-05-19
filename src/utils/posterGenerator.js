import QRCode from 'qrcode';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import { calculateRank, calculateRarity } from './rankCalculator';
import { DIMENSIONS, DIMENSION_LABELS } from './calculator';

/** Base URL for share links - Fixed to production URL */
const BASE_URL = 'https://zhyisme.github.io/air-ai-rank/';

/** Poster dimensions */
const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1200;

/** Dimension labels for radar chart */
const DIMENSION_SHORT_LABELS = ['深度', '技能', '创造', '表达', '逻辑', '直觉', '协作', '独立'];

/**
 * Generate a share poster as a data URL using Canvas.
 * Professional layout with proper spacing and harmony.
 */
export async function generatePoster(result) {
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);

  const canvas = document.createElement('canvas');
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  const centerX = POSTER_WIDTH / 2;

  // === Background ===
  const bgGradient = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  bgGradient.addColorStop(0, '#0F0F1A');
  bgGradient.addColorStop(0.5, '#1A1A2E');
  bgGradient.addColorStop(1, '#0F0F1A');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Accent glow
  const accentGradient = ctx.createRadialGradient(centerX, 180, 30, centerX, 180, 350);
  accentGradient.addColorStop(0, type.color + '25');
  accentGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // === Top Section: Emoji ===
  ctx.font = '120px sans-serif';
  ctx.fillText(type.emoji, centerX, 130);

  // === Type Name ===
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.name, centerX, 210);

  // === Golden Quote ===
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#E5E7EB';
  wrapText(ctx, `"${type.goldenQuote}"`, centerX, 265, 640, 38);

  // === Divider Line 1 ===
  drawDivider(ctx, 60, 330, 690);

  // === Rank Section ===
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = rank.color;
  ctx.fillText(`${rank.emoji} ${rank.name}段位`, centerX, 365);

  ctx.font = '20px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(`仅 ${rarity}% 的人与你同频`, centerX, 400);

  // === Radar Chart ===
  drawRadarChart(ctx, result.scores, type.color, centerX, 580, 200);

  // === Divider Line 2 ===
  drawDivider(ctx, 60, 820, 690);

  // === Soul Questions Section ===
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('💬 灵魂拷问', centerX, 855);

  if (type.soulQuestions && type.soulQuestions.length > 0) {
    const question = type.soulQuestions[0];
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillStyle = '#D1D5DB';
    wrapText(ctx, question, centerX, 895, 620, 32);
  }

  // === QR Code ===
  const qrData = BASE_URL;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 140,
      margin: 1,
      color: { dark: '#FFFFFF', light: '#0F0F1A00' },
    });
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, centerX - 70, 950, 140, 140);
  } catch (e) {
    // Fallback QR placeholder
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 70, 950, 140, 140);
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px sans-serif';
    ctx.fillText('扫码测试', centerX, 1020);
  }

  // === Brand Section ===
  const brandGradient = ctx.createLinearGradient(60, 1110, 690, 1150);
  brandGradient.addColorStop(0, type.color + '30');
  brandGradient.addColorStop(0.5, type.color + '15');
  brandGradient.addColorStop(1, type.color + '30');
  ctx.fillStyle = brandGradient;
  roundRect(ctx, 60, 1105, 630, 60, 8);
  ctx.fill();

  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.shadowColor = type.color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('你的AI灵魂', centerX, 1135);
  ctx.shadowBlur = 0;

  // === Footer URL ===
  ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(BASE_URL, centerX, 1175);

  return canvas.toDataURL('image/png');
}

/**
 * Draw a horizontal divider line.
 */
function drawDivider(ctx, x, y, width) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, 1);
}

/**
 * Draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a radar chart on canvas.
 */
function drawRadarChart(ctx, scores, color, centerX, centerY, size) {
  const numDims = DIMENSIONS.length;
  const maxRadius = size / 2 - 25;
  const levels = 4;

  // Draw grid circles and axes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let level = 1; level <= levels; level++) {
    const r = (level / levels) * maxRadius;
    ctx.beginPath();
    for (let i = 0; i <= numDims; i++) {
      const idx = i % numDims;
      const angle = (Math.PI * 2 * idx) / numDims - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Draw axis lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < numDims; i++) {
    const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
    const x = centerX + maxRadius * Math.cos(angle);
    const y = centerY + maxRadius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Draw data polygon
  const points = [];
  for (let i = 0; i < numDims; i++) {
    const dim = DIMENSIONS[i];
    const value = (scores[dim] || 0) / 100;
    const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
    const r = value * maxRadius;
    points.push({ x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) });
  }

  // Fill data area with gradient
  const fillGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
  fillGradient.addColorStop(0, color + '40');
  fillGradient.addColorStop(1, color + '10');
  ctx.fillStyle = fillGradient;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw data points
  ctx.fillStyle = color;
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw dimension labels and scores
  const labelRadius = maxRadius + 18;
  for (let i = 0; i < numDims; i++) {
    const dim = DIMENSIONS[i];
    const value = scores[dim] || 0;
    const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
    const lx = centerX + labelRadius * Math.cos(angle);
    const ly = centerY + labelRadius * Math.sin(angle);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(DIMENSION_SHORT_LABELS[i], lx, ly - 8);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = color;
    ctx.fillText(value, lx, ly + 8);
  }
}

/**
 * Wrap text on canvas within a given width.
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let lineY = y - (chars.length > 30 ? lineHeight : 0);

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
