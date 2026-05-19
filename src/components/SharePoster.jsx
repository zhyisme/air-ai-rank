import React, { useState, useCallback, useEffect } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { downloadImage, copyToClipboard, generateShareText, generateShareUrl } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster - Poster preview modal with download and share buttons.
 * Automatically generates poster on mount.
 *
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onClose - Callback to close the modal
 */
export default function SharePoster({ result, onClose }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [generating, setGenerating] = useState(true);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const url = await generatePoster(result);
      setPosterUrl(url);
    } catch (e) {
      // Silently handle poster generation failure
    }
    setGenerating(false);
  }, [result]);

  // Auto-generate poster on mount
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleDownload = useCallback(() => {
    if (posterUrl) {
      downloadImage(posterUrl, `AI段位实况_${type.name}.png`);
    }
  }, [posterUrl, type.name]);

  const handleShare = useCallback(async () => {
    const shareText = generateShareText(type);
    const shareUrl = generateShareUrl(result.typeId);

    // Web Share API Level 2: share image file if available and supported
    if (posterUrl && navigator.canShare) {
      try {
        const response = await fetch(posterUrl);
        const blob = await response.blob();
        const file = new File([blob], 'AI段位实况.png', { type: 'image/png' });
        const shareData = { title: 'AIR·AI段位实况', text: shareText, files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (e) {
        // File sharing not supported or user cancelled, fall through
      }
    }

    // Web Share API Level 1: share text + URL
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AIR·AI段位实况', text: shareText, url: shareUrl });
        return;
      } catch (e) {
        // User cancelled, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    await copyToClipboard(`${shareText}\n${shareUrl}`);
  }, [type, result.typeId, posterUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white text-center mb-4">
            🎨 生成你的专属海报
          </h3>

          {/* Poster preview */}
          {posterUrl ? (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={posterUrl}
                alt="AI段位实况海报"
                className="w-full"
              />
            </div>
          ) : (
            <div
              className="mb-4 rounded-xl flex items-center justify-center"
              style={{
                height: '300px',
                background: `linear-gradient(135deg, ${type.color}15, #0F0F1A)`,
                border: `1px dashed ${type.color}40`,
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2 animate-spin">🎨</div>
                <p className="text-sm text-gray-400">正在生成海报...</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {posterUrl && (
              <>
                <button
                  className="cta-button w-full text-sm py-3"
                  onClick={handleDownload}
                >
                  📥 保存海报
                </button>
                <button
                  className="w-full text-sm py-3 px-6 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all"
                  onClick={handleShare}
                >
                  📤 分享给好友
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
