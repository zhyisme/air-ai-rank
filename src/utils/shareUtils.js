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
 * Save poster image to phone album.
 */
export async function saveToAlbum(dataUrl, filename = 'AI灵魂海报.png') {
  // Non-WeChat browsers: use Web Share API or download link
  if (!isWeChat()) {
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
        if (e.name !== 'AbortError') {}
      }
    }

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

  // WeChat: Open a dedicated save page with proper close functionality
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
    .wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px 120px;
    }
    .close-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #FFFFFF;
      font-size: 18px;
      line-height: 44px;
      text-align: center;
      cursor: pointer;
      z-index: 100;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .close-btn:active {
      background: rgba(255,255,255,0.25);
      transform: scale(0.95);
    }
    .poster-img {
      width: 100%;
      max-width: 320px;
      border-radius: 16px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.6);
      display: block;
    }
    .tip {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.98) 40%);
      padding: 80px 20px 30px;
      text-align: center;
    }
    .tip p {
      color: #FFFFFF;
      font-size: 17px;
      margin-bottom: 8px;
    }
    .tip span {
      color: #9CA3AF;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="close-btn" id="closeBtn">✕</div>
  <div class="wrapper">
    <img class="poster-img" src="${dataUrl}" alt="海报" />
  </div>
  <div class="tip">
    <p>👆 长按图片选择「保存图片」</p>
    <span>保存后可分享到朋友圈</span>
  </div>
  <script>
    // Get referrer URL for fallback close
    var referrer = document.referrer || (window.opener ? window.opener.location.href : '${SITE_URL}') || '${SITE_URL}';
    
    // Try to close via opener first
    function tryCloseViaOpener() {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.focus();
          window.close();
          return true;
        }
      } catch(e) {}
      return false;
    }
    
    // Handle close button - try multiple methods
    function closePage() {
      // Method 1: Try window.close via opener
      if (tryCloseViaOpener()) return;
      
      // Method 2: Navigate back via history if available
      if (history.length > 1) {
        history.back();
        return;
      }
      
      // Method 3: Navigate to referrer or homepage
      window.location.href = referrer;
    }
    
    // Bind close button events
    document.getElementById('closeBtn').addEventListener('click', closePage);
    document.getElementById('closeBtn').addEventListener('touchend', function(e) {
      e.preventDefault();
      closePage();
    });
    
    // Handle popstate and pagehide events
    window.addEventListener('popstate', function() {
      tryCloseViaOpener();
    });
    window.addEventListener('pagehide', function() {
      tryCloseViaOpener();
    });
  </script>
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
    .wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px 120px;
    }
    .close-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #FFFFFF;
      font-size: 18px;
      line-height: 44px;
      text-align: center;
      cursor: pointer;
      z-index: 100;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .close-btn:active {
      background: rgba(255,255,255,0.25);
      transform: scale(0.95);
    }
    .title {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 10px;
    }
    .quote {
      color: #9CA3AF;
      font-size: 15px;
      text-align: center;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .poster-img {
      width: 100%;
      max-width: 320px;
      border-radius: 16px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.6);
      display: block;
    }
    .tip {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(15,15,26,0.98) 40%);
      padding: 80px 20px 30px;
      text-align: center;
    }
    .tip p {
      color: #FFFFFF;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .tip span {
      color: #9CA3AF;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="close-btn" id="closeBtn">✕</div>
  <div class="wrapper">
    <h1 class="title">📤 分享到朋友圈</h1>
    <p class="quote">${shareText}</p>
    <img class="poster-img" src="${posterDataUrl}" alt="分享海报" />
  </div>
  <div class="tip">
    <p>👆 长按保存图片 → 打开朋友圈发布</p>
    <span>保存后，在朋友圈点击相机图标选择这张图片</span>
  </div>
  <script>
    // Get referrer URL for fallback close
    var referrer = document.referrer || (window.opener ? window.opener.location.href : '${SITE_URL}') || '${SITE_URL}';
    
    // Try to close via opener first
    function tryCloseViaOpener() {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.focus();
          window.close();
          return true;
        }
      } catch(e) {}
      return false;
    }
    
    // Handle close button - try multiple methods
    function closePage() {
      // Method 1: Try window.close via opener
      if (tryCloseViaOpener()) return;
      
      // Method 2: Navigate back via history if available
      if (history.length > 1) {
        history.back();
        return;
      }
      
      // Method 3: Navigate to referrer or homepage
      window.location.href = referrer;
    }
    
    // Bind close button events
    document.getElementById('closeBtn').addEventListener('click', closePage);
    document.getElementById('closeBtn').addEventListener('touchend', function(e) {
      e.preventDefault();
      closePage();
    });
    
    // Handle popstate and pagehide events
    window.addEventListener('popstate', function() {
      tryCloseViaOpener();
    });
    window.addEventListener('pagehide', function() {
      tryCloseViaOpener();
    });
  </script>
</body>
</html>`;
        newWin.document.write(pageHtml);
        newWin.document.close();
        
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
      if (e.name !== 'AbortError') {}
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
