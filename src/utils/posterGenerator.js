import QRCode from 'qrcode';
import AI_TYPES from '../data/types';
import RANKS from '../data/ranks';
import { calculateRank, calculateRarity } from './rankCalculator';
import { DIMENSIONS, DIMENSION_LABELS } from './calculator';

/** Base URL for share links - Fixed to production URL */
const BASE_URL = 'https://zhyisme.github.io/air-ai-rank/';

/**
 * Generate a share poster as a data URL using Canvas.
 * Enhanced layout with radar chart and soul questions.
 * @param {Object} result - { typeId, scores, timestamp }
 * @returns {Promise<string>} Data URL of the generated poster image
 */
export async function generatePoster(result) {
  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const rank = calculateRank(result.scores);
  const rarity = calculateRarity(result.typeId);

  // Enhanced poster with more content — 750x1300
  const width = 750;
  const height = 1300;
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

  // 2. Personality emoji — 140px, Y=150
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '140px sans-serif';
  ctx.fillText(type.emoji, width / 2, 150);

  // 3. Type name — 64px, Y=270
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = type.color;
  ctx.fillText(type.name, width / 2, 270);

  // 4. Golden quote — 32px, Y=340, wrapText maxWidth=620, lineHeight=44
  ctx.font = '32px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#E5E7EB';
  const quoteText = `"${type.goldenQuote}"`;
  wrapText(ctx, quoteText, width / 2, 340, 620, 44);

  // 5. Rank + Rarity row — Y=420
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = rank.color;
  ctx.fillText(`${rank.emoji} ${rank.name}段位`, width / 2, 420);

  ctx.font = '26px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(`仅 ${rarity}% 的人与你同频`, width / 2, 460);

  // 6. Radar Chart — draw a mini radar chart, Y center at 680
  drawRadarChart(ctx, result.scores, type.color, width / 2, 680, 140);

  // 7. Soul Questions section — Y=880
  ctx.fillStyle = type.color + '40';
  ctx.fillRect(40, 860, width - 80, 2);

  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('💬 灵魂拷问', width / 2, 900);

  // Draw first soul question
  if (type.soulQuestions && type.soulQuestions.length > 0) {
    const question = type.soulQuestions[0];
    ctx.font = '26px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillStyle = '#D1D5DB';
    wrapText(ctx, question, width / 2, 950, 640, 38);
  }

  // 8. QR code — 180x180, Y=1080 (smaller to fit content)
  const qrData = `${BASE_URL}?ref=${result.typeId}&personality=${result.typeId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 180,
      margin: 1,
      color: { dark: '#FFFFFF', light: '#0F0F1A00' },
    });
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, width / 2 - 90, 1080, 180, 180);
  } catch (e) {
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 90, 1080, 180, 180);
    ctx.fillStyle = '#6B7280';
    ctx.font = '18px sans-serif';
    ctx.fillText('扫码测试', width / 2, 1170);
  }

  // 9. Brand LOGO — Eye-catching design
  const logoGradient = ctx.createLinearGradient(0, 1200, 0, 1260);
  logoGradient.addColorStop(0, type.color + '40');
  logoGradient.addColorStop(0.5, type.color + '20');
  logoGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = logoGradient;
  ctx.fillRect(50, 1190, width - 100, 80);

  // Brand text — 42px bold
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.shadowColor = type.color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('你的AI灵魂', width / 2, 1230);
  ctx.shadowBlur = 0;

  // URL — 20px, Y=1280
  ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(BASE_URL, width / 2, 1280);

  return canvas.toDataURL('image/png');
}

/**
 * Draw a mini radar chart on canvas.
 */
function drawRadarChart(ctx, scores, color, centerX, centerY, size) {
  const numDims = DIMENSIONS.length;
  const maxRadius = size / 2 - 10;
  const levels = 4;

  // Draw grid circles
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let level = 1; level <= levels; level++) {
    const r = (level / levels) * maxRadius;
    ctx.beginPath();
    for (let i = 0; i < numDims; i++) {
      const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
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
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    points.push({ x, y });
  }

  // Fill data area
  ctx.fillStyle = color + '25';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw data points
  ctx.fillStyle = color;
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw dimension labels (abbreviated)
  const labels = ['深度', '技能', '创造', '表达', '逻辑', '直觉', '协作', '独立'];
  for (let i = 0; i < numDims; i++) {
    const dim = DIMENSIONS[i];
    const value = scores[dim] || 0;
    const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
    const labelR = maxRadius + 18;
    const x = centerX + labelR * Math.cos(angle);
    const y = centerY + labelR * Math.sin(angle);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(labels[i], x, y);

    ctx.font = '14px monospace';
    ctx.fillStyle = color;
    ctx.fillText(value, x, y + 14);
  }
}

/**
 * Wrap text on canvas within a given width.
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
