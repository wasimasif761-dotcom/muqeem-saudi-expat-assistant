import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  FileCheck,
  SwitchCamera,
  RotateCcw
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { DocumentItem, DocumentType } from '../../types';
import { ParsedDocumentData, runClientOcr, parseDocumentText } from '../../utils/ocrParser';
import { parseDocumentWithGemini } from '../../utils/geminiParser';
import { db } from '../../db/db';
import { scheduleRemindersForDocument } from '../../utils/reminders';

interface DocumentScannerProps {
  onScanCompleted: () => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanCompleted }) => {
  const { t, isRtl } = useI18n();

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Scanning progress state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Result verification modal state
  const [parsedResult, setParsedResult] = useState<ParsedDocumentData | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedType, setEditedType] = useState<DocumentType>('iqama');
  const [editedDocNumber, setEditedDocNumber] = useState<string>('');
  const [editedHolderName, setEditedHolderName] = useState<string>('');
  const [editedExpiryDate, setEditedExpiryDate] = useState<string>('');
  const [editedExpiryHijri, setEditedExpiryHijri] = useState<string>('');
  const [editedSponsor, setEditedSponsor] = useState<string>('');
  const [editedProfession, setEditedProfession] = useState<string>('');

  // Start Camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      setStatusMessage('Camera access not available. Please use image upload.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Flip camera between front and rear
  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from video to canvas
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();

    // Begin OCR pipeline
    processDocumentImage(dataUrl);
  };

  // Handle manual file upload (PNG/JPG of Iqama or Contract)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      processDocumentImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Process Document with Gemini or on-device OCR
  const processDocumentImage = async (dataUrl: string) => {
    setIsScanning(true);
    setScanProgress(0.1);
    setStatusMessage(t.scanner.scanningProgress);

    try {
      // 1. Try Gemini API first (high precision for Arabic / English)
      let result: ParsedDocumentData | null = null;
      try {
        result = await parseDocumentWithGemini(dataUrl, (p, msg) => {
          setScanProgress(p);
          setStatusMessage(msg);
        });
      } catch {
        // Fallback to local
      }

      // 2. Fallback to on-device Tesseract.js OCR
      if (!result) {
        setStatusMessage(t.scanner.ocrDetecting);
        result = await runClientOcr(dataUrl, (p, msg) => {
          setScanProgress(p);
          setStatusMessage(msg);
        });
      }

      setScanProgress(1.0);
      setStatusMessage(t.scanner.scanSuccess);

      // Populate editable fields for user confirmation
      setParsedResult(result);
      setEditedType(result.type || 'iqama');
      setEditedTitle(result.title || t.docTypes[result.type || 'iqama']);
      setEditedDocNumber(result.documentNumber || '');
      setEditedHolderName(result.holderName || '');
      setEditedExpiryDate(result.expiryDate || new Date().toISOString().split('T')[0]);
      setEditedExpiryHijri(result.expiryHijri || '');
      setEditedSponsor(result.sponsorName || '');
      setEditedProfession(result.profession || '');
    } catch (err) {
      console.warn('Processing failed:', err);
      setStatusMessage(t.scanner.scanFail);
      // Give fallback
      const fallback = parseDocumentText('');
      setParsedResult(fallback);
      setEditedType('iqama');
      setEditedTitle('Saudi Iqama (Muqeem ID)');
      setEditedExpiryDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    } finally {
      setIsScanning(false);
    }
  };

  // Save confirmed document to IndexedDB
  const handleSaveConfirmed = async () => {
    if (!editedExpiryDate) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      type: editedType,
      title: editedTitle.trim() || t.docTypes[editedType],
      documentNumber: editedDocNumber.trim(),
      holderName: editedHolderName.trim(),
      expiryDate: editedExpiryDate,
      expiryHijri: editedExpiryHijri.trim() || undefined,
      sponsorName: editedSponsor.trim() || undefined,
      profession: editedProfession.trim() || undefined,
      imageUrl: capturedImage || undefined,
      reminderDays: [90, 60, 30, 15, 7],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.documents.add(newDoc);
    await scheduleRemindersForDocument(newDoc);

    // Reset scanner
    setCapturedImage(null);
    setParsedResult(null);
    onScanCompleted();
  };

  const handleReset = () => {
    setCapturedImage(null);
    setParsedResult(null);
    setScanProgress(0);
    setStatusMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center sm:text-start">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>On-Device Neural OCR + Gemini</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          {t.scanner.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Main Viewfinder / Canvas Area */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl aspect-[4/3] sm:aspect-[16/10] max-h-[480px] flex items-center justify-center">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 1. Camera View */}
        {cameraActive && !capturedImage && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* ID Card Target Alignment Guide */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner accents */}
              <div className="flex justify-between">
                <span className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <span className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              </div>

              {/* Center Guidance */}
              <div className="text-center bg-slate-950/80 backdrop-blur-sm py-1.5 px-3 rounded-full mx-auto border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
                {t.scanner.alignFrame}
              </div>

              <div className="flex justify-between">
                <span className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <span className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              </div>
            </div>

            {/* Camera Floating Controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4 z-10">
              <button
                onClick={toggleCameraFacing}
                type="button"
                className="p-3 rounded-full bg-slate-900/80 text-white backdrop-blur border border-slate-700 hover:bg-slate-800 transition active:scale-95"
                title={t.scanner.switchCamera}
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                onClick={captureSnapshot}
                type="button"
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50 ring-4 ring-white/30 transition active:scale-90"
                title={t.scanner.capture}
              >
                <Camera className="w-8 h-8" />
              </button>

              <button
                onClick={stopCamera}
                type="button"
                className="p-3 rounded-full bg-slate-900/80 text-white backdrop-blur border border-slate-700 hover:bg-slate-800 transition active:scale-95"
                title={t.scanner.cameraStop}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Captured Image View with OCR Scanning Laser Animation */}
        {capturedImage && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Document Snapshot"
              className="w-full h-full object-contain"
            />

            {/* Scanning Laser Beam Effect */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 shadow-[0_0_15px_#10b981] animate-bounce pointer-events-none" />
            )}

            {/* Scanning Progress Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mt-4">{statusMessage}</h3>
                
                {/* Progress bar */}
                <div className="w-64 max-w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(scanProgress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  {Math.round(scanProgress * 100)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Initial Empty State (Start Camera or Upload) */}
        {!cameraActive && !capturedImage && (
          <div className="p-6 text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">
                {t.scanner.cameraStart}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Point your phone camera at an Iqama, Driving License, or Ejar Contract.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={startCamera}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{t.scanner.cameraStart}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-xs text-slate-200 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{t.scanner.uploadPhoto}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>

      {/* 4. Verification and Confirmation Card */}
      {parsedResult && !isScanning && (
        <div className="rounded-3xl bg-slate-900 border border-emerald-600/40 p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                {t.scanner.scanSuccess}
              </h3>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.scanner.scanAnother}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={editedType}
                onChange={(e) => setEditedType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
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
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.documentNumber}
              </label>
              <input
                type="text"
                value={editedDocNumber}
                onChange={(e) => setEditedDocNumber(e.target.value)}
                placeholder="e.g. 2489103842"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.name}
              </label>
              <input
                type="text"
                value={editedHolderName}
                onChange={(e) => setEditedHolderName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.expiryDate} (Gregorian) *
              </label>
              <input
                type="date"
                required
                value={editedExpiryDate}
                onChange={(e) => setEditedExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.common.expiryHijri} (Hijri)
              </label>
              <input
                type="text"
                value={editedExpiryHijri}
                onChange={(e) => setEditedExpiryHijri(e.target.value)}
                placeholder="e.g. 1448-02-15"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.sponsorKafeel}
              </label>
              <input
                type="text"
                value={editedSponsor}
                onChange={(e) => setEditedSponsor(e.target.value)}
                placeholder="Sponsor / Company Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.dashboard.profession}
              </label>
              <input
                type="text"
                value={editedProfession}
                onChange={(e) => setEditedProfession(e.target.value)}
                placeholder="Profession / مهنة"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleSaveConfirmed}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.scanner.confirmAndSave}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
