#!/usr/bin/env python3
import sys
import asyncio
import os
import glob

# 1. On Linux (e.g. cPanel), prioritize native user and system site-packages for this EXACT python version
home = os.path.expanduser("~")
py_ver = f"python{sys.version_info.major}.{sys.version_info.minor}"
if sys.platform != 'darwin':
    for pattern in [
        os.path.join(home, f".local/lib/{py_ver}/site-packages"),
        f"/home/*/.local/lib/{py_ver}/site-packages",
        f"/opt/alt/{py_ver}/lib/{py_ver}/site-packages",
        f"/opt/alt/{py_ver}/lib64/{py_ver}/site-packages",
        f"/usr/local/lib/{py_ver}/site-packages",
        f"/usr/lib/{py_ver}/site-packages",
        f"/usr/lib64/{py_ver}/site-packages"
    ]:
        for p in glob.glob(pattern):
            if p not in sys.path:
                sys.path.insert(0, p)

# 2. Add vendored packages in scripts/vendor (for darwin or fallback)
vendor_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vendor')
if os.path.exists(vendor_dir) and vendor_dir not in sys.path:
    if sys.platform == 'darwin':
        sys.path.insert(0, vendor_dir)
    else:
        sys.path.append(vendor_dir)

# 3. Add macOS Library python site-packages
for p in glob.glob(os.path.join(home, "Library/Python/*/lib/python/site-packages")):
    if p not in sys.path:
        sys.path.insert(0, p)

# 4. Compatibility polyfill for Python 3.11/3.10 with newer aiohttp TypeVar default
import typing
try:
    import typing_extensions
    typing.TypeVar = typing_extensions.TypeVar
except Exception:
    pass

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
