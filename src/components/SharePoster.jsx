import React, { useState, useCallback, useEffect } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { saveToAlbum, triggerShare, isWeChat } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster — poster preview modal with optimized layout.
 */
export default function SharePoster({ result, onClose, onPosterReady }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [shareStatus, setShareStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

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

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleSave = useCallback(async () => {
    if (!posterUrl) return;
    setSaveStatus('saving');
    const res = await saveToAlbum(posterUrl, `AI灵魂_${type.name}.png`);
    if (res === 'saved' || res === 'downloaded') {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (res === 'opened') {
      setSaveStatus('opened');
      setTimeout(() => setSaveStatus(''), 2000);
    } else {
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [posterUrl, type.name]);

  const handleShare = useCallback(async () => {
    if (!posterUrl) return;
    const status = await triggerShare(type, result.typeId, posterUrl);
    if (status === 'wechat-save-page') {
      setShareStatus('wechat-guide');
      setTimeout(() => setShareStatus(''), 3000);
    } else if (status === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus(''), 2000);
    } else if (status === 'shared') {
      setShareStatus('shared');
      setTimeout(() => setShareStatus(''), 2000);
    }
  }, [type, result.typeId, posterUrl]);

  const getShareButtonText = () => {
    if (shareStatus === 'copied') return '✅ 已复制分享文案';
    if (shareStatus === 'shared') return '✅ 已分享';
    if (shareStatus === 'wechat-guide') return '✅ 请在新页面保存图片';
    return '📤 分享给好友';
  };

  const getSaveButtonText = () => {
    if (saveStatus === 'saving') return '⏳ 正在打开保存页面...';
    if (saveStatus === 'saved') return '✅ 已保存';
    if (saveStatus === 'opened') return '✅ 请长按保存图片';
    if (saveStatus === 'failed') return '❌ 保存失败，请重试';
    return '💾 保存到相册';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 py-6">
      {/* Modal container */}
      <div className="relative w-full max-w-[360px] flex flex-col max-h-full">
        {/* Close button */}
        <button
          className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-lg hover:bg-white/25 transition-colors shadow-lg"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold text-white">
            你的专属海报
          </h3>
        </div>

        {/* Poster image - using img with aspect ratio */}
        {posterUrl ? (
          <div className="flex-1 flex items-center justify-center mb-4">
            <div 
              className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
              style={{
                aspectRatio: '750/1200',
                maxHeight: '55vh',
                background: '#0F0F1A'
              }}
            >
              <img
                src={posterUrl}
                alt="AI灵魂海报"
                className="w-full h-full object-contain"
                style={{ touchAction: 'manipulation' }}
              />
            </div>
          </div>
        ) : (
          <div
            className="mb-4 rounded-2xl flex items-center justify-center"
            style={{
              aspectRatio: '750/1200',
              maxHeight: '55vh',
              background: `linear-gradient(135deg, ${type.color}15, #0F0F1A)`,
              border: `1px dashed ${type.color}40`,
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3 animate-pulse">🎨</div>
              <p className="text-sm text-gray-400">正在生成海报...</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {posterUrl && (
          <div className="space-y-2.5">
            {/* Share button */}
            <button
              className="cta-button w-full text-lg py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
              onClick={handleShare}
            >
              {getShareButtonText()}
            </button>

            {/* Save button */}
            <button
              className="w-full text-lg py-3.5 px-6 rounded-xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all active:scale-[0.98]"
              onClick={handleSave}
            >
              {getSaveButtonText()}
            </button>

            {/* WeChat guidance */}
            {inWeChat && (
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-gray-300 text-sm leading-relaxed">
                  💡 保存后打开微信朋友圈，点击右上角相机选择图片发布
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
