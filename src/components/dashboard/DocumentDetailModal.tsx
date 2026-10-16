import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Trash2, 
  Share2, 
  Building2, 
  Briefcase, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Edit2
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { formatRemainingText, getDaysRemaining, getDocumentStatus, db } from '../../db/db';
import { useI18n } from '../../context/I18nContext';
import { buildWhatsAppReminderUrl } from '../../utils/reminders';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onDeleted,
  onUpdated,
}) => {
  const { lang, t, isRtl } = useI18n();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expiryInput, setExpiryInput] = useState(document?.expiryDate || '');
  const [titleInput, setTitleInput] = useState(document?.title || '');
  const [docNumberInput, setDocNumberInput] = useState(document?.documentNumber || '');
  const [sponsorInput, setSponsorInput] = useState(document?.sponsorName || '');
  const [notesInput, setNotesInput] = useState(document?.notes || '');

  if (!document) return null;

  const daysRemaining = getDaysRemaining(document.expiryDate);
  const status = getDocumentStatus(document.expiryDate);

  const copyNumber = () => {
    if (document.documentNumber) {
      navigator.clipboard.writeText(document.documentNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document from local storage?')) {
      await db.documents.delete(document.id);
      await db.reminders.where('documentId').equals(document.id).delete();
      onDeleted();
      onClose();
    }
  };

  const handleSaveEdit = async () => {
    await db.documents.update(document.id, {
      title: titleInput,
      documentNumber: docNumberInput,
      expiryDate: expiryInput,
      sponsorName: sponsorInput,
      notes: notesInput,
      updatedAt: Date.now(),
    });
    setIsEditing(false);
    onUpdated();
  };

  // Official portal links depending on document type
  const portalLinks: Record<string, { name: string; url: string; guide: string }> = {
    iqama: {
      name: 'Absher Individuals (أبشر)',
      url: 'https://www.absher.sa',
      guide: 'Check Iqama validity or issue exit/re-entry visa directly on Absher.'
    },
    driving_license: {
      name: 'Absher Muroor (المرور)',
      url: 'https://www.absher.sa',
      guide: 'Renew driving license after completing Efada medical test.'
    },
    ejar_contract: {
      name: 'Ejar Network (منصة إيجار)',
      url: 'https://www.ejar.sa',
      guide: 'Verify tenancy contract authenticity or view SADAD rental invoices.'
    },
    health_insurance: {
      name: 'CCHI Insurance Verification (مجلس الضمان)',
      url: 'https://www.cchi.gov.sa',
      guide: 'Check if your health insurance is actively linked to your Iqama number.'
    },
  };

  const portal = portalLinks[document.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div 
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl text-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex-1 min-w-0 pe-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {t.docTypes[document.type]}
            </span>
            <h2 className="text-xl font-black text-white mt-2 truncate">
              {document.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-3 ${
          status === 'urgent' 
            ? 'bg-rose-950/60 border-rose-600/50 text-rose-200' 
            : status === 'expiring' 
              ? 'bg-amber-950/60 border-amber-600/50 text-amber-200' 
              : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            status === 'urgent' ? 'bg-rose-500/20 text-rose-400' : status === 'expiring' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">
              {formatRemainingText(daysRemaining, lang)}
            </p>
            <p className="text-xs opacity-80">
              {t.dashboard.expiresOn}: <strong className="font-mono">{document.expiryDate}</strong>
              {document.expiryHijri && ` (${document.expiryHijri} H)`}
            </p>
          </div>
        </div>

        {/* Content / Edit Form */}
        {isEditing ? (
          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Number
              </label>
              <input
                type="text"
                value={docNumberInput}
                onChange={(e) => setDocNumberInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expiry Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={expiryInput}
                onChange={(e) => setExpiryInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sponsor / Kafeel / Company
              </label>
              <input
                type="text"
                value={sponsorInput}
                onChange={(e) => setSponsorInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition active:scale-95"
              >
                {t.common.save}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3.5">
            {/* Number info */}
            <div className="bg-slate-800/60 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.dashboard.documentNumber}</span>
                <span className="text-base font-mono font-bold text-emerald-400 tracking-wider">
                  {document.documentNumber || '—'}
                </span>
              </div>
              <button
                onClick={copyNumber}
                className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Copy Number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Holder and Sponsor details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {document.holderName && (
                <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">{t.common.name}</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{document.holderName}</span>
                </div>
              )}
              {document.profession && (
                <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-500" /> {t.dashboard.profession}
                  </span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{document.profession}</span>
                </div>
              )}
              {document.sponsorName && (
                <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" /> {t.dashboard.sponsorKafeel}
                  </span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{document.sponsorName}</span>
                </div>
              )}
            </div>

            {document.notes && (
              <div className="bg-slate-800/30 border border-slate-800/80 p-3 rounded-xl text-xs">
                <span className="text-slate-400 block text-[11px] font-semibold">{t.common.notes}:</span>
                <p className="text-slate-300 mt-1">{document.notes}</p>
              </div>
            )}

            {/* Official Portal Guidance */}
            {portal && (
              <div className="bg-emerald-950/40 border border-emerald-800/50 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">{portal.name}</span>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{portal.guide}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = buildWhatsAppReminderUrl(document, lang);
                window.open(url, '_blank');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.dashboard.whatsappRemind}</span>
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.dashboard.edit}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.dashboard.delete}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
