/**
 * Encode an AudioBuffer as a 16-bit PCM WAV Blob.
 * Adapted from the classic bufferToWave helper used by many web tools.
 */
export function bufferToWave(abuffer: AudioBuffer, len?: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const sampleRate = abuffer.sampleRate;
  const length = typeof len === 'number' ? Math.floor(len) : abuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numOfChan * bytesPerSample;
  const buffer = new ArrayBuffer(44 + length * blockAlign);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];

  let offset = 0;
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(offset + i, s.charCodeAt(i));
    offset += s.length;
  };

  writeString('RIFF');
  view.setUint32(offset, 36 + length * blockAlign, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4; // PCM chunk size
  view.setUint16(offset, 1, true); offset += 2; // PCM format
  view.setUint16(offset, numOfChan, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, 8 * bytesPerSample, true); offset += 2;
  writeString('data');
  view.setUint32(offset, length * blockAlign, true); offset += 4;

  for (let i = 0; i < numOfChan; i += 1) channels.push(abuffer.getChannelData(i));

  for (let i = 0; i < length; i += 1) {
    for (let ch = 0; ch < numOfChan; ch += 1) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
