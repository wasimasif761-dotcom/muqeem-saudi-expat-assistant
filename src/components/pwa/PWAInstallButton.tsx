import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useI18n } from '../../context/I18nContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const { t, isRtl } = useI18n();

  // If already running in standalone mode on device, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {compact ? (
        <button
          onClick={handleClick}
          title={t.pwa.installApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all active:scale-95 animate-pulse"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.pwa.installNow}</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-emerald-200" />
          <span>{t.pwa.installApp}</span>
        </button>
      )}

      {/* Mobile Install Instructions Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-800/60 p-6 shadow-2xl text-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {t.pwa.installApp}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              // iOS Safari
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    1
                  </div>
                  <p className="leading-snug">
                    Tap the <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share</strong> button at the bottom of Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    2
                  </div>
                  <p className="leading-snug">
                    Select <strong className="text-emerald-400">Add to Home Screen</strong> (إضافة إلى الشاشة الرئيسية).
                  </p>
                </div>
              </div>
            ) : (
              // Android Chrome / Samsung Internet / Edge
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    1
                  </div>
                  <p className="leading-snug">
                    Tap the <strong className="text-white inline-flex items-center gap-1"><MoreVertical className="w-3.5 h-3.5" /> 3 dots</strong> menu in top-right of your Chrome browser.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    2
                  </div>
                  <p className="leading-snug">
                    Tap <strong className="text-emerald-400">Install app</strong> or <strong className="text-emerald-400">Add to Home screen</strong> (ایپ انسٹال کریں).
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm text-white transition active:scale-95"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
