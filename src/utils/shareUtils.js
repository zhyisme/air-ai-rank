import AI_TYPES from '../data/types';

/** Base URL for share links */
const BASE_URL = typeof window !== 'undefined'
  ? window.location.origin + '/air-ai-rank/'
  : 'https://zhyisme.github.io/air-ai-rank/';

/** Full absolute URL for OG image */
const SITE_URL = 'https://zhyisme.github.io/air-ai-rank/';

/**
 * Detect if user is in WeChat browser.
 * @returns {boolean}
 */
export function isWeChat() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/i.test(ua);
}

/**
 * Detect if user is on iOS device.
 * @returns {boolean}
 */
export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detect if user is on Android device.
 * @returns {boolean}
 */
export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Generate share text for a given AI type.
 * Format: "承认吧，这才是你的AI灵魂！我是🔮AI先知，你呢？"
 */
export function generateShareText(type) {
  return `承认吧，这才是你的AI灵魂！我是${type.emoji}${type.name}，你呢？`;
}

/**
 * Generate a share URL with referral and personality parameters.
 * Returns absolute URL so it works everywhere.
 */
export function generateShareUrl(typeId) {
  return `${SITE_URL}?ref=${typeId}&personality=${typeId}`;
}

/**
 * Parse referral parameters from the current URL.
 * Looks for `ref` and `personality` query params.
 */
export function parseReferralParams() {
  if (typeof window === 'undefined') return { ref: null, personality: null };
  const params = new URLSearchParams(window.location.search);
  return {
    ref: params.get('ref') || null,
    personality: params.get('personality') || null,
  };
}

/**
 * Copy text to the system clipboard.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    return false;
  }
}

/**
 * Generate a save page HTML for WeChat with inline base64 image.
 * This ensures the image is always available for long-press save.
 */
