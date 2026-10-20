import { Communicate } from 'edge-tts-universal';

const rawText = process.argv[2] || '';
const voice   = process.argv[3] || 'ko-KR-SunHiNeural';
const pitch   = process.argv[4] || '+0Hz';
const rate    = process.argv[5] || '-5%';

if (!rawText.trim()) {
  process.exit(1);
}

function cleanTextForSpeech(raw) {
  if (!raw) return '';
  let t = raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*[\/\\]+\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  if (!t) t = raw.trim();

  if (!/[.!?\u3002\uFF01\uFF1F\u0964]$/.test(t)) {
    t = `${t}.`;
  }
  return t;
}

const text = cleanTextForSpeech(rawText);

async function run() {
  const timeout = setTimeout(() => {
    process.exit(1);
  }, 6000);

  try {
    const comm = new Communicate(text, { voice, pitch, rate });
    for await (const chunk of comm.stream()) {
      if (chunk.type === 'audio' && chunk.data) {
        process.stdout.write(chunk.data);
      }
    }
    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    clearTimeout(timeout);
    process.stderr.write(String(err?.message || err));
    process.exit(1);
  }
}

run();
