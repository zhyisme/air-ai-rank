import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { saveToAlbum, triggerShare, isWeChat } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster — poster preview modal.
 * Auto-generates poster on mount.
 * Uses saveToAlbum for multi-strategy image saving.
 *
 * @param {Object} result - { typeId, scores, timestamp }
 * @param {Function} onClose - Close callback
 * @param {Function} onPosterReady - Called with poster data URL when ready
 */
export default function SharePoster({ result, onClose, onPosterReady }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [shareStatus, setShareStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showWeChatGuide, setShowWeChatGuide] = useState(false);
  const blobUrlRef = useRef(null);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const inWeChat = isWeChat();

  // Convert data URL to Blob URL for WeChat long-press save support
  useEffect(() => {
    if (posterUrl && posterUrl.startsWith('data:')) {
      fetch(posterUrl)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          // Revoke previous blob URL if any
          if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          blobUrlRef.current = url;
          setBlobUrl(url);
        })
        .catch(() => {
          // Fallback: use data URL directly
          setBlobUrl(posterUrl);
        });
    } else if (posterUrl) {
      setBlobUrl(posterUrl);
    }
  }, [posterUrl]);

  // Cleanup blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const url = await generatePoster(result);
      setPosterUrl(url);
      if (onPosterReady) onPosterReady(url);
    } catch (e) {
      // Silently handle failure
    }
    setGenerating(false);
  }, [result, onPosterReady]);

  // Auto-generate on mount
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleSave = useCallback(async () => {
    if (!posterUrl) return;
    setSaveStatus('');
    const result = await saveToAlbum(posterUrl, `AI段位实况_${type.name}.png`);
    if (result === 'shared') {
      setSaveStatus('shared');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'downloaded') {
      setSaveStatus('downloaded');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'opened') {
      setSaveStatus('opened');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'wechat-screenshot') {
      setSaveStatus('screenshot');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [posterUrl, type.name]);

  const handleShare = useCallback(async () => {
    setShareStatus('');
    const status = await triggerShare(type, result.typeId, posterUrl);
    if (status === 'wechat-guide') {
      setShowWeChatGuide(true);
    } else if (status === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus(''), 2000);
    } else if (status === 'shared') {
      setShareStatus('shared');
      setTimeout(() => setShareStatus(''), 2000);
    }
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

        <div className="glass-card p-5">
          <h3 className="text-base font-bold text-white text-center mb-3">
            🎨 你的专属海报
          </h3>

          {/* Poster preview */}
          {(blobUrl || posterUrl) ? (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img
                src={blobUrl || posterUrl}
                alt="AI段位实况海报"
                className="w-full"
                style={{ maxHeight: '55vh', objectFit: 'contain', touchAction: 'manipulation' }}
              />
              {/* WeChat screenshot tip */}
              {inWeChat && (
                <p className="text-xs text-gray-400 text-center mt-2 bg-white/5 py-2 rounded">
                  📸 长按图片或截图保存海报
                </p>
              )}
            </div>
          ) : (
            <div
              className="mb-3 rounded-xl flex items-center justify-center"
              style={{
                height: '280px',
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
          {posterUrl && (
            <div className="space-y-2">
              <button
                className="cta-button w-full text-base py-3"
                onClick={handleShare}
              >
                {shareStatus === 'copied' ? '✅ 链接已复制' :
                 shareStatus === 'shared' ? '✅ 已唤起分享' :
                 '📤 分享给好友'}
              </button>
              <button
                className="w-full text-base py-3 px-6 rounded-full border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white transition-all"
                onClick={handleSave}
              >
                {saveStatus === 'shared' ? '✅ 已保存' :
                 saveStatus === 'downloaded' ? '✅ 已下载' :
                 saveStatus === 'opened' ? '✅ 已在新页面打开' :
                 saveStatus === 'screenshot' ? '📸 请截图保存海报' :
                 '💾 保存到相册'}
              </button>
              {/* WeChat screenshot guide */}
              {inWeChat && (
                <p className="text-xs text-gray-400 text-center mt-2 bg-white/5 py-2 rounded">
                  📸 微信内请截图保存海报，或点击"保存到相册"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WeChat Guide Overlay */}
      {showWeChatGuide && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-end pt-4 pr-6"
          onClick={() => setShowWeChatGuide(false)}
        >
          <div className="text-right mb-2">
            <div className="text-4xl mb-2">👆</div>
            <div className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-lg inline-block">
              点击右上角「···」<br />
              <span className="text-xs font-normal text-gray-500">转发给朋友 / 分享到朋友圈</span>
            </div>
          </div>
          <div className="text-white/60 text-xs mt-4 text-center w-full">
            链接已复制到剪贴板，点击任意处关闭
          </div>
        </div>
      )}
    </div>
  );
}
