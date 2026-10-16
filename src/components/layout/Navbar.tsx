import React from 'react';
import { FileText, ScanLine, Wallet, MapPin, Bot } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export type TabType = 'dashboard' | 'scanner' | 'earnings' | 'jeddah' | 'advisor';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useI18n();

  const navItems: { id: TabType; label: string; icon: React.ElementType; isPrimary?: boolean }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: FileText },
    { id: 'scanner', label: t.nav.scanner, icon: ScanLine, isPrimary: true },
    { id: 'earnings', label: t.nav.earnings, icon: Wallet },
    { id: 'jeddah', label: t.nav.jeddahGuide, icon: MapPin },
    { id: 'advisor', label: t.nav.advisor, icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-30 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg safe-bottom">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative -top-3.5 flex flex-col items-center group active:scale-95 transition"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-900/60 ring-2 ring-emerald-400'
                      : 'bg-emerald-700/90 hover:bg-emerald-600 text-emerald-100 shadow-emerald-950/60'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? 'bg-emerald-500/15' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
