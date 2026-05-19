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
 * Save poster image to phone album.
 * Strategy order:
 * 1. Web Share API with file → user can "Save Image" from share sheet (mobile non-WeChat)
 * 2. <a download> (desktop, Chrome Android)
 * 3. Open blob image in new window for long-press save (iOS, WeChat, Android)
 * 4. Direct blob URL for WeChat long-press (most compatible)
 * 5. WeChat screenshot fallback
 *
 * @param {string} dataUrl - base64 data URL of the poster
 * @param {string} filename - filename for download
 * @param {string} blobUrl - optional blob URL for better WeChat compatibility
 * @returns {Promise<string>} 'shared'|'downloaded'|'opened'|'blob-saved'|'wechat-screenshot'|'cancelled'|'failed'
 */
export async function saveToAlbum(dataUrl, filename = 'AI灵魂海报.png', blobUrl = null) {
  // Strategy 0: WeChat-specific blob URL approach (most reliable for WeChat)
  // Use blob URL if available, otherwise convert data URL to blob
  if (isWeChat()) {
    try {
      // Use provided blob URL or create one from data URL
      const imageUrl = blobUrl || dataUrl;
      
      // Try opening in new window with blob URL
      const newWin = window.open('', '_blank');
      if (newWin) {
        // Create a clean, optimized page for saving
        const pageHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>保存海报</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: linear-gradient(180deg, #0F0F1A 0%, #1A1A2E 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
    }
    .poster-container {
      width: 100%;
      max-width: 360px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .poster-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .tip {
      margin-top: 24px;
      text-align: center;
      color: #9CA3AF;
      font-size: 15px;
      line-height: 1.6;
    }
    .tip strong {
      color: #FFFFFF;
      font-size: 16px;
    }
    .close-btn {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #9CA3AF;
      padding: 12px 40px;
      border-radius: 25px;
      font-size: 14px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <img src="${imageUrl}" crossorigin="anonymous" />
  </div>
  <p class="tip">
    <strong>👆 长按图片</strong><br/>
    选择「保存图片」<br/>
    <span style="font-size:13px;color:#6B7280">保存后即可分享到朋友圈</span>
  </p>
  <button class="close-btn" onclick="window.close()">✕ 关闭</button>
</body>
</html>`;
        newWin.document.write(pageHtml);
        newWin.document.close();
        return 'opened';
      }
    } catch (e) {
      // Continue to fallback strategies
    }
  }

  // Strategy 1: Web Share API with file (best for mobile - user gets system share sheet)
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
      // Fall through
    }
  }

  // Strategy 2: <a download> (works on desktop, Chrome Android)
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

  // Strategy 3: WeChat screenshot fallback
  if (isWeChat()) {
    return 'wechat-screenshot';
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
 * Trigger native sharing.
 *
 * Strategy (in order):
 * 1. Web Share API Level 2: share image file + text (if poster available)
 * 2. Web Share API Level 1: share text + URL
 * 3. In WeChat: copy to clipboard + show guide
 * 4. Fallback: copy text+URL to clipboard
 *
 * @param {Object} type - The AI type object
 * @param {string} typeId - Type ID for URL generation
 * @param {string|null} posterDataUrl - Optional base64 poster image
 * @returns {Promise<string>} Action taken: 'shared'|'copied'|'wechat-guide'|'failed'
 */
export async function triggerShare(type, typeId, posterDataUrl = null) {
  const shareText = generateShareText(type);
  const shareUrl = generateShareUrl(typeId);

  // Level 2: Share image + text (Chrome Android, Safari iOS)
  if (posterDataUrl && typeof navigator.canShare === 'function') {
    try {
      const response = await fetch(posterDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'AI段位实况.png', { type: 'image/png' });
      const data = { title: 'AIR·AI段位实况', text: shareText, files: [file] };
      if (navigator.canShare(data)) {
        await navigator.share(data);
        return 'shared';
      }
    } catch (e) {
      // Not supported or cancelled, fall through
    }
  }

  // Level 1: Share text + URL (standard Web Share API)
  if (typeof navigator.share === 'function' && !isWeChat()) {
    try {
      await navigator.share({ title: 'AIR·AI段位实况', text: shareText, url: shareUrl });
      return 'shared';
    } catch (e) {
      // User cancelled, fall through
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // WeChat or fallback: copy to clipboard
  const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
  if (isWeChat()) {
    return 'wechat-guide'; // Caller should show WeChat guide overlay
  }
  return success ? 'copied' : 'failed';
}
