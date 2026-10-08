import { Communicate } from 'edge-tts-universal';

const rawText = process.argv[2] || '';
const voice   = process.argv[3] || 'ko-KR-SunHiNeural';
const pitch   = process.argv[4] || '+0Hz';
const rate    = process.argv[5] || '-5%';

if (!rawText.trim()) {
  process.exit(1);
}

// Clean speech input for smooth, melodic, human-like cadence:
function cleanTextForSpeech(raw) {
  if (!raw) return '';
  let t = raw
    // Remove parenthetical notes/explanations like (to stayer), (to leaver), (명사)
    .replace(/\s*\([^)]*\)/g, '')
    // Replace slashes with a soft, natural breath comma pause (never speak the word "slash")
    .replace(/\s*[\/\\]+\s*/g, ', ')
    // Remove duplicate punctuation or whitespace
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  if (!t) t = raw.trim();

  // If text doesn't end with sentence-ending punctuation, add a gentle period for polite falling tone
  if (!/[.!?\u3002\uFF01\uFF1F\u0964]$/.test(t)) {
    t = `${t}.`;
  }
  return t;
}

const text = cleanTextForSpeech(rawText);

try {
  const comm = new Communicate(text, { voice, pitch, rate });
  const stream = await comm.stream();
  for await (const chunk of stream) {
    if (chunk.type === 'audio') {
      process.stdout.write(chunk.data);
    }
  }
} catch (err) {
  process.stderr.write(String(err?.message || err));
  process.exit(1);
}
