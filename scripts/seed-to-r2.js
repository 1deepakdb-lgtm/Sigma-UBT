import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

// ==========================================
// CONFIGURATION
// ==========================================
// Replace these with your actual Cloudflare R2 credentials
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "your_account_id_here";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "your_access_key_here";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "your_secret_key_here";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "sigma-ubt";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-xxxxxxxxxxxxxx.r2.dev";

// Paths
const DATA_FILE_PATH = path.join(process.cwd(), "data", "eps-book-chapters.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Initialize Cloudflare R2 Client (using S3 compatibility)
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Helper to upload a local file to R2 and return the new public URL
 */
async function uploadToR2(localRelativePath) {
  // If it's already an external URL (http), skip it
  if (localRelativePath.startsWith("http")) return localRelativePath;

  // Construct absolute local path (e.g., /uploads/Chapter_01.pdf -> C:/.../public/uploads/Chapter_01.pdf)
  const localAbsolutePath = path.join(PUBLIC_DIR, localRelativePath);

  try {
    const fileBuffer = await fs.readFile(localAbsolutePath);
    
    // Remove leading slash for the S3 object key (e.g., "uploads/Chapter_01.pdf")
    const objectKey = localRelativePath.startsWith("/") ? localRelativePath.substring(1) : localRelativePath;
    
    const contentType = mime.lookup(localAbsolutePath) || "application/octet-stream";

    console.log(`Uploading ${objectKey} to R2...`);
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    // Return the new public URL
    return `${R2_PUBLIC_URL}/${objectKey}`;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`?? Skipping: Local file not found at ${localAbsolutePath}`);
      return localRelativePath; // Keep old path if file is missing locally
    }
    console.error(`?? Error uploading ${localRelativePath}:`, error);
    throw error;
  }
}

async function main() {
  console.log("Starting R2 Asset Seeding...");

  // 1. Read existing chapters JSON
  let rawData;
  try {
    rawData = await fs.readFile(DATA_FILE_PATH, "utf-8");
  } catch (err) {
    console.error("Could not find eps-book-chapters.json. Run the app once to generate it.");
    process.exit(1);
  }

  const chapters = JSON.parse(rawData);
  let updatedCount = 0;

  // 2. Loop through all chapters and process files
  for (const chapter of chapters) {
    console.log(`\nProcessing Chapter ${chapter.chapter}: ${chapter.titleEn}`);

    // Upload PDF
    if (chapter.pdfUrl && chapter.pdfUrl.startsWith("/uploads")) {
      const newPdfUrl = await uploadToR2(chapter.pdfUrl);
      if (newPdfUrl !== chapter.pdfUrl) {
        chapter.pdfUrl = newPdfUrl;
        updatedCount++;
      }
    }

    // Upload Audio Tracks
    if (chapter.audioTracks && chapter.audioTracks.length > 0) {
      for (const track of chapter.audioTracks) {
        if (track.url && track.url.startsWith("/uploads")) {
          const newAudioUrl = await uploadToR2(track.url);
          if (newAudioUrl !== track.url) {
            track.url = newAudioUrl;
            updatedCount++;
          }
        }
      }
    }
  }

  // 3. Save the updated JSON back to the file
  if (updatedCount > 0) {
    console.log(`\n? Uploads complete! Writing ${updatedCount} updated links back to JSON...`);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(chapters, null, 2), "utf-8");
    console.log("? Success: eps-book-chapters.json has been updated with R2 links!");
  } else {
    console.log("\n? No new local files found to upload.");
  }
}

main().catch(console.error);
