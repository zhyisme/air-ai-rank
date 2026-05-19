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
 * 3. Open image in new window for long-press save (iOS, WeChat fallback)
 * 4. WeChat screenshot fallback
 *
 * @param {string} dataUrl - base64 data URL of the poster
 * @param {string} filename - filename for download
 * @returns {Promise<string>} 'shared'|'downloaded'|'opened'|'wechat-screenshot'|'cancelled'|'failed'
 */
export async function saveToAlbum(dataUrl, filename = 'AI段位实况海报.png') {
  // Strategy 1: Web Share API with file (best for mobile - user gets system share sheet)
  // In WeChat, navigator.share is not available, so this is skipped
  if (typeof navigator.canShare === 'function' && !isWeChat()) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      const shareData = { files: [file], title: 'AI段位实况海报' };
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

  // Strategy 3: Open image in a new window for long-press save
  // This works on iOS Safari and might work in some WeChat versions
  try {
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.write(`<!DOCTYPE html><html><head><title>保存海报</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5"></head><body style="margin:0;padding:16px;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;height:auto;border-radius:8px" /><p style="color:#9CA3AF;font-size:14px;margin-top:16px;text-align:center">👆 长按图片保存到手机<br/><span style="font-size:12px;color:#6B7280">保存后可分享到朋友圈</span></p><p style="margin-top:20px"><a href="javascript:window.close()" style="color:#6B7280;font-size:14px">✕ 关闭</a></p></body></html>`);
      newWin.document.close();
      return 'opened';
    }
  } catch (e) {
    // Fall through
  }

  // Strategy 4: WeChat screenshot fallback
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
