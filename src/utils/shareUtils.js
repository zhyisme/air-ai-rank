import AI_TYPES from '../data/types';

/** Base URL for share links */
const BASE_URL = typeof window !== 'undefined'
  ? window.location.origin + '/air-ai-rank/'
  : 'https://example.com/air-ai-rank/';

/**
 * Generate share text for a given AI type.
 * Format: "我是🔮AI先知，你呢？测测你的AI段位→"
 * @param {Object} type - The AI type object
 * @returns {string} Share text
 */
export function generateShareText(type) {
  return `我是${type.emoji}${type.name}，你呢？测测你的AI段位→`;
}

/**
 * Generate a share URL with referral and personality parameters.
 * @param {string} typeId - The AI type id
 * @returns {string} Share URL with query params
 */
export function generateShareUrl(typeId) {
  return `${BASE_URL}?ref=${typeId}&personality=${typeId}`;
}

/**
 * Parse referral parameters from the current URL.
 * Looks for `ref` and `personality` query params.
 * @returns {Object} { ref, personality }
 */
export function parseReferralParams() {
  if (typeof window === 'undefined') return { ref: null, personality: null };

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || null;
  const personality = params.get('personality') || null;

  return { ref, personality };
}

/**
 * Copy text to the system clipboard.
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy succeeded
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
 * Download a base64 data URL as an image file.
 * @param {string} dataUrl - Base64 data URL of the image
 * @param {string} filename - Desired file name
 */
export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || 'ai-rank-poster.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get the referral type object from URL personality param.
 * @returns {Object|null} The AI type object if referral exists, null otherwise
 */
export function getReferralType() {
  const { personality } = parseReferralParams();
  if (!personality) return null;
  return AI_TYPES.find(t => t.id === personality) || null;
}
