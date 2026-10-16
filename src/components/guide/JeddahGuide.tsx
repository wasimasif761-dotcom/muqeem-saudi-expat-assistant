import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Phone, 
  ExternalLink, 
  ShieldAlert, 
  Building2, 
  HeartPulse, 
  FileText, 
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { jeddahGuideList } from '../../data/jeddahGuideData';
import { useI18n } from '../../context/I18nContext';

export const JeddahGuide: React.FC = () => {
  const { lang, t, isRtl } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredGuides = jeddahGuideList.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = search.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesText =
      item.titleEn.toLowerCase().includes(q) ||
      item.titleUr.includes(q) ||
      item.titleAr.includes(q) ||
      item.descriptionEn.toLowerCase().includes(q) ||
      item.descriptionUr.includes(q) ||
      item.descriptionAr.includes(q) ||
      (item.phone && item.phone.includes(q));

    return matchesCat && matchesText;
  });

  const getTitle = (item: typeof jeddahGuideList[0]) => {
    if (lang === 'ur') return item.titleUr;
    if (lang === 'ar') return item.titleAr;
    return item.titleEn;
  };

  const getDesc = (item: typeof jeddahGuideList[0]) => {
    if (lang === 'ur') return item.descriptionUr;
    if (lang === 'ar') return item.descriptionAr;
    return item.descriptionEn;
  };

  const getSteps = (item: typeof jeddahGuideList[0]) => {
    if (lang === 'ur') return item.stepsUr;
    if (lang === 'ar') return item.stepsAr;
    return item.stepsEn;
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-950/70 via-slate-900/90 to-emerald-950/70 border border-teal-700/30 p-5 sm:p-6 shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Bride of the Red Sea • عروس البحر الأحمر</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {t.jeddah.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
          {t.jeddah.subtitle}
        </p>

        {/* Quick Emergency Numbers Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Quick Helplines:</span>
          <a
            href="tel:911"
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> 911 Unified
          </a>
          <a
            href="tel:997"
            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> 997 Ambulance
          </a>
          <a
            href="tel:199033"
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> 199033 Najm
          </a>
          <a
            href="tel:19911"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> 19911 Qiwa
          </a>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className={`absolute top-3.5 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t.jeddah.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: t.jeddah.categories.all },
            { id: 'government', label: t.jeddah.categories.government },
            { id: 'emergency', label: t.jeddah.categories.emergency },
            { id: 'healthcare', label: t.jeddah.categories.healthcare },
            { id: 'procedures', label: t.jeddah.categories.procedures },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGuides.map((item) => {
          const steps = getSteps(item);
          const isExpanded = expandedId === item.id;

          const categoryIcons = {
            emergency: ShieldAlert,
            government: Building2,
            healthcare: HeartPulse,
            procedures: FileText,
            transport: Compass,
          }[item.category];

          const Icon = categoryIcons || Building2;

          return (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-5 shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        {getTitle(item)}
                      </h3>
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {getDesc(item)}
                </p>

                {/* Location text if available */}
                {item.location && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}

                {/* Expandable Step-by-Step Procedure */}
                {steps && steps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>{t.jeddah.stepByStep} ({steps.length} steps)</span>
                      <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isExpanded && (
                      <ol className="mt-2.5 space-y-2 text-xs text-slate-300 ps-1">
                        {steps.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{st}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons (Call, Maps, Portal) */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.jeddah.callNow} ({item.phone})</span>
                  </a>
                )}

                {item.mapQuery && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t.jeddah.openMap}</span>
                  </a>
                )}

                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.jeddah.officialSite}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
