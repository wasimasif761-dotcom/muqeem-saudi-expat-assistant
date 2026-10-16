import { DocumentType } from '../types';

export interface ParsedDocumentData {
  type: DocumentType;
  title: string;
  documentNumber: string;
  holderName: string;
  issueDate?: string;
  expiryDate: string;
  expiryHijri?: string;
  sponsorName?: string;
  profession?: string;
  notes?: string;
  confidence: number;
}

/**
 * Normalizes Arabic / Urdu digits to standard Western digits
 */
export function normalizeDigits(str: string): string {
  const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabicDigits[i], String(i));
    result = result.replaceAll(persianDigits[i], String(i));
  }
  return result;
}

/**
 * Extracts dates from text in Gregorian (YYYY-MM-DD or DD/MM/YYYY) and Hijri (14xx/xx/xx) formats
 */
export function extractDates(rawText: string): { gregorian?: string; hijri?: string } {
  const text = normalizeDigits(rawText);
  let gregorian: string | undefined;
  let hijri: string | undefined;

  // Hijri: 14xx-xx-xx or 14xx/xx/xx
  const hijriMatch = text.match(/\b(14\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (hijriMatch) {
    const y = hijriMatch[1];
    const m = hijriMatch[2].padStart(2, '0');
    const d = hijriMatch[3].padStart(2, '0');
    hijri = `${y}-${m}-${d}`;
  }

  // Gregorian: 202x-xx-xx or 203x-xx-xx or DD/MM/202x
  const isoMatch = text.match(/\b(202[4-9]|203\d)[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    gregorian = `${y}-${m}-${d}`;
  } else {
    // DD/MM/YYYY
    const ddmmyyyy = text.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](202[4-9]|203\d)\b/);
    if (ddmmyyyy) {
      const d = ddmmyyyy[1].padStart(2, '0');
      const m = ddmmyyyy[2].padStart(2, '0');
      const y = ddmmyyyy[3];
      gregorian = `${y}-${m}-${d}`;
    }
  }

  return { gregorian, hijri };
}

/**
 * Parses raw text using smart regex & keyword detection for Saudi documents
 */
export function parseDocumentText(rawText: string): ParsedDocumentData {
  const clean = normalizeDigits(rawText);
  const upper = clean.toUpperCase();

  let detectedType: DocumentType = 'other';
  let title = 'Official Document';
  let docNumber = '';
  let holderName = '';
  let sponsorName = '';
  let profession = '';
  let confidence = 0.5;

  // 1. Detect Iqama (Residence Identity)
  // Expat Iqama number is 10 digits starting with 2
  const iqamaMatch = clean.match(/\b(2\d{9})\b/);
  const isIqamaKeyword = upper.includes('IQAMA') || 
                         clean.includes('هوية مقيم') || 
                         clean.includes('مقيم') || 
                         clean.includes('إقامة') ||
                         clean.includes('اقامة');

  if (iqamaMatch || isIqamaKeyword) {
    detectedType = 'iqama';
    title = 'Saudi Residence Identity (Iqama)';
    if (iqamaMatch) {
      docNumber = iqamaMatch[1];
      confidence = 0.9;
    }
    // Sponsor / Kafeel detection
    const sponsorMatch = clean.match(/(?:صاحب العمل|الكفيل|المستقدم|Sponsor)\s*[:：\-]?\s*([^\n\r,]+)/i);
    if (sponsorMatch) sponsorName = sponsorMatch[1].trim();

    // Profession
    const profMatch = clean.match(/(?:المهنة|الوظيفة|Profession)\s*[:：\-]?\s*([^\n\r,]+)/i);
    if (profMatch) profession = profMatch[1].trim();
  }
  // 2. Detect Passport
  else if (upper.includes('PASSPORT') || clean.includes('جواز سفر') || clean.includes('پاسپورٹ')) {
    detectedType = 'passport';
    title = 'Passport';
    const passportNoMatch = upper.match(/\b([A-Z][0-9]{7,8})\b/) || clean.match(/\b([A-Z0-9]{8,10})\b/);
    if (passportNoMatch) {
      docNumber = passportNoMatch[1];
      confidence = 0.85;
    }
  }
  // 3. Detect Ejar Tenancy Contract
  else if (upper.includes('EJAR') || clean.includes('إيجار') || clean.includes('عقد إيجار') || clean.includes('ایجار')) {
    detectedType = 'ejar_contract';
    title = 'Ejar Tenancy Contract';
    const ejarNo = clean.match(/\b(\d{10,14})\b/);
    if (ejarNo) {
      docNumber = `EJAR-${ejarNo[1].slice(-8)}`;
      confidence = 0.8;
    }
  }
  // 4. Detect Health Insurance
  else if (upper.includes('CCHI') || upper.includes('BUPA') || upper.includes('TAWUNIYA') || clean.includes('تأمين') || clean.includes('مجلس الضمان')) {
    detectedType = 'health_insurance';
    title = 'Cooperative Health Insurance';
    const polMatch = upper.match(/\b(POL[-\d]+|\d{8,12})\b/);
    if (polMatch) {
      docNumber = polMatch[1];
      confidence = 0.8;
    }
  }
  // 5. Detect Driving License
  else if (upper.includes('DRIVING') || upper.includes('LICENSE') || clean.includes('رخصة قيادة') || clean.includes('لائسنس')) {
    detectedType = 'driving_license';
    title = 'Saudi Driving License';
    const licMatch = clean.match(/\b(2\d{9})\b/);
    if (licMatch) {
      docNumber = licMatch[1];
      confidence = 0.85;
    }
  }

  // Extract Dates
  const { gregorian, hijri } = extractDates(clean);

  // If no Gregorian date was found, compute a reasonable default (e.g. 1 year from now) so user can adjust
  let finalExpiry = gregorian;
  if (!finalExpiry) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    finalExpiry = d.toISOString().split('T')[0];
  }

  // Extract Name heuristics if available
  const nameMatch = clean.match(/(?:الاسم|Name|اسم المقيم)\s*[:：\-]?\s*([A-Za-z\s]{4,30}|[\u0600-\u06FF\s]{4,30})/);
  if (nameMatch) {
    holderName = nameMatch[1].trim();
  }

  return {
    type: detectedType,
    title,
    documentNumber: docNumber || (iqamaMatch ? iqamaMatch[1] : ''),
    holderName: holderName || '',
    expiryDate: finalExpiry,
    expiryHijri: hijri || '',
    sponsorName,
    profession,
    confidence,
  };
}

/**
 * Runs client-side OCR via Tesseract.js in browser
 */
export async function runClientOcr(
  imageSource: string | HTMLCanvasElement | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedDocumentData> {
  try {
    onProgress?.(0.15, 'Loading OCR neural engine...');
    const Tesseract = await import('tesseract.js');

    onProgress?.(0.35, 'Initializing language models (Arabic & Latin)...');
    
    // Create worker
    const worker = await Tesseract.createWorker('eng+ara', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const p = 0.4 + (m.progress || 0) * 0.55;
          onProgress?.(p, `Recognizing characters... ${Math.round((m.progress || 0) * 100)}%`);
        }
      }
    });

    onProgress?.(0.5, 'Reading document text...');
    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const rawText = ret.data.text || '';
    onProgress?.(0.95, 'Parsing document fields and dates...');
    return parseDocumentText(rawText);
  } catch (err) {
    console.warn('Tesseract OCR client error, falling back to heuristic parsing:', err);
    // Provide safe fallback with default template
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    return {
      type: 'iqama',
      title: 'Saudi Residence Identity (Iqama)',
      documentNumber: '',
      holderName: '',
      expiryDate: today.toISOString().split('T')[0],
      confidence: 0.3,
    };
  }
}
