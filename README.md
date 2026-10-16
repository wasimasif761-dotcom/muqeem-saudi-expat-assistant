# Muqeem (مُقيم) - Saudi Expat Life & Document Assistant

An AI-powered Progressive Web App (PWA) tailored for expatriates living in Saudi Arabia (starting with Jeddah). Muqeem helps foreign workers scan, manage, and track official documents (Iqama, Passport, Driving License, Health Insurance, Ejar Tenancy Contracts), provides smart expiry countdown reminders (90, 60, 30, 15, and 7 days), tracks earnings and living expenses in SAR, offers a comprehensive "How-to in Jeddah" survival guide, and answers Saudi labor questions with an AI Advisor.

Built with **React 19 + TypeScript + Vite + Tailwind CSS + Dexie.js (IndexedDB) + Tesseract.js / Gemini API + Web Push & Background Sync**.

---

## 🌟 Key Features

1. **Multilingual with Full RTL Support**:
   - Supports **English**, **Urdu (اردو)**, and **Arabic (العربية)**.
   - Dynamic direction flipping (`dir="rtl"` vs `dir="ltr"`) with regional typography (Alexandria and Noto Nastaliq Urdu).
2. **AI Document Scanner (Camera + OCR)**:
   - Live camera viewfinder using browser `MediaDevices.getUserMedia` with alignment guide for Saudi IDs.
   - On-device client-side OCR (Tesseract.js) + regex pattern parsing for offline privacy.
   - Server-side Gemini 2.5 Flash multimodal vision API for high-precision extraction.
   - Extraction of document number, holder name, Hijri and Gregorian expiry dates, Kafeel/sponsor, and profession.
3. **Color-Coded Status & Expiry Alerts**:
   - 🟢 **Safe**: > 90 days remaining.
   - 🟡 **Expiring Soon**: 30 to 90 days remaining.
   - 🔴 **Urgent / Expired**: < 30 days remaining (action required to avoid 500 SAR Jawazat fine).
4. **Smart Reminders & WhatsApp Integration**:
   - Web Push API & Service Worker background sync.
   - In-app test notifications and auto-scheduled alerts at 90, 60, 30, 15, and 7 days.
   - 1-click WhatsApp reminder deep-link generator for sending reminders to self or Kafeel.
5. **My Earnings & Expense Tracker**:
   - Monthly salary and target savings calculator.
   - Expense categorization (Rent/Ejar, Food, Transport, Remittance to home country, Govt fees, Utilities).
   - Interactive SVG distribution chart and breakdown with IndexedDB persistence.
6. **How-to in Jeddah Guide**:
   - Emergency helplines (911 Unified Emergency, 997 Ambulance, 199033 Najm, 19911 Qiwa).
   - Key offices: Jawazat Al Rehab, Ministry of Human Resources Al Andalus, Ejar portal.
   - Hospitals in Jeddah: King Fahd General Hospital, Dr. Soliman Fakeeh, IMC.
   - Step-by-step expatriate procedures (Iqama renewal, Qiwa sponsorship transfer, Dallah driving license).
7. **PWA & Offline Capability**:
   - Web App Manifest (`/manifest.webmanifest`) with standalone display mode.
   - Compliant 192x192, 512x512, and maskable icons.
   - `PWAInstallButton` with automatic detection and guided installation instructions for iOS Safari.
   - Service worker asset precaching and offline data indicators.
8. **Client-Side Security & Privacy**:
   - Zero telemetry or forced cloud uploads; all documents stored in IndexedDB.
   - Web Crypto API AES-GCM encryption support for confidential identifiers.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd muqeem
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Optional: Required for server-side Gemini 2.5 Flash document parsing and AI advisor
GEMINI_API_KEY="your-gemini-api-key-here"

PORT=3000
```
*(Note: If `GEMINI_API_KEY` is not provided, the app continues to function seamlessly using client-side Tesseract.js OCR and local knowledge bases!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build for Production

```bash
npm run build
```
This generates the optimized static assets in the `dist` folder and compiles the service worker.

To test the production build locally:
```bash
npm run preview
```

---

## 🚢 Deploying to Cloudflare Pages or Vercel

### Option A: Vercel (Recommended for SPA / Full-stack)
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository.
4. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add `GEMINI_API_KEY` (optional).
6. Click **Deploy**.

### Option B: Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure:
   - **Framework Preset**: None (or Vite)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Set Node.js version environment variable:
   - Variable Name: `NODE_VERSION`
   - Value: `20`
5. Click **Save and Deploy**.

---

## 📱 PWA Verification (Lighthouse Audit)
- Manifest file: `public/manifest.webmanifest`
- Service Worker: generated by `vite-plugin-pwa` with `public/sw-push.js` import.
- Viewport and theme colors configured for iOS Safari and Chromium.
- Install prompt handled via `usePWAInstall` hook with seamless iOS Safari fallback instructions.
