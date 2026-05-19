import React, { useState, useCallback, useEffect } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { saveToAlbum, triggerShare, isWeChat } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster — poster preview modal.
 * Auto-generates poster on mount.
 * Uses data URL for maximum compatibility with WeChat.
 */
export default function SharePoster({ result, onClose, onPosterReady }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [shareStatus, setShareStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showTip, setShowTip] = useState(false);

  const type = AI_TYPES.find(t => t.id === result.typeId) || AI_TYPES[0];
  const inWeChat = isWeChat();

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const url = await generatePoster(result);
      setPosterUrl(url);
      if (onPosterReady) onPosterReady(url);
    } catch (e) {
      console.error('Failed to generate poster:', e);
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
    // Always pass data URL - most reliable for WeChat
    const result = await saveToAlbum(posterUrl, `AI灵魂_${type.name}.png`);
    if (result === 'shared') {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'downloaded') {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'opened') {
      // Opened save page - no status needed as user is on new page
    } else if (result === 'failed') {
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [posterUrl, type.name]);

  const handleShare = useCallback(async () => {
    if (!posterUrl) return;
    setShareStatus('');
    const status = await triggerShare(type, result.typeId, posterUrl);
    if (status === 'wechat-save-page') {
      // Opened share page with poster - user will share manually
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

        <div className="glass-card p-4 pb-2">
          <h3 className="text-lg font-bold text-white text-center mb-2">
            你的专属海报
          </h3>

          {/* Poster preview */}
          {posterUrl ? (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img
                src={posterUrl}
                alt="AI灵魂海报"
                className="w-full"
                style={{ maxHeight: '42vh', objectFit: 'contain' }}
              />
              {/* WeChat save tip */}
              {inWeChat && (
                <p className="text-xs text-gray-400 text-center mt-2 bg-white/5 py-2 rounded">
                  👆 长按图片可保存到手机
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
                className="cta-button w-full text-lg py-3.5"
                onClick={handleShare}
              >
                {shareStatus === 'copied' ? '✅ 已复制到剪贴板' :
                 shareStatus === 'shared' ? '✅ 已分享' :
                 '📤 分享给好友'}
              </button>
              <button
                className="w-full text-lg py-3.5 px-6 rounded-full border border-gray-600 text-gray-200 hover:border-purple-500 hover:text-white transition-all bg-white/5"
                onClick={handleSave}
              >
                {saveStatus === 'saved' ? '✅ 已保存' :
                 saveStatus === 'failed' ? '❌ 保存失败，请重试' :
                 '💾 保存到相册'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
