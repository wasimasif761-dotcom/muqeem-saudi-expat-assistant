import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { DocumentType } from '../../types';
import { db } from '../../db/db';
import { scheduleRemindersForDocument } from '../../utils/reminders';
import { useI18n } from '../../context/I18nContext';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdded }) => {
  const { t, isRtl } = useI18n();

  const [type, setType] = useState<DocumentType>('iqama');
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryHijri, setExpiryHijri] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [profession, setProfession] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      type,
      title: title.trim() || t.docTypes[type],
      documentNumber: docNumber.trim(),
      holderName: holderName.trim(),
      expiryDate,
      expiryHijri: expiryHijri.trim() || undefined,
      sponsorName: sponsorName.trim() || undefined,
      profession: profession.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.documents.add(newDoc);
    await scheduleRemindersForDocument(newDoc);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl text-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">{t.dashboard.addDocument}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Document Category
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as DocumentType;
                setType(newType);
                if (!title) setTitle(t.docTypes[newType]);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="iqama">{t.docTypes.iqama}</option>
              <option value="passport">{t.docTypes.passport}</option>
              <option value="driving_license">{t.docTypes.driving_license}</option>
              <option value="health_insurance">{t.docTypes.health_insurance}</option>
              <option value="ejar_contract">{t.docTypes.ejar_contract}</option>
              <option value="vehicle_istimara">{t.docTypes.vehicle_istimara}</option>
              <option value="other">{t.docTypes.other}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              placeholder={t.docTypes[type]}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.documentNumber}
              </label>
              <input
                type="text"
                placeholder="e.g. 2489103842"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.name}
              </label>
              <input
                type="text"
                placeholder="Full Name as on ID"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.expiryDate} *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.expiryHijri} (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 1448-02-15"
                value={expiryHijri}
                onChange={(e) => setExpiryHijri(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.sponsorKafeel}
              </label>
              <input
                type="text"
                placeholder="Company or Kafeel Name"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.profession}
              </label>
              <input
                type="text"
                placeholder="e.g. Accountant / محلل"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {t.common.notes}
            </label>
            <textarea
              rows={2}
              placeholder="Renewal notes, SADAD billing number, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              {t.common.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm text-slate-300"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
