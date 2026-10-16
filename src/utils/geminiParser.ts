import { ParsedDocumentData } from './ocrParser';

/**
 * ============================================================================
 * GEMINI API ADVANCED DOCUMENT PARSING INTEGRATION POINT
 * ============================================================================
 * 
 * This module connects to Google Gemini API (via server proxy /api/gemini/parse-document
 * or client-side GenAI SDK) for high-accuracy multimodal vision extraction of
 * official Saudi documents (Iqama, Passport, Driving License, Ejar, Insurance).
 * 
 * Highlights:
 * - Reads Arabic, Urdu and English typography effortlessly even in low light
 * - Accurately converts Hijri dates (Umm al-Qura calendar) to Gregorian
 * - Extracts Kafeel (sponsor), profession (مهنة), border number (رقم الحدود)
 * 
 * TODO: For production deployments requiring custom enterprise quotas:
 * 1. Ensure GEMINI_API_KEY is configured in your cloud environment variables.
 * 2. In server.ts, endpoints /api/gemini/parse-document and /api/gemini/advisor
 *    proxy calls securely without exposing the API key to the client browser.
 * ============================================================================
 */

export async function parseDocumentWithGemini(
  base64Image: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedDocumentData | null> {
  try {
    onProgress?.(0.2, 'Sending image to Gemini Multimodal AI...');
    
    // Attempt to call server endpoint
    const response = await fetch('/api/gemini/parse-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    onProgress?.(0.85, 'Gemini analyzed document structure...');
    const result = await response.json();
    return result.data as ParsedDocumentData;
  } catch (err) {
    console.info('Gemini server endpoint unavailable or offline. Falling back seamlessly to local on-device OCR:', err);
    return null;
  }
}
