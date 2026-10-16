import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Outer Rounded Shield -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />
  <rect x="16" y="16" width="480" height="480" rx="92" fill="none" stroke="#10b981" stroke-width="4" stroke-opacity="0.4" />
  
  <!-- Document Card Shield -->
  <g filter="url(#shadow)" transform="translate(106, 80)">
    <rect width="300" height="352" rx="36" fill="#0f172a" fill-opacity="0.85" stroke="url(#goldGrad)" stroke-width="6"/>
    
    <!-- Header of Card -->
    <rect x="24" y="24" width="252" height="40" rx="10" fill="#047857" />
    <circle cx="50" cy="44" r="10" fill="#fde047" />
    <rect x="74" y="38" width="120" height="12" rx="6" fill="#ffffff" />
    
    <!-- Document ID Chip / Palm emblem -->
    <circle cx="150" cy="150" r="54" fill="#047857" stroke="#fde047" stroke-width="4" />
    
    <!-- Stylized Arabic "م" and Crescent -->
    <path d="M 140 120 C 165 120, 175 140, 165 165 C 155 185, 130 180, 130 155 C 130 135, 142 125, 155 125" 
          fill="none" stroke="#fde047" stroke-width="8" stroke-linecap="round"/>
    <circle cx="165" cy="130" r="6" fill="#ffffff"/>
    
    <!-- Document Lines -->
    <rect x="40" y="235" width="220" height="14" rx="7" fill="#e2e8f0" />
    <rect x="40" y="265" width="160" height="12" rx="6" fill="#94a3b8" />
    
    <!-- Security Hologram / Checkmark Badge -->
    <circle cx="230" cy="275" r="22" fill="#10b981" />
    <path d="M 220 275 L 227 282 L 242 267" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Expiry Alert Indicator Bar -->
    <rect x="40" y="305" width="220" height="8" rx="4" fill="#22c55e" />
  </g>
  
  <!-- Text Label "MUQEEM" -->
  <text x="256" y="482" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="#f8fafc" letter-spacing="4">MUQEEM • مقيم</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Function to generate a simple uncompressed valid PNG file
function generateSolidPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance to center
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold badge in center
      const isBadge = dist < 0.45;
      const isRing = dist >= 0.45 && dist <= 0.52;
      const isInnerShield = Math.abs(dx) < 0.6 && Math.abs(dy) < 0.7;

      if (isRing) {
        rawData[pixelOffset] = 234;     // R (Gold)
        rawData[pixelOffset + 1] = 179; // G
        rawData[pixelOffset + 2] = 8;   // B
        rawData[pixelOffset + 3] = 255;
      } else if (isBadge) {
        rawData[pixelOffset] = 6;       // R (Deep Emerald)
        rawData[pixelOffset + 1] = 78;  // G
        rawData[pixelOffset + 2] = 59;  // B
        rawData[pixelOffset + 3] = 255;
      } else if (isInnerShield) {
        rawData[pixelOffset] = 15;      // R (Slate 900)
        rawData[pixelOffset + 1] = 23;  // G
        rawData[pixelOffset + 2] = 42;  // B
        rawData[pixelOffset + 3] = 255;
      } else {
        // Gradient emerald green
        const factor = 1 - (y / height) * 0.3;
        rawData[pixelOffset] = Math.round(r * factor);
        rawData[pixelOffset + 1] = Math.round(g * factor);
        rawData[pixelOffset + 2] = Math.round(b * factor);
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) | 0;
}

const table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

// Generate files:
// Emerald green: #047857 -> r: 4, g: 120, b: 87
const pwa192 = generateSolidPNG(192, 192, 4, 120, 87);
const pwa512 = generateSolidPNG(512, 512, 4, 120, 87);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pwa192);

console.log('Successfully generated PWA icons in /public!');
