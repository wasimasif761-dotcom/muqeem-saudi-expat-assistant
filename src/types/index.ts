export type Language = 'en' | 'ur' | 'ar';

export type DocumentType = 
  | 'iqama' 
  | 'passport' 
  | 'driving_license' 
  | 'health_insurance' 
  | 'ejar_contract' 
  | 'vehicle_istimara' 
  | 'other';

export type DocumentStatus = 'safe' | 'expiring' | 'urgent';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  title: string;
  documentNumber: string;
  holderName: string;
  issueDate?: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  expiryHijri?: string;
  sponsorName?: string; // Kafeel or Company
  profession?: string;
  notes?: string;
  imageUrl?: string;
  encrypted?: boolean;
  reminderDays: number[]; // e.g. [90, 60, 30, 15, 7]
  createdAt: number;
  updatedAt: number;
}

export interface ReminderItem {
  id: string;
  documentId: string;
  documentTitle: string;
  documentType: DocumentType;
  expiryDate: string;
  daysBefore: number;
  scheduledDate: string; // YYYY-MM-DD
  notified: boolean;
  messageEn: string;
  messageUr: string;
  messageAr: string;
}

export type ExpenseCategory = 
  | 'rent' 
  | 'food' 
  | 'transport' 
  | 'remittance' 
  | 'family' 
  | 'government_fees' 
  | 'utilities' 
  | 'health' 
  | 'other';

export interface ExpenseItem {
  id: string;
  monthYear: string; // YYYY-MM
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface MonthlyBudget {
  monthYear: string;
  salary: number;
  targetSavings: number;
}

export interface JeddahGuideItem {
  id: string;
  category: 'government' | 'emergency' | 'healthcare' | 'procedures' | 'transport';
  titleEn: string;
  titleUr: string;
  titleAr: string;
  descriptionEn: string;
  descriptionUr: string;
  descriptionAr: string;
  location?: string;
  phone?: string;
  website?: string;
  mapQuery?: string;
  badge?: string;
  stepsEn?: string[];
  stepsUr?: string[];
  stepsAr?: string[];
}
