import React from 'react';
import { Bell, BellRing, Shield, Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { Language } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { useNotifications } from '../../hooks/useNotifications';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const Header: React.FC = () => {
  const { lang, setLang, t, isRtl } = useI18n();
  const { isEnabled, requestPermission, triggerTestAlert } = useNotifications(lang);
  const isOnline = useOnlineStatus();

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-emerald-900/30 bg-slate-950/85 backdrop-blur-md safe-top">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-950/60 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            {/* Online status indicator */}
            <span
              title={isOnline ? 'Online' : 'Offline'}
              className={`absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{t.appName}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  KSA
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-xs">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Actions: Install, Notifications, Language switcher */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Push Notification button */}
          <button
            onClick={() => {
              if (isEnabled) {
                triggerTestAlert();
              } else {
                requestPermission();
              }
            }}
            title={isEnabled ? t.reminders.notificationsEnabled : t.reminders.enableNotifications}
            className={`p-2 rounded-xl text-xs font-medium transition active:scale-95 flex items-center gap-1.5 ${
              isEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {isEnabled ? (
              <BellRing className="w-4 h-4 text-emerald-400" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span className="hidden md:inline text-[11px]">
              {isEnabled ? 'Alerts Active' : 'Enable Alerts'}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => handleLangChange('en')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                lang === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLangChange('ur')}
              className={`px-2.5 py-1.5 rounded-lg transition font-urdu ${
                lang === 'ur'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => handleLangChange('ar')}
              className={`px-2.5 py-1.5 rounded-lg transition font-arabic ${
                lang === 'ar'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عربي
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
