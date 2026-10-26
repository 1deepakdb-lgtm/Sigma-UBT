// scripts/import_from_docx.js
// ------------------------------------------------------------
// This utility reads a Microsoft Word (.docx) file, extracts questions,
// detects the correct answer via **underlined** option text, and saves any
// images that belong to a question or to an individual option.
// The resulting JSON follows the schema defined in the documentation
// (auto_update_question_format.md) and can be fed to scripts/import_questions.js.
// ------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper: write a buffer to the public uploads folder and return the filename.
 */
async function saveImage(buffer, ext) {
  const fileName = `${uuidv4()}.${ext}`;
  const outPath = path.join('public', 'uploads', fileName);
  await sharp(buffer).png().toFile(outPath);
  return fileName;
}

/**
 * Parse a block of HTML that represents a single question.
 * Expected structure (simplified):
 *   <p class="mainHeading">[ 1 – 2 ] ...</p>
 *   <p class="description">Question text possibly with <img src="..."/></p>
 *   <ul>
 *     <li>Option A</li>
 *     <li><u>Option B</u></li>   // underlined = correct answer
 *     <li>Option C <img src="..."/></li>
 *   </ul>
 */
function parseQuestionBlock(blockHtml) {
  // Extract the main heading (first <p>)
  const headingMatch = blockHtml.match(/<p[^>]*>([^<]*)<\/p>/i);
  const mainHeading = headingMatch ? headingMatch[1].trim() : '';

  // Extract description (first <p> after heading that is not the heading itself)
  const descMatches = [...blockHtml.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
  const description = descMatches.length > 1 ? descMatches[1][1].trim() : '';

  // Look for an image tag directly inside the description
  let questionImage = null;
  const imgInDesc = description.match(/<img[^>]*src="([^\"]+)"/i);
  if (imgInDesc) {
    questionImage = imgInDesc[1]; // will be the saved filename from mammoth conversion
  }

  // Extract options – list items
  const optionMatches = [...blockHtml.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
  const options = [];
  let answerIdx = 0; // default fallback
  optionMatches.forEach((m, idx) => {
    let optHtml = m[1]; // raw HTML inside <li>
    // Detect underline – <u> tags or style="text-decoration:underline"
    const isUnderlined = /<u>/i.test(optHtml) || /text-decoration:\s*underline/i.test(optHtml);
    // Strip HTML tags to get plain text for storage
    const text = optHtml.replace(/<[^>]+>/g, '').trim();

    // Detect an image inside the option
    let optImage = null;
    const imgMatch = optHtml.match(/<img[^>]*src="([^\"]+)"/i);
    if (imgMatch) {
      optImage = imgMatch[1]; // file name saved by mammoth
    }

    if (isUnderlined) {
      answerIdx = idx; // record correct answer index
    }

    options.push({ text, image: optImage || null });
  });

  return {
    mainHeading,
    description,
    image: questionImage,
    options,
    answer: answerIdx,
  };
}

/**
 * Main conversion function.
 * @param {string} docxPath Absolute path to the .docx file.
 * @param {string} examSetId UUID of the target ExamSet.
 */
async function convertDocx(docxPath, examSetId) {
  // Mammoth conversion – inline images are saved via the callback.
  const { value: html } = await mammoth.convertToHtml({ path: docxPath }, {
    convertImage: mammoth.images.inline(async (element) => {
      const base64 = await element.read('base64');
      const buffer = Buffer.from(base64, 'base64');
      const ext = element.contentType.split('/')[1]; // e.g., png, jpeg
      const fileName = await saveImage(buffer, ext);
      // Return the src attribute that mammoth will embed in the HTML
      return { src: fileName };
    }),
  });

  // Very naive split – assume each question starts with a <p> that begins with "[ "
  const rawBlocks = html.split(/(?=<p[^>]*>\s*\[)/i).filter(Boolean);

  const questions = [];
  let qIdx = 1;
  for (const block of rawBlocks) {
    const parsed = parseQuestionBlock(block);
    questions.push({
      qIndex: qIdx++,
      type: 'Reading',
      mainHeading: parsed.mainHeading,
      questionHeading: '',
      description: parsed.description,
      image: parsed.image,
      audio: null,
      options: parsed.options,
      answer: parsed.answer,
    });
  }

  const output = {
    examSetId,
    setName: path.basename(docxPath, path.extname(docxPath)),
    questions,
  };

  const outFile = path.join('scripts', `${output.setName}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log('✅  Import JSON created →', outFile);
}

// -----------------------------------------------------------------
// CLI usage
// -----------------------------------------------------------------
const [,, docxPath, examSetId] = process.argv;
if (!docxPath || !examSetId) {
  console.error('Usage: node scripts/import_from_docx.js <docxPath> <examSetId>');
  process.exit(1);
}
convertDocx(path.resolve(docxPath), examSetId).catch((e) => {
  console.error('❌  Conversion failed:', e);
  process.exit(1);
});
