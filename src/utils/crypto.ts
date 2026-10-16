/**
 * Web Crypto API AES-GCM encryption for client-side privacy of official documents
 */

const SALT = new Uint8Array([120, 45, 99, 12, 88, 201, 44, 76, 19, 54, 91, 134, 22, 10, 67, 98]);
const DEFAULT_KEY_PHRASE = 'muqeem-local-safe-vault-jeddah';

async function deriveKey(passphrase: string = DEFAULT_KEY_PHRASE): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await deriveKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivArr = Array.from(iv);
    const ctArr = Array.from(new Uint8Array(ciphertext));
    return JSON.stringify({ iv: ivArr, data: ctArr });
  } catch (err) {
    console.warn('Crypto error during encryption, using fallback:', err);
    return plainText;
  }
}

export async function decryptText(encryptedString: string): Promise<string> {
  if (!encryptedString) return '';
  try {
    if (!encryptedString.startsWith('{"iv":')) {
      return encryptedString; // plain text fallback
    }
    const parsed = JSON.parse(encryptedString);
    const key = await deriveKey();
    const iv = new Uint8Array(parsed.iv);
    const ciphertext = new Uint8Array(parsed.data);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn('Crypto error during decryption:', err);
    return encryptedString;
  }
}
