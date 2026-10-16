import { db, getDaysRemaining } from '../db/db';
import { DocumentItem, DocumentType, Language, ReminderItem } from '../types';

/**
 * Standard reminder intervals specified for expatriate documents
 */
export const REMINDER_INTERVALS = [90, 60, 30, 15, 7];

/**
 * Generates a localized message for a document expiry reminder
 */
export function generateReminderMessage(
  docType: DocumentType,
  docNumber: string,
  days: number,
  expiryDate: string,
  lang: Language
): string {
  const typeNames: Record<DocumentType, { en: string; ur: string; ar: string }> = {
    iqama: { en: 'Iqama (Residence ID)', ur: 'اقامہ (ہویۃ مقیم)', ar: 'هوية مقيم (الإقامة)' },
    passport: { en: 'Passport', ur: 'پاسپورٹ', ar: 'جواز السفر' },
    driving_license: { en: 'Driving License', ur: 'ڈرائیونگ لائسنس', ar: 'رخصة القيادة' },
    health_insurance: { en: 'Health Insurance', ur: 'طبی انشورنس', ar: 'التأمين الطبي' },
    ejar_contract: { en: 'Ejar Contract', ur: 'ایجار کرایہ نامہ', ar: 'عقد إيجار' },
    vehicle_istimara: { en: 'Vehicle Istimara', ur: 'گاڑی کا استمارہ', ar: 'استمارة رخصة السير' },
    other: { en: 'Official Document', ur: 'سرکاری دستاویز', ar: 'الوثيقة الرسمية' },
  };

  const name = typeNames[docType] || typeNames.other;

  if (lang === 'ur') {
    if (days <= 0) {
      return `تنبيه: آپ کی ${name.ur} (نمبر: ${docNumber}) کی میعاد ختم ہو چکی ہے! فوری طور پر تجدید کروائیں۔`;
    }
    return `آپ کی ${name.ur} کی میعاد ${days} دن میں (${expiryDate}) ختم ہو رہی ہے۔ وقت پر تجدید کروائیں۔`;
  }

  if (lang === 'ar') {
    if (days <= 0) {
      return `تنبيه عاجل: انتهت صلاحية ${name.ar} (رقم: ${docNumber})! يُرجى التجديد لتفادي الغرامات.`;
    }
    return `تنبيه مقيم: صلاحية ${name.ar} تنتهي خلال ${days} يوماً (بتاريخ ${expiryDate}). يرجى المبادرة بالتجديد.`;
  }

  // English default
  if (days <= 0) {
    return `URGENT: Your ${name.en} (#${docNumber}) has expired! Please renew immediately on Absher to prevent penalties.`;
  }
  return `Muqeem Alert: Your ${name.en} expires in ${days} days (on ${expiryDate}). Renew now to stay compliant.`;
}

/**
 * Creates scheduled reminder records in IndexedDB for a document
 */
export async function scheduleRemindersForDocument(doc: DocumentItem): Promise<void> {
  // Remove existing reminders for this document
  await db.reminders.where('documentId').equals(doc.id).delete();

  const expiry = new Date(doc.expiryDate);
  const remindersToAdd: ReminderItem[] = [];

  for (const days of doc.reminderDays || REMINDER_INTERVALS) {
    const scheduled = new Date(expiry.getTime() - days * 24 * 60 * 60 * 1000);
    const scheduledStr = scheduled.toISOString().split('T')[0];

    remindersToAdd.push({
      id: `rem-${doc.id}-${days}d`,
      documentId: doc.id,
      documentTitle: doc.title,
      documentType: doc.type,
      expiryDate: doc.expiryDate,
      daysBefore: days,
      scheduledDate: scheduledStr,
      notified: false,
      messageEn: generateReminderMessage(doc.type, doc.documentNumber, days, doc.expiryDate, 'en'),
      messageUr: generateReminderMessage(doc.type, doc.documentNumber, days, doc.expiryDate, 'ur'),
      messageAr: generateReminderMessage(doc.type, doc.documentNumber, days, doc.expiryDate, 'ar'),
    });
  }

  await db.reminders.bulkAdd(remindersToAdd);
}

/**
 * Checks all stored documents and triggers any pending notifications right now
 */
export async function checkAndTriggerDueReminders(lang: Language): Promise<number> {
  const docs = await db.documents.toArray();
  let triggeredCount = 0;

  for (const doc of docs) {
    const daysLeft = getDaysRemaining(doc.expiryDate);
    // If daysLeft matches any threshold (<= 90, <= 60, <= 30, <= 15, <= 7, or expired)
    if (daysLeft <= 90) {
      const msg = generateReminderMessage(doc.type, doc.documentNumber, daysLeft, doc.expiryDate, lang);
      
      // Dispatch browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              title: lang === 'ur' ? 'مقیم الرٹ' : lang === 'ar' ? 'تنبيه مُقيم' : 'Muqeem Expiry Alert',
              body: msg,
              url: '/',
            });
          } else {
            new Notification(lang === 'ur' ? 'مقیم الرٹ' : lang === 'ar' ? 'تنبيه مُقيم' : 'Muqeem Expiry Alert', {
              body: msg,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
            });
          }
          triggeredCount++;
        } catch (e) {
          console.warn('Could not display notification:', e);
        }
      }
    }
  }

  return triggeredCount;
}

/**
 * ============================================================================
 * WHATSAPP BUSINESS API INTEGRATION PLACEHOLDER
 * ============================================================================
 * 
 * TODO for Enterprise & Production:
 * Integrate official WhatsApp Cloud API (Meta for Developers / Twilio) to deliver
 * automated WhatsApp alerts directly to the expatriate's phone number or sponsor.
 * 
 * Future implementation:
 * async function sendWhatsAppViaCloudApi(phoneNumber: string, templateData: object) {
 *   return await fetch('https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages', {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
 *     body: JSON.stringify({
 *       messaging_product: 'whatsapp',
 *       to: phoneNumber,
 *       type: 'template',
 *       template: { name: 'iqama_expiry_alert_v1', language: { code: 'ur' } }
 *     })
 *   });
 * }
 * 
 * Current PWA Implementation:
 * Generates instant `https://wa.me/?text=...` deep-link that lets the user
 * forward or send the reminder message with 1 click to their own WhatsApp or Kafeel.
 * ============================================================================
 */
export function buildWhatsAppReminderUrl(
  doc: DocumentItem,
  lang: Language
): string {
  const daysLeft = getDaysRemaining(doc.expiryDate);
  const msg = generateReminderMessage(doc.type, doc.documentNumber, daysLeft, doc.expiryDate, lang);
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
