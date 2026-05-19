import React, { useState, useCallback } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { downloadImage, copyToClipboard, generateShareText, generateShareUrl } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster - Poster preview modal with download and share buttons.
 *
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onClose - Callback to close the modal
 */
export default function SharePoster({ result, onClose }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const url = await generatePoster(result);
      setPosterUrl(url);
    } catch (e) {
      console.error('Failed to generate poster:', e);
    }
    setGenerating(false);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (posterUrl) {
      downloadImage(posterUrl, `AI段位实况_${type.name}.png`);
    }
  }, [posterUrl, type.name]);

  const handleCopyLink = useCallback(async () => {
    const url = generateShareUrl(result.typeId);
    const success = await copyToClipboard(url);
    setCopied(success);
    setTimeout(() => setCopied(false), 2000);
  }, [result.typeId]);

  const handleShare = useCallback(async () => {
    const text = generateShareText(type);
    const url = generateShareUrl(result.typeId);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'AIR·AI段位实况', text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      await copyToClipboard(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [type, result.typeId]);

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
              {generating ? (
                <div className="text-center">
                  <div className="text-3xl mb-2 animate-spin">🎨</div>
                  <p className="text-sm text-gray-400">正在生成海报...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <p className="text-sm text-gray-400">点击下方按钮生成海报</p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {!posterUrl ? (
              <button
                className="cta-button w-full text-sm py-3"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? '生成中...' : '✨ 生成海报'}
              </button>
            ) : (
              <>
                <button
                  className="cta-button w-full text-sm py-3"
                  onClick={handleDownload}
                >
                  📥 下载海报
                </button>
                <button
                  className="w-full text-sm py-3 px-6 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all"
                  onClick={handleShare}
                >
                  📤 分享结果
                </button>
              </>
            )}

            <button
              className="w-full text-sm py-3 px-6 rounded-full border border-gray-700 text-gray-400 hover:text-gray-300 transition-all"
              onClick={handleCopyLink}
            >
              {copied ? '✅ 已复制链接！' : '🔗 复制分享链接'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
