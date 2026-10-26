#!/usr/bin/env python3
import sys
import asyncio
import os

try:
    import edge_tts
except ImportError:
    sys.stderr.write("edge-tts library not found\n")
    sys.exit(1)

async def main():
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: tts_engine.py <text> <voice> [pitch] [rate] [output_path]\n")
        sys.exit(1)

    text = sys.argv[1].strip()
    voice = sys.argv[2].strip()
    pitch = sys.argv[3].strip() if len(sys.argv) > 3 else "+0Hz"
    rate = sys.argv[4].strip() if len(sys.argv) > 4 else "+0%"
    out_path = sys.argv[5].strip() if len(sys.argv) > 5 else None

    if not text:
        sys.stderr.write("Empty text\n")
        sys.exit(1)

    # Sanitize pitch to strictly match edge_tts regex ^[+-]\d+Hz$
    pitch = pitch.strip()
    if not pitch or pitch == "default":
        pitch = "+0Hz"
    else:
        if not pitch.startswith(("+", "-")):
            pitch = f"+{pitch}"
        if not pitch.endswith("Hz"):
            pitch = f"{pitch}Hz"

    # Sanitize rate to strictly match edge_tts regex ^[+-]\d+%$
    rate = rate.strip()
    if not rate or rate == "default":
        rate = "+0%"
    else:
        if not rate.startswith(("+", "-")):
            rate = f"+{rate}"
        if not rate.endswith("%"):
            rate = f"{rate}%"

    communicate = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)

    if out_path:
        await communicate.save(out_path)
    else:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio" and "data" in chunk:
                sys.stdout.buffer.write(chunk["data"])

if __name__ == "__main__":
    asyncio.run(main())
