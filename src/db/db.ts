import Dexie, { type Table } from 'dexie';
import { DocumentItem, DocumentStatus, ExpenseItem, MonthlyBudget, ReminderItem } from '../types';

export class MuqeemDatabase extends Dexie {
  documents!: Table<DocumentItem, string>;
  reminders!: Table<ReminderItem, string>;
  expenses!: Table<ExpenseItem, string>;
  budgets!: Table<MonthlyBudget, string>;

  constructor() {
    super('MuqeemDB');
    this.version(1).stores({
      documents: 'id, type, documentNumber, expiryDate, createdAt',
      reminders: 'id, documentId, scheduledDate, notified',
      expenses: 'id, monthYear, category, date',
      budgets: 'monthYear',
    });
  }
}

export const db = new MuqeemDatabase();

/**
 * Calculates days remaining until a given date string (YYYY-MM-DD)
 */
export function getDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const target = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines document status based on expiry criteria:
 * - Green: Safe (Expiry > 90 days)
 * - Yellow: Expiring Soon (30-90 days)
 * - Red: Expired or Urgent (< 30 days)
 */
export function getDocumentStatus(expiryDateStr: string): DocumentStatus {
  const days = getDaysRemaining(expiryDateStr);
  if (days < 30) return 'urgent';
  if (days <= 90) return 'expiring';
  return 'safe';
}

/**
 * Format relative date display
 */
export function formatRemainingText(days: number, lang: 'en' | 'ur' | 'ar'): string {
  if (days < 0) {
    const abs = Math.abs(days);
    if (lang === 'ur') return `${abs} دن پہلے ختم ہو گیا`;
    if (lang === 'ar') return `منتهي منذ ${abs} يوم`;
    return `Expired ${abs}d ago`;
  }
  if (days === 0) {
    if (lang === 'ur') return 'آج ختم ہو رہا ہے!';
    if (lang === 'ar') return 'ينتهي اليوم!';
    return 'Expires Today!';
  }
  if (lang === 'ur') return `${days} دن باقی ہیں`;
  if (lang === 'ar') return `متبقي ${days} يوم`;
  return `${days} days left`;
}

/**
 * Seed initial sample documents if the database is fresh
 */
export async function seedInitialDataIfEmpty() {
  const count = await db.documents.count();
  if (count > 0) return;

  const today = new Date();
  
  // 1. Iqama expiring in 45 days (Expiring soon - yellow)
  const iqamaExpiry = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 2. Health Insurance expiring in 18 days (Urgent - red)
  const insuranceExpiry = new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 3. Ejar Contract expiring in 140 days (Safe - green)
  const ejarExpiry = new Date(today.getTime() + 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // 4. Saudi Driving License expiring in 320 days (Safe - green)
  const licenseExpiry = new Date(today.getTime() + 320 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const initialDocs: DocumentItem[] = [
    {
      id: 'doc-iqama-001',
      type: 'iqama',
      title: 'Saudi Residence Identity (Iqama)',
      documentNumber: '2489103842',
      holderName: 'Muhammad Salman',
      issueDate: '2023-08-10',
      expiryDate: iqamaExpiry,
      expiryHijri: '1448-02-15',
      sponsorName: 'Red Sea Logistics Co. - Jeddah',
      profession: 'Systems Analyst / محلل نظم',
      notes: 'Renew via Absher Business or Qiwa platform.',
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'doc-ins-002',
      type: 'health_insurance',
      title: 'Bupa Arabia Health Card (Class B)',
      documentNumber: 'POL-992144-88',
      holderName: 'Muhammad Salman',
      issueDate: '2025-10-20',
      expiryDate: insuranceExpiry,
      sponsorName: 'Bupa Arabia Insurance',
      profession: 'Insured Employee',
      notes: 'Direct billing at Dr. Soliman Fakeeh and IMC Hospital Jeddah.',
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'doc-ejar-003',
      type: 'ejar_contract',
      title: 'Ejar Residential Tenancy Contract',
      documentNumber: 'EJAR-8842-JED-01',
      holderName: 'Muhammad Salman',
      issueDate: '2026-03-01',
      expiryDate: ejarExpiry,
      sponsorName: 'Al-Rawdah District Properties',
      notes: 'Annual rent SAR 28,000 paid in 2 installments via SADAD on Ejar.',
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'doc-lic-004',
      type: 'driving_license',
      title: 'Saudi Private Driving License',
      documentNumber: '2489103842',
      holderName: 'Muhammad Salman',
      issueDate: '2022-05-15',
      expiryDate: licenseExpiry,
      sponsorName: 'General Directorate of Traffic (Muroor)',
      notes: 'Valid for all private passenger vehicles.',
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  await db.documents.bulkAdd(initialDocs);

  // Add initial budget & expenses for current month
  const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  await db.budgets.put({
    monthYear: currentMonthYear,
    salary: 8500,
    targetSavings: 2000,
  });

  const initialExpenses: ExpenseItem[] = [
    {
      id: 'exp-1',
      monthYear: currentMonthYear,
      category: 'rent',
      amount: 2333,
      description: 'Apartment Rent (Al Rawdah monthly share)',
      date: `${currentMonthYear}-01`,
      createdAt: Date.now(),
    },
    {
      id: 'exp-2',
      monthYear: currentMonthYear,
      category: 'remittance',
      amount: 2200,
      description: 'Family remittance via Alinma Express / Tahweel Al Rajhi',
      date: `${currentMonthYear}-05`,
      createdAt: Date.now(),
    },
    {
      id: 'exp-3',
      monthYear: currentMonthYear,
      category: 'food',
      amount: 850,
      description: 'HyperPanda & Danube Groceries',
      date: `${currentMonthYear}-08`,
      createdAt: Date.now(),
    },
    {
      id: 'exp-4',
      monthYear: currentMonthYear,
      category: 'transport',
      amount: 320,
      description: 'Petrol & Jeddah Uber rides',
      date: `${currentMonthYear}-12`,
      createdAt: Date.now(),
    },
    {
      id: 'exp-5',
      monthYear: currentMonthYear,
      category: 'utilities',
      amount: 290,
      description: 'Saudi Electricity Bill & STC 5G Mobile',
      date: `${currentMonthYear}-14`,
      createdAt: Date.now(),
    },
  ];

  await db.expenses.bulkAdd(initialExpenses);
}
