import AI_TYPES from '../data/types';

/** Fixed production URL */
const SITE_URL = 'https://zhyisme.github.io/air-ai-rank/';

/**
 * Detect if user is in WeChat browser.
 */
export function isWeChat() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/i.test(ua);
}

/**
 * Detect if user is on iOS device.
 */
export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detect if user is on Android device.
 */
export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Generate share text for a given AI type.
 */
export function generateShareText(type) {
  return `承认吧，这才是你的AI灵魂！我是${type.emoji}${type.name}，你呢？`;
}

/**
 * Generate a share URL with referral parameters.
 */
export function generateShareUrl(typeId) {
  return `${SITE_URL}?ref=${typeId}&personality=${typeId}`;
}

/**
 * Parse referral parameters from the current URL.
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
 * Copy text to clipboard.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
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
 * Convert data URL to Blob.
 */
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Save poster image to phone album.
 * 
 * Strategy for WeChat:
 * 1. Open a clean page with the image embedded for long-press save
 * 2. Use blob URL if possible for better compatibility
 * 
 * Strategy for other browsers:
 * 1. Web Share API with file
 * 2. <a download>
 *
 * @param {string} dataUrl - base64 data URL of the poster
 * @param {string} filename - filename for download
 * @returns {Promise<string>} 'saved'|'downloaded'|'opened'|'failed'
 */
export async function saveToAlbum(dataUrl, filename = 'AI灵魂海报.png') {
  // Non-WeChat browsers: use Web Share API or download link
  if (!isWeChat()) {
    // Web Share API with file
    if (typeof navigator.canShare === 'function') {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: 'image/png' });
        const shareData = { files: [file], title: 'AI灵魂海报' };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return 'saved';
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          // Fall through to download
        }
      }
    }

    // Download link fallback
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return 'downloaded';
    } catch (e) {
      return 'failed';
    }
  }

  // WeChat: Open a dedicated save page
  try {
    const newWin = window.open('', '_blank');
    if (newWin) {
      const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>保存海报</title>
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
      padding-bottom: 100px;
    }
    .poster-img {
      width: 100%;
      max-width: 340px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      display: block;
      -webkit-touch-callout: default;
      pointer-events: auto;
    }
    .tip {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.95) 30%);
      padding: 60px 20px 30px;
      text-align: center;
    }
    .tip p {
      color: #FFFFFF;
      font-size: 16px;
      margin-bottom: 6px;
    }
    .tip span {
      color: #9CA3AF;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="poster-img" src="${dataUrl}" alt="海报" />
  </div>
  <div class="tip">
    <p>👆 长按图片选择「保存图片」</p>
    <span>保存后可分享到朋友圈</span>
  </div>
</body>
</html>`;
      newWin.document.write(pageHtml);
      newWin.document.close();
      return 'opened';
    }
  } catch (e) {
    console.error('Failed to open save window:', e);
  }

  return 'failed';
}

/**
 * Trigger share functionality.
 * 
 * In WeChat: Opens a dedicated page with poster for saving,
 * user then shares manually from WeChat Moments.
 * 
 * Other browsers: Uses native share API with image.
 *
 * @param {Object} type - The AI type object
 * @param {string} typeId - Type ID for URL generation
 * @param {string} posterDataUrl - Base64 poster image
 * @returns {Promise<string>} Action taken
 */
export async function triggerShare(type, typeId, posterDataUrl) {
  const shareText = generateShareText(type);
  const shareUrl = generateShareUrl(typeId);

  // WeChat: Open share guidance page
  if (isWeChat() && posterDataUrl) {
    try {
      const newWin = window.open('', '_blank');
      if (newWin) {
        const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>分享海报</title>
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
    .title {
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
    }
    .quote {
      color: #9CA3AF;
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .poster-img {
      width: 100%;
      max-width: 340px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      display: block;
      -webkit-touch-callout: default;
    }
    .tip {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.95) 30%);
      padding: 60px 20px 30px;
      text-align: center;
    }
    .tip p {
      color: #FFFFFF;
      font-size: 15px;
      margin-bottom: 6px;
    }
    .tip span {
      color: #9CA3AF;
      font-size: 13px;
    }
    .copied {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(124, 58, 237, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">📤 分享到朋友圈</h1>
    <p class="quote">${shareText}</p>
    <img class="poster-img" src="${posterDataUrl}" alt="分享海报" />
  </div>
  <div class="tip">
    <p>👆 长按保存图片 → 打开朋友圈发布</p>
    <span>保存后，在朋友圈点击相机图标选择这张图片</span>
  </div>
</body>
</html>`;
        newWin.document.write(pageHtml);
        newWin.document.close();
        
        // Copy share text
        await copyToClipboard(shareText);
        
        return 'wechat-save-page';
      }
    } catch (e) {
      console.error('Failed to open share page:', e);
    }
  }

  // Non-WeChat: Try Web Share API with image
  if (posterDataUrl && typeof navigator.canShare === 'function') {
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

  // Non-WeChat: Try Web Share API with text + URL
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'AI灵魂', text: shareText, url: shareUrl });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }

  // Fallback: Copy to clipboard
  const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
  return success ? 'copied' : 'failed';
}

/**
 * Get the referral type object from URL personality param.
 */
export function getReferralType() {
  const { personality } = parseReferralParams();
  if (!personality) return null;
  return AI_TYPES.find(t => t.id === personality) || null;
}
