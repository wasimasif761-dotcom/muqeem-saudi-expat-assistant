import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Eye, 
  EyeOff, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { DocumentItem, DocumentType } from '../../types';
import { formatRemainingText, getDaysRemaining, getDocumentStatus } from '../../db/db';
import { useI18n } from '../../context/I18nContext';
import { buildWhatsAppReminderUrl } from '../../utils/reminders';

interface DocumentCardProps {
  document: DocumentItem;
  onOpenDetails: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpenDetails }) => {
  const { lang, t, isRtl } = useI18n();
  const [showNumber, setShowNumber] = useState(false);

  const daysRemaining = getDaysRemaining(document.expiryDate);
  const status = getDocumentStatus(document.expiryDate);

  // Status visual configurations
  const statusConfig = {
    safe: {
      border: 'border-emerald-600/40 hover:border-emerald-500/70',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      progressColor: 'bg-emerald-500',
      glow: 'shadow-emerald-950/20',
      label: t.status.safeShort,
    },
    expiring: {
      border: 'border-amber-500/50 hover:border-amber-400/80',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      progressColor: 'bg-amber-500',
      glow: 'shadow-amber-950/20',
      label: t.status.expiringShort,
    },
    urgent: {
      border: 'border-rose-500/50 hover:border-rose-400/80',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      icon: ShieldAlert,
      progressColor: 'bg-rose-500',
      glow: 'shadow-rose-950/30',
      label: t.status.urgentShort,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  // Mask number e.g. 2489****42
  const maskedNumber = () => {
    if (showNumber || !document.documentNumber) return document.documentNumber || '—';
    if (document.documentNumber.length <= 4) return '••••';
    return `${document.documentNumber.slice(0, 4)} •••• ${document.documentNumber.slice(-2)}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildWhatsAppReminderUrl(document, lang);
    window.open(url, '_blank');
  };

  // Progress width clamped between 5% and 100%
  const progressPercent = Math.min(100, Math.max(8, (daysRemaining / 365) * 100));

  return (
    <div
      onClick={() => onOpenDetails(document)}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border ${statusConfig.border} p-4 sm:p-5 shadow-lg ${statusConfig.glow} transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}
    >
      {/* Top row: Type & Expiry status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {document.title}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {document.holderName || t.docTypes[document.type]}
            </p>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusConfig.badgeBg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Middle row: Document Number & Expiry Counter */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-y-2 text-xs">
        {/* Document Number with Mask Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">
            {maskedNumber()}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowNumber(!showNumber);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
            title={showNumber ? 'Hide number' : 'Show number'}
          >
            {showNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Days left pill */}
        <div className="flex items-center gap-1.5 font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className={status === 'urgent' ? 'text-rose-400' : status === 'expiring' ? 'text-amber-300' : 'text-emerald-400'}>
            {formatRemainingText(daysRemaining, lang)}
          </span>
        </div>
      </div>

      {/* Expiry Progress Bar */}
      <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusConfig.progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Footer Details: Expiry Date, Sponsor, WhatsApp Action */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.dashboard.expiresOn}: <strong className="text-slate-200 font-mono">{document.expiryDate}</strong></span>
          {document.expiryHijri && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              ({document.expiryHijri} H)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick WhatsApp Reminder */}
          <button
            type="button"
            onClick={handleWhatsApp}
            title={t.dashboard.whatsappRemind}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/40 text-emerald-300 text-[11px] font-medium transition active:scale-95"
          >
            <Share2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-white transition ${isRtl ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );
};
