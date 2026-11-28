/**
 * Universal Zero-Latency Instant Audio Engine (ExamJK Universal Audio)
 * Provides nanosecond/microsecond audio playback response across all app sections:
 * - In-memory decoded Web Audio API AudioBuffers (instant 0ms trigger without element startup lag)
 * - LRU Blob URL cache + prefetch queue
 * - Background prefetching on viewport, hover, and component mount
 * - High-fidelity Microsoft Neural Voice matching Dictionary defaults (ko-KR-SunHiNeural / ja-JP-NanamiNeural)
 * - Seamless zero-gap fallback to speech synthesis / HTML5 Audio
 */

// Global singletons across entire application lifetime
let globalAudioCtx = null;
const audioBufferCache = new Map(); // url -> AudioBuffer (0-latency Web Audio)
const audioBlobCache = new Map();   // url -> Blob URL (instant HTML5 Audio fallback)
const inFlightRequests = new Map(); // url -> Promise<AudioBuffer>
let activeSourceNode = null;
let activeHtmlAudio = null;
let activePlayingId = null;
const activeListeners = new Set();

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

// Ensure AudioContext is unlocked on the very first user interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (_) {}
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, { capture: true, once: true });
  window.addEventListener('keydown', unlock, { capture: true, once: true });
  window.addEventListener('touchstart', unlock, { capture: true, once: true });
}

export function subscribeAudioState(callback) {
  activeListeners.add(callback);
  return () => activeListeners.delete(callback);
}

function notifyStateChange(id, isPlaying, isLoading = false) {
  activePlayingId = isPlaying ? id : null;
  activeListeners.forEach((fn) => {
    try {
      fn({ activeId: activePlayingId, isPlaying, isLoading });
    } catch (_) {}
  });
}

/**
 * Builds the standard high-fidelity Neural TTS URL matching the default active voice
 */
export function buildStandardTtsUrl(text, lang = 'ko', gender = 'female', options = {}) {
  const clean = String(text || '').trim().replace(/[#*`_~]/g, '');
  if (!clean) return '';

  const isJa = lang === 'ja' || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(clean);
  const isMale = gender === 'male';

  const langCode = isJa ? 'ja' : 'ko';
  const defaultVoice = isJa
    ? (isMale ? 'ja-JP-KeitaNeural' : 'ja-JP-NanamiNeural')
    : (isMale ? 'ko-KR-InJoonNeural' : 'ko-KR-SunHiNeural');
  const defaultModel = isJa
    ? (isMale ? 'ja-male-1' : 'ja-female-1')
    : (isMale ? 'male-1' : 'female-1');

  const voice = options.voice || defaultVoice;
  const model = options.model || defaultModel;
  const rate = options.rate || (isJa ? '-4%' : '-2%');
  const pitch = options.pitch || '+0Hz';

  return `/api/tts?text=${encodeURIComponent(clean)}&lang=${langCode}&gender=${isMale ? 'male' : 'female'}&voice=${encodeURIComponent(voice)}&model=${encodeURIComponent(model)}&rate=${encodeURIComponent(rate)}&pitch=${encodeURIComponent(pitch)}`;
}

/**
 * Pre-fetches and pre-decodes an audio URL into memory so it plays in 0 milliseconds
 */
export async function prefetchAudio(url) {
  if (!url || typeof window === 'undefined') return;
  if (audioBufferCache.has(url) || inFlightRequests.has(url)) return;

  const ctx = getAudioContext();
  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();

      // Save blob URL for instant standard Audio element fallback
      try {
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        audioBlobCache.set(url, URL.createObjectURL(blob));
      } catch (_) {}

      // Decode into Web Audio Buffer for 0-latency microsecond trigger
      if (ctx) {
        try {
          const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
          audioBufferCache.set(url, decoded);
          return decoded;
        } catch (_) {}
      }
    } catch (_) {
    } finally {
      inFlightRequests.delete(url);
    }
    return null;
  })();

  inFlightRequests.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Batch prefetch a list of URLs or text items to warm up the cache
 */
export function prefetchBatch(items = [], lang = 'ko', gender = 'female') {
  if (typeof window === 'undefined' || !Array.isArray(items)) return;
  const runner = () => {
    items.slice(0, 30).forEach((item) => {
      const url = typeof item === 'string' && item.startsWith('/')
        ? item
        : buildStandardTtsUrl(typeof item === 'string' ? item : (item.text || item.korean || item.japanese || item.word || ''), lang, gender);
      if (url) prefetchAudio(url);
    });
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runner, { timeout: 2000 });
  } else {
    setTimeout(runner, 150);
  }
}

/**
 * Stop any ongoing audio playback across the application
 */
