import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../context/I18nContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 start-4 end-4 sm:start-6 sm:end-auto z-40 max-w-md animate-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-900/90 to-amber-950/95 border border-amber-600/50 p-3.5 text-xs text-amber-100 shadow-2xl backdrop-blur-md">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-200">Offline Mode Active</p>
          <p className="text-[11px] text-amber-300/80 truncate">
            {t.pwa.offlineBanner}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300 shrink-0">
          <Database className="w-3 h-3" />
          <span>Local</span>
        </div>
      </div>
    </div>
  );
};
