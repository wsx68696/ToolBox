/** Pure-JS Base-N codecs used by the multi-base tool. */

export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function encodeBase16(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function decodeBase16(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, '');
  if (clean.length % 2) throw new Error('invalid base16 length');
  if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('invalid base16');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function encodeAlphabet(bytes: Uint8Array, alphabet: string, bitsPerChar?: number): string {
  if (bytes.length === 0) return '';
  if (bitsPerChar) {
    let bits = 0;
    let value = 0;
    let output = '';
    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= bitsPerChar) {
        bits -= bitsPerChar;
        output += alphabet[(value >> bits) & ((1 << bitsPerChar) - 1)];
      }
    }
    if (bits > 0) output += alphabet[(value << (bitsPerChar - bits)) & ((1 << bitsPerChar) - 1)];
    return output;
  }
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i += 1) {
      carry += digits[i] << 8;
      digits[i] = carry % alphabet.length;
      carry = (carry / alphabet.length) | 0;
    }
    while (carry > 0) {
      digits.push(carry % alphabet.length);
      carry = (carry / alphabet.length) | 0;
    }
  }
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  let out = alphabet[0].repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i -= 1) out += alphabet[digits[i]];
  return out;
}

function decodeAlphabet(text: string, alphabet: string, bitsPerChar?: number): Uint8Array {
  if (!text) return new Uint8Array();
  const map = new Map(alphabet.split('').map((c, i) => [c, i]));
  if (bitsPerChar) {
    let bits = 0;
    let value = 0;
    const out: number[] = [];
    for (const ch of text.replace(/\s+/g, '')) {
      const idx = map.get(ch);
      if (idx === undefined) throw new Error('invalid character');
      value = (value << bitsPerChar) | idx;
      bits += bitsPerChar;
      if (bits >= 8) {
        bits -= 8;
        out.push((value >> bits) & 0xff);
      }
    }
    return Uint8Array.from(out);
  }
  let zeros = 0;
  while (zeros < text.length && text[zeros] === alphabet[0]) zeros += 1;
  const bytes: number[] = [0];
  for (const ch of text) {
    const idx = map.get(ch);
    if (idx === undefined) throw new Error('invalid character');
    let carry = idx;
    for (let i = 0; i < bytes.length; i += 1) {
      carry += bytes[i] * alphabet.length;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < zeros; i += 1) bytes.push(0);
  return Uint8Array.from(bytes.reverse());
}

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const encodeBase32 = (b: Uint8Array) => encodeAlphabet(b, B32, 5);
export const decodeBase32 = (t: string) => decodeAlphabet(t.toUpperCase().replace(/=+$/, ''), B32, 5);

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const encodeBase58 = (b: Uint8Array) => encodeAlphabet(b, B58);
export const decodeBase58 = (t: string) => decodeAlphabet(t, B58);

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const encodeBase62 = (b: Uint8Array) => encodeAlphabet(b, B62);
export const decodeBase62 = (t: string) => decodeAlphabet(t, B62);

export function encodeBase85(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = [0, 0, 0, 0];
    let n = 0;
    for (let j = 0; j < 4 && i + j < bytes.length; j += 1) {
      chunk[j] = bytes[i + j];
      n += 1;
    }
    let value = ((chunk[0] << 24) >>> 0) + (chunk[1] << 16) + (chunk[2] << 8) + chunk[3];
    if (n === 4 && value === 0) {
      out += 'z';
      continue;
    }
    const chars: number[] = [];
    for (let k = 0; k < 5; k += 1) {
      chars.unshift((value % 85) + 33);
      value = Math.floor(value / 85);
    }
    out += String.fromCharCode(...chars.slice(0, n + 1));
  }
  return out;
}

export function decodeBase85(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, '').replace(/^<~/, '').replace(/~>$/, '');
  const out: number[] = [];
  let i = 0;
  while (i < clean.length) {
    if (clean[i] === 'z') {
      out.push(0, 0, 0, 0);
      i += 1;
      continue;
    }
    const chars = [84, 84, 84, 84, 84];
    let n = 0;
    while (n < 5 && i < clean.length) {
      const c = clean.charCodeAt(i);
      if (c < 33 || c > 117) throw new Error('invalid base85');
      chars[n] = c - 33;
      n += 1;
      i += 1;
    }
    let value = 0;
    for (let k = 0; k < 5; k += 1) value = value * 85 + chars[k];
    const bytes = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
    out.push(...bytes.slice(0, n - 1));
  }
  return Uint8Array.from(out);
}

const B91 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
export function encodeBase91(data: Uint8Array): string {
  let b = 0;
  let n = 0;
  let out = '';
  for (let i = 0; i < data.length; i += 1) {
    b |= data[i] << n;
    n += 8;
    if (n > 13) {
      let v = b & 8191;
      if (v > 88) {
        b >>= 13;
        n -= 13;
      } else {
        v = b & 16383;
        b >>= 14;
        n -= 14;
      }
      out += B91[v % 91] + B91[(v / 91) | 0];
    }
  }
  if (n) {
    out += B91[b % 91];
    if (n > 7 || b > 90) out += B91[(b / 91) | 0];
  }
  return out;
}

export function decodeBase91(text: string): Uint8Array {
  const dec = new Array(256).fill(-1);
  for (let i = 0; i < B91.length; i += 1) dec[B91.charCodeAt(i)] = i;
  let v = -1;
  let b = 0;
  let n = 0;
  const out: number[] = [];
  for (const ch of text) {
    const c = dec[ch.charCodeAt(0)];
    if (c === -1) continue;
    if (v < 0) v = c;
    else {
      v += c * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;
      do {
        out.push(b & 0xff);
        b >>= 8;
        n -= 8;
      } while (n > 7);
      v = -1;
    }
  }
  if (v > -1) out.push((b | (v << n)) & 0xff);
  return Uint8Array.from(out);
}

const B92 = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~';
export const encodeBase92 = (b: Uint8Array) => encodeAlphabet(b, B92);
export const decodeBase92 = (t: string) => decodeAlphabet(t, B92);

export function encodeBase100(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => String.fromCodePoint(b + 128512)).join('');
}

export function decodeBase100(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (cp < 128512 || cp > 128512 + 255) throw new Error('invalid base100');
    out.push(cp - 128512);
  }
  return Uint8Array.from(out);
}

export function encodeBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

export function decodeBase64(text: string): Uint8Array {
  const bin = atob(text.replace(/\s+/g, ''));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export type BaseId = 'base16' | 'base32' | 'base58' | 'base62' | 'base64' | 'base85' | 'base91' | 'base92' | 'base100';

export const BASE_CODECS: Record<BaseId, { encode: (b: Uint8Array) => string; decode: (t: string) => Uint8Array }> = {
  base16: { encode: encodeBase16, decode: decodeBase16 },
  base32: { encode: encodeBase32, decode: decodeBase32 },
  base58: { encode: encodeBase58, decode: decodeBase58 },
  base62: { encode: encodeBase62, decode: decodeBase62 },
  base64: { encode: encodeBase64, decode: decodeBase64 },
  base85: { encode: encodeBase85, decode: decodeBase85 },
  base91: { encode: encodeBase91, decode: decodeBase91 },
  base92: { encode: encodeBase92, decode: decodeBase92 },
  base100: { encode: encodeBase100, decode: decodeBase100 },
};