export function stopAllAudio() {
  if (activeSourceNode) {
    try { activeSourceNode.stop(); } catch (_) {}
    activeSourceNode = null;
  }
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch (_) {}
    activeHtmlAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  notifyStateChange(null, false, false);
}

/**
 * Play audio instantly with ZERO latency (nano/microsecond Web Audio playback)
 * If already cached in memory, sound starts immediately on the current event tick.
 */
export async function playInstantAudio({
  url,
  text = '',
  lang = 'ko',
  gender = 'female',
  id = null,
  onStart = null,
  onEnd = null,
  onError = null,
  voice = null,
  model = null
}) {
  if (typeof window === 'undefined') return;

  const audioId = id || text || url;

  // Toggle off if clicking the currently playing sound
  if (activePlayingId === audioId && activePlayingId !== null) {
    stopAllAudio();
    if (onEnd) onEnd();
    return;
  }

  stopAllAudio();

  const finalUrl = url || buildStandardTtsUrl(text, lang, gender, { voice, model });
  const isJa = lang === 'ja' || (text && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text));
  const isMale = gender === 'male';

  const ctx = getAudioContext();

  // 1. FAST PATH (< 1 millisecond): Web Audio buffer already decoded in RAM
  if (ctx && audioBufferCache.has(finalUrl)) {
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = audioBufferCache.get(finalUrl);
      source.connect(ctx.destination);

      activeSourceNode = source;
      notifyStateChange(audioId, true, false);
      if (onStart) onStart();

      source.onended = () => {
        if (activeSourceNode === source) {
          activeSourceNode = null;
          notifyStateChange(null, false, false);
          if (onEnd) onEnd();
        }
      };

      source.start(0);
      return;
    } catch (_) {}
  }

  // 2. SECOND FAST PATH: Cached Blob URL available
  if (audioBlobCache.has(finalUrl)) {
    try {
      const blobUrl = audioBlobCache.get(finalUrl);
      const audio = new Audio(blobUrl);
      activeHtmlAudio = audio;

      audio.onplay = () => {
        notifyStateChange(audioId, true, false);
        if (onStart) onStart();
      };
      audio.onended = () => {
        if (activeHtmlAudio === audio) {
          activeHtmlAudio = null;
          notifyStateChange(null, false, false);
          if (onEnd) onEnd();
        }
      };
      audio.onerror = () => {
        fallbackSpeech(text, isJa ? 'ja' : 'ko', isMale, audioId, onStart, onEnd, onError);
      };

      await audio.play();
      return;
    } catch (_) {}
  }

  // 3. IN-FLIGHT OR FRESH FETCH: Play as soon as data arrives + decode for next click
  notifyStateChange(audioId, false, true);

  if (finalUrl) {
    const audio = new Audio(finalUrl);
    activeHtmlAudio = audio;

    let hasStarted = false;
    audio.onplay = () => {
      hasStarted = true;
      notifyStateChange(audioId, true, false);
      if (onStart) onStart();
    };
    audio.onended = () => {
      if (activeHtmlAudio === audio) {
        activeHtmlAudio = null;
        notifyStateChange(null, false, false);
        if (onEnd) onEnd();
      }
    };
    audio.onerror = () => {
      if (!hasStarted) {
        fallbackSpeech(text, isJa ? 'ja' : 'ko', isMale, audioId, onStart, onEnd, onError);
      } else {
        stopAllAudio();
        if (onError) onError();
      }
    };

    // Trigger prefetch for future instant clicks
    prefetchAudio(finalUrl);

    try {
      await audio.play();
      return;
    } catch (err) {
      if (!hasStarted) {
        fallbackSpeech(text, isJa ? 'ja' : 'ko', isMale, audioId, onStart, onEnd, onError);
      }
    }
  } else if (text) {
    fallbackSpeech(text, isJa ? 'ja' : 'ko', isMale, audioId, onStart, onEnd, onError);
  }
}

function fallbackSpeech(text, lang, isMale, audioId, onStart, onEnd, onError) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    notifyStateChange(null, false, false);
    if (onError) onError();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === 'ja' ? 'ja-JP' : 'ko-KR';
    utt.rate = 0.95;
    utt.pitch = isMale ? 0.88 : 1.1;

    utt.onstart = () => {
      notifyStateChange(audioId, true, false);
      if (onStart) onStart();
    };
    utt.onend = () => {
      notifyStateChange(null, false, false);
      if (onEnd) onEnd();
    };
    utt.onerror = () => {
      notifyStateChange(null, false, false);
      if (onError) onError();
    };

    window.speechSynthesis.speak(utt);
  } catch (_) {
    notifyStateChange(null, false, false);
    if (onError) onError();
  }
}
