import React, { useState } from 'react';
import { 
  Plus, 
  Scan, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Files,
  Sparkles
} from 'lucide-react';
import { DocumentItem, DocumentType } from '../../types';
import { getDocumentStatus } from '../../db/db';
import { useI18n } from '../../context/I18nContext';
import { DocumentCard } from './DocumentCard';
import { DocumentDetailModal } from './DocumentDetailModal';
import { AddDocumentModal } from './AddDocumentModal';

interface DocumentListProps {
  documents: DocumentItem[];
  onRefresh: () => void;
  onNavigateToScanner: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onNavigateToScanner,
}) => {
  const { t, isRtl } = useI18n();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Categorize counts
  const safeCount = documents.filter((d) => getDocumentStatus(d.expiryDate) === 'safe').length;
  const expiringCount = documents.filter((d) => getDocumentStatus(d.expiryDate) === 'expiring').length;
  const urgentCount = documents.filter((d) => getDocumentStatus(d.expiryDate) === 'urgent').length;

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedTypeFilter === 'all' || doc.type === selectedTypeFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      doc.documentNumber.toLowerCase().includes(query) ||
      (doc.holderName && doc.holderName.toLowerCase().includes(query)) ||
      (doc.sponsorName && doc.sponsorName.toLowerCase().includes(query));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Expat Compliance Alert Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-slate-900/90 to-teal-950/60 border border-emerald-700/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saudi Expat Assistant</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.dashboard.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              {t.dashboard.summary}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onNavigateToScanner}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs sm:text-sm text-white shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>{t.dashboard.scanDocument}</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.addDocument}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Safe */}
          <div className="bg-slate-900/80 border border-emerald-600/30 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t.status.safeShort}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-3xl font-black text-white font-mono">
                {safeCount}
              </span>
              <span className="text-[10px] text-slate-400">&gt; 90d</span>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-slate-900/80 border border-amber-500/40 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                {t.status.expiringShort}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-3xl font-black text-amber-300 font-mono">
                {expiringCount}
              </span>
              <span className="text-[10px] text-slate-400">30-90d</span>
            </div>
          </div>

          {/* Urgent / Expired */}
          <div className="bg-slate-900/80 border border-rose-500/40 p-3 sm:p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider">
                {t.status.urgentShort}
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-3xl font-black text-rose-400 font-mono">
                {urgentCount}
              </span>
              <span className="text-[10px] text-slate-400">&lt; 30d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className={`absolute top-3.5 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t.dashboard.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: t.dashboard.filterAll },
            { id: 'iqama', label: 'Iqama' },
            { id: 'health_insurance', label: 'Insurance' },
            { id: 'ejar_contract', label: 'Ejar' },
            { id: 'driving_license', label: 'License' },
            { id: 'passport', label: 'Passport' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTypeFilter(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedTypeFilter === item.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center bg-slate-950/40">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-slate-500 mx-auto flex items-center justify-center">
            <Files className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">{t.dashboard.emptyTitle}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {t.dashboard.emptyDesc}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={onNavigateToScanner}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>{t.dashboard.scanDocument}</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
            >
              {t.dashboard.addDocument}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onOpenDetails={(d) => setSelectedDoc(d)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <DocumentDetailModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDeleted={onRefresh}
        onUpdated={onRefresh}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={onRefresh}
      />
    </div>
  );
};
