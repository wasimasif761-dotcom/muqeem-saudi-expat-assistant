/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { Header } from './components/layout/Header';
import { Navbar, TabType } from './components/layout/Navbar';
import { DocumentList } from './components/dashboard/DocumentList';
import { DocumentScanner } from './components/scanner/DocumentScanner';
import { ExpenseTracker } from './components/expenses/ExpenseTracker';
import { JeddahGuide } from './components/guide/JeddahGuide';
import { AIAdvisor } from './components/advisor/AIAdvisor';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { db, seedInitialDataIfEmpty } from './db/db';
import { DocumentItem } from './types';
import { checkAndTriggerDueReminders } from './utils/reminders';

const MainApp: React.FC = () => {
  const { lang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      await seedInitialDataIfEmpty();
      const all = await db.documents.toArray();
      // Sort: urgent & expiring first, then by expiry date ascending
      all.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      setDocuments(all);
    } catch (err) {
      console.warn('Error loading documents from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Run reminder check once on mount
    checkAndTriggerDueReminders(lang);

    // Listen for Service Worker background sync check message
    if ('serviceWorker' in navigator) {
      const handleSwMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'CHECK_EXPIRIES_NOW') {
          checkAndTriggerDueReminders(lang);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [lang]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-24">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:py-7">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-spin">
              <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">
              {t.common.loading}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DocumentList
                documents={documents}
                onRefresh={fetchDocuments}
                onNavigateToScanner={() => setActiveTab('scanner')}
              />
            )}

            {activeTab === 'scanner' && (
              <DocumentScanner
                onScanCompleted={() => {
                  fetchDocuments();
                  setActiveTab('dashboard');
                }}
              />
            )}

            {activeTab === 'earnings' && <ExpenseTracker />}

            {activeTab === 'jeddah' && <JeddahGuide />}

            {activeTab === 'advisor' && <AIAdvisor />}
          </>
        )}
      </main>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Bottom Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
