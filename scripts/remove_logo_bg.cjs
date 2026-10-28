const sharp = require('sharp');
const fs = require('fs');

async function removeBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3 or 4

  // Output RGBA buffer
  const outData = Buffer.alloc(width * height * 4);
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isNearWhite(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r >= 235 && g >= 235 && b >= 235;
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    if (isNearWhite(x, 0)) {
      queue.push(x, 0);
      visited[0 * width + x] = 1;
    }
    if (isNearWhite(x, height - 1)) {
      queue.push(x, height - 1);
      visited[(height - 1) * width + x] = 1;
    }
  }
  for (let y = 0; y < height; y++) {
    if (isNearWhite(0, y) && !visited[y * width]) {
      queue.push(0, y);
      visited[y * width] = 1;
    }
    if (isNearWhite(width - 1, y) && !visited[y * width + width - 1]) {
      queue.push(width - 1, y);
      visited[y * width + width - 1] = 1;
    }
  }

  // Flood fill external background
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && isNearWhite(nx, ny)) {
          visited[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Populate RGBA
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIndex = y * width + x;
      const inIdx = pIndex * channels;
      const outIdx = pIndex * 4;

      const r = data[inIdx];
      const g = data[inIdx + 1];
      const b = data[inIdx + 2];

      if (visited[pIndex]) {
        // Fully transparent background
        outData[outIdx] = r;
        outData[outIdx + 1] = g;
        outData[outIdx + 2] = b;
        outData[outIdx + 3] = 0;
      } else {
        // Check if on edge of background for soft anti-aliased edge
        const isEdge = (
          (x > 0 && visited[pIndex - 1]) ||
          (x < width - 1 && visited[pIndex + 1]) ||
          (y > 0 && visited[pIndex - width]) ||
          (y < height - 1 && visited[pIndex + width])
        );

        if (isEdge && r >= 220 && g >= 220 && b >= 220) {
          const brightness = (r + g + b) / 3;
          const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - (brightness - 220) / (255 - 220)))));
          outData[outIdx] = r;
          outData[outIdx + 1] = g;
          outData[outIdx + 2] = b;
          outData[outIdx + 3] = alpha;
        } else {
          outData[outIdx] = r;
          outData[outIdx + 1] = g;
          outData[outIdx + 2] = b;
          outData[outIdx + 3] = 255;
        }
      }
    }
  }

  await sharp(outData, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Saved transparent image to: ${outputPath}`);
}

async function main() {
  await removeBackground('public/examjk-logo.png', 'public/examjk-logo.png.tmp');
  fs.renameSync('public/examjk-logo.png.tmp', 'public/examjk-logo.png');

  // Also generate updated icon-192, icon-512, apple-touch-icon
  await sharp('public/examjk-logo.png')
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/icon-512.png');

  await sharp('public/examjk-logo.png')
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/icon-192.png');

  await sharp('public/examjk-logo.png')
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('All icons updated with transparent background!');
}

main().catch(console.error);
