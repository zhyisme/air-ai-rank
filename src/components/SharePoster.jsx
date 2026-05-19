import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generatePoster } from '../utils/posterGenerator';
import { saveToAlbum, triggerShare, isWeChat } from '../utils/shareUtils';
import AI_TYPES from '../data/types';

/**
 * SharePoster — poster preview modal with optimized save/share experience.
 */
export default function SharePoster({ result, onClose, onPosterReady }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [shareStatus, setShareStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const canvasRef = useRef(null);

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

  // Draw poster on canvas for better long-press save in WeChat
  useEffect(() => {
    if (posterUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = posterUrl;
    }
  }, [posterUrl]);

  const handleSave = useCallback(async () => {
    if (!posterUrl) return;
    setSaveStatus('saving');
    const result = await saveToAlbum(posterUrl, `AI灵魂_${type.name}.png`);
    if (result === 'saved' || result === 'downloaded') {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else if (result === 'opened') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="glass-card p-4 pb-3">
          <h3 className="text-lg font-bold text-white text-center mb-2">
            你的专属海报
          </h3>

          {/* Poster preview - use canvas for better WeChat compatibility */}
          {posterUrl ? (
            <div className="mb-3 rounded-xl overflow-hidden bg-[#0F0F1A]">
              {/* Canvas for WeChat long-press save */}
              <canvas
                ref={canvasRef}
                className="w-full block"
                style={{ 
                  maxHeight: '45vh', 
                  objectFit: 'contain',
                  touchAction: 'manipulation'
                }}
              />
              {/* Fallback img for browsers that can't render canvas */}
              <img
                src={posterUrl}
                alt="AI灵魂海报"
                className="hidden"
                crossOrigin="anonymous"
              />
              {/* WeChat tip */}
              {inWeChat && (
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-3 text-center">
                  <p className="text-white text-sm font-medium">
                    👆 长按上方图片可直接保存到手机
                  </p>
                </div>
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
            <div className="space-y-3">
              {/* Share button */}
              <button
                className="cta-button w-full text-lg py-4 rounded-xl font-semibold"
                onClick={handleShare}
              >
                {getShareButtonText()}
              </button>

              {/* Save button */}
              <button
                className="w-full text-lg py-4 px-6 rounded-xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                onClick={handleSave}
              >
                {getSaveButtonText()}
              </button>

              {/* WeChat guidance */}
              {inWeChat && (
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-300 text-sm">
                    💡 <span className="text-gray-400">保存后</span>打开微信朋友圈，点击右上角相机📷选择图片发布
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