function generateSavePageHtml(dataUrl, typeName) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>保存海报 - AI灵魂</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(180deg, #0F0F1A 0%, #1A1A2E 100%);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 120px;
    }
    .poster-wrapper {
      width: 100%;
      max-width: 320px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      background: #0F0F1A;
    }
    .poster-wrapper img {
      width: 100%;
      height: auto;
      display: block;
      touch-action: none;
      -webkit-touch-callout: default;
      -webkit-user-select: none;
      user-select: none;
      pointer-events: auto;
    }
    .tip-box {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.98) 40%);
      padding: 40px 20px 30px;
      text-align: center;
    }
    .tip-title {
      color: #FFFFFF;
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .tip-desc {
      color: #9CA3AF;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .save-btn {
      display: inline-block;
      background: linear-gradient(135deg, #7C3AED, #A855F7);
      color: #FFFFFF;
      padding: 14px 32px;
      border-radius: 25px;
      font-size: 15px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="poster-wrapper">
      <img src="${dataUrl}" alt="AI灵魂海报" />
    </div>
  </div>
  <div class="tip-box">
    <p class="tip-title">👆 长按图片保存到相册</p>
    <p class="tip-desc">保存后打开朋友圈，点击右上角相机图标<br/>选择这张图片发布即可</p>
    <span class="save-btn">✨ AI灵魂</span>
  </div>
</body>
</html>`;
}

/**
 * Save poster image to phone album.
 * 
 * In WeChat: Opens a new page with inline image for long-press save
 * Other browsers: Uses native share API or download link
 *
 * @param {string} dataUrl - base64 data URL of the poster (REQUIRED)
 * @param {string} filename - filename for download
 * @returns {Promise<string>} 'opened'|'downloaded'|'saved'|'cancelled'|'failed'
 */
export async function saveToAlbum(dataUrl, filename = 'AI灵魂海报.png') {
  // ALWAYS use data URL for maximum compatibility
  // Data URL is more reliable than blob URL in WeChat
  const imageUrl = dataUrl;

  // Strategy 1: Web Share API with file (non-WeChat browsers)
  if (typeof navigator.canShare === 'function' && !isWeChat()) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      const shareData = { files: [file], title: 'AI灵魂海报' };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return 'shared';
      }
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // Strategy 2: <a download> for desktop browsers
  if (!isWeChat()) {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return 'downloaded';
    } catch (e) {
      // Fall through
    }
  }

  // Strategy 3: WeChat - Open optimized save page with inline image
  if (isWeChat()) {
    try {
      const newWin = window.open('', '_blank');
      if (newWin) {
        // Use data URL directly in the page (most reliable for WeChat)
        const pageHtml = generateSavePageHtml(imageUrl, filename.replace('.png', ''));
        newWin.document.write(pageHtml);
        newWin.document.close();
        return 'opened';
      }
    } catch (e) {
      console.error('Failed to open save window:', e);
    }
  }

  return 'failed';
}

/**
 * Get the referral type object from URL personality param.
 */
export function getReferralType() {
  const { personality } = parseReferralParams();
  if (!personality) return null;
  return AI_TYPES.find(t => t.id === personality) || null;
}

/**
 * Trigger share functionality.
 * 
 * In WeChat: Opens a page with the poster image for saving,
 * then user can share manually from WeChat
 * 
 * Other browsers: Uses native share API
 *
 * @param {Object} type - The AI type object
 * @param {string} typeId - Type ID for URL generation
 * @param {string|null} posterDataUrl - Optional base64 poster image
 * @returns {Promise<string>} Action taken
 */
export async function triggerShare(type, typeId, posterDataUrl = null) {
  const shareText = generateShareText(type);
  const shareUrl = generateShareUrl(typeId);

  // WeChat: Open save page first, user will share manually after saving
  if (isWeChat() && posterDataUrl) {
    try {
      const newWin = window.open('', '_blank');
      if (newWin) {
        const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>分享海报 - AI灵魂</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(180deg, #0F0F1A 0%, #1A1A2E 100%);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 100px;
    }
    .share-title {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
    }
    .share-desc {
      color: #9CA3AF;
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .poster-wrapper {
      width: 100%;
      max-width: 320px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .poster-wrapper img {
      width: 100%;
      height: auto;
      display: block;
      pointer-events: none;
    }
    .tip-box {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.98) 40%);
      padding: 40px 20px 30px;
      text-align: center;
    }
    .tip-title {
      color: #FFFFFF;
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .tip-desc {
      color: #9CA3AF;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="share-title">📤 分享到朋友圈</h1>
    <p class="share-desc">${shareText}</p>
    <div class="poster-wrapper">
      <img src="${posterDataUrl}" alt="分享海报" />
    </div>
  </div>
  <div class="tip-box">
    <p class="tip-title">👆 长按保存图片</p>
    <p class="tip-desc">保存后打开朋友圈，点击相机图标<br/>选择图片发布即可</p>
  </div>
</body>
</html>`;
        newWin.document.write(pageHtml);
        newWin.document.close();
        
        // Copy share text to clipboard for convenience
        await copyToClipboard(shareText);
        
        return 'wechat-save-page';
      }
    } catch (e) {
      console.error('Failed to open share page:', e);
    }
  }

  // Level 2: Web Share API with image file (Chrome Android, Safari iOS)
  if (posterDataUrl && typeof navigator.canShare === 'function' && !isWeChat()) {
    try {
      const response = await fetch(posterDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'AI灵魂.png', { type: 'image/png' });
      const data = { title: 'AI灵魂测试', text: shareText, files: [file] };
      if (navigator.canShare(data)) {
        await navigator.share(data);
        return 'shared';
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Fall through
      }
    }
  }

  // Level 1: Web Share API with text + URL
  if (typeof navigator.share === 'function' && !isWeChat()) {
    try {
      await navigator.share({ title: 'AI灵魂测试', text: shareText, url: shareUrl });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // Fallback: Copy to clipboard
  const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
  if (isWeChat()) {
    return 'copied';
  }
  return success ? 'copied' : 'failed';
}
