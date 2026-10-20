/**
 * EPS-TOPIK PDF Question Parser
 *
 * Rules implemented per specifications:
 * 1. "each question take from qno 1": Scans questions starting from Q1 up to Q40.
 * 2. "take previous question heading till not getting next question heading":
 *    Inherits the active heading across question groups (e.g. [1~2] applies to Q1 and Q2;
 *    when [3~4] is encountered, Q3 and Q4 receive [3~4], etc.).
 * 3. "if their picture in question then keep picture in description":
 *    Attaches question-level visual to `image` (rendered in the description section).
 * 4. "option started with 1 in circle keep this in option 1 such as 2,3,4 pt on option":
 *    Extracts circled numbers ① (U+2460), ② (U+2461), ③ (U+2462), ④ (U+2463) into options 1 to 4.
 * 5. "if their is any image then keep image according to options":
 *    If 4 option images exist, maps them to options[0..3].image.
 * 6. "and if their in listening then keep empty question and options":
 *    For Listening (Q21 to Q40), description and options are kept empty.
 *
 * Zero raw emojis used anywhere.
 */

// Korean Heading Presets fallback
export const KOREAN_HEADING_PRESETS = [
  { range: [1, 2], text: "[1~2] 다음 내용과 관계있는 그림을 고르십시오." },
  { range: [3, 4], text: "[3~4] 다음 질문에 답하십시오." },
  { range: [5, 8], text: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오." },
  { range: [9, 12], text: "[9~12] 다음 질문에 답하십시오." },
  { range: [13, 14], text: "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오." },
  { range: [15, 16], text: "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오." },
  { range: [17, 18], text: "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오." },
  { range: [19, 20], text: "[19~20] 무엇에 대한 설명입니까?" },
  { range: [21, 22], text: "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오." },
  { range: [23, 24], text: "[23~24] 들은 것을 고르십시오." },
  { range: [25, 29], text: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오." },
  { range: [30, 33], text: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오." },
  { range: [34, 35], text: "[34~35] 다음을 듣고 이어지는 말을 고르십시오." },
  { range: [36, 40], text: "[36~40] 다음을 듣고 알맞은 것을 고르십시오." }
];

export function getDefaultHeadingForQ(num) {
  const match = KOREAN_HEADING_PRESETS.find(p => num >= p.range[0] && num <= p.range[1]);
  if (match) return match.text;
  return num <= 20
    ? `[ ${num} ] 다음을 읽고 알맞은 것을 고르십시오.`
    : `[ ${num} ] 이야기를 듣고 알맞은 것을 고르십시오.`;
}

/**
 * Loads the browser PDF.js library asynchronously from public/pdf.min.js
 */
export async function getPdfJs() {
  if (typeof window === "undefined") return null;

  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    }
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-pdfjs='true']");
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("pdfjsLib not defined"));
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "/pdf.min.js";
    script.setAttribute("data-pdfjs", "true");
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not defined after script load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load /pdf.min.js"));
    document.head.appendChild(script);
  });
}

/**
 * Convert PDF.js image object into PNG Data URL using native canvas
 */
export function convertPdfImageToDataUrl(img) {
  try {
    if (!img) return null;
    if (typeof img.src === "string" && img.src.startsWith("data:")) return img.src;

    const width = img.width;
    const height = img.height;
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (img instanceof ImageBitmap || img instanceof HTMLImageElement || img instanceof HTMLCanvasElement) {
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL("image/png");
    }

    if (img.data) {
      const imgData = ctx.createImageData(width, height);
      const src = img.data;
      const len = width * height;

      if (src.length === len * 3) {
        // RGB buffer (24-bit)
        let s = 0;
        let d = 0;
        for (let i = 0; i < len; i++) {
          imgData.data[d] = src[s];
          imgData.data[d + 1] = src[s + 1];
          imgData.data[d + 2] = src[s + 2];
          imgData.data[d + 3] = 255;
          s += 3;
          d += 4;
        }
      } else if (src.length === len * 4) {
        // RGBA buffer (32-bit)
        imgData.data.set(src);
      } else if (src.length === len) {
        // Grayscale (8-bit)
        let s = 0;
        let d = 0;
        for (let i = 0; i < len; i++) {
          const val = src[s];
          imgData.data[d] = val;
          imgData.data[d + 1] = val;
          imgData.data[d + 2] = val;
          imgData.data[d + 3] = 255;
          s += 1;
          d += 4;
        }
      } else {
        return null;
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL("image/png");
    }
  } catch (err) {
    console.warn("Failed to convert PDF image:", err);
  }
  return null;
}

/**
 * Extracts lines of text from PDF page text items, respecting columns and reading order
 */
export function extractStructuredLinesFromPage(items, viewport) {
  if (!items || items.length === 0) return [];

  // Convert PDF coords to viewport coords (top-down)
  const mapped = items.map(item => {
    const x = item.transform[4];
    const y = item.transform[5];
    const vpPoint = viewport.convertToViewportPoint(x, y);
    return {
      str: item.str || "",
      x: vpPoint[0],
      y: vpPoint[1],
      width: item.width || 0,
      height: item.height || 0
    };
  }).filter(it => it.str.trim().length > 0);

  const pageWidth = viewport.width;
  const mid = pageWidth / 2;

  // Detect 2-column layout (standard in Korean exam papers)
  const leftCol = mapped.filter(it => it.x < mid - 25);
  const rightCol = mapped.filter(it => it.x > mid + 25);
  const isTwoColumn = leftCol.length >= 8 && rightCol.length >= 8;

  function sortAndGroup(colItems) {
    const sorted = [...colItems].sort((a, b) => {
      // Allow 4px vertical tolerance for lines
      if (Math.abs(a.y - b.y) <= 4) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    const lines = [];
    let currentLine = [];
    let currentY = null;

    for (const it of sorted) {
      if (currentY === null || Math.abs(it.y - currentY) <= 4) {
        currentLine.push(it);
        currentY = it.y;
      } else {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push({
          text: currentLine.map(t => t.str).join(" ").trim(),
          y: currentY,
          x: currentLine[0].x,
          items: currentLine
        });
        currentLine = [it];
        currentY = it.y;
      }
    }

    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.x - b.x);
      lines.push({
        text: currentLine.map(t => t.str).join(" ").trim(),
        y: currentY,
        x: currentLine[0].x,
        items: currentLine
      });
    }

    return lines;
  }

  if (isTwoColumn) {
    const leftLines = sortAndGroup(leftCol);
    const rightLines = sortAndGroup(rightCol);
    return [...leftLines, ...rightLines];
  } else {
    return sortAndGroup(mapped);
  }
}

/**
 * Parse full EPS-TOPIK PDF file into 40 structured questions and visual pages
 */
export async function parsePdfQuestions(fileOrBuffer, options = {}, onProgress = null) {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("PDF.js library is not available.");

  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer instanceof Blob || fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error("Invalid input: Expected File, Blob, or ArrayBuffer.");
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pagesData = [];
  const allExtractedImages = [];
  const allStructuredLines = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({
        stage: "pages",
        current: pageNum,
        total: numPages,
        message: `Processing PDF page ${pageNum} of ${numPages}...`
      });
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    // 1. Render Page to Canvas for visual review & snapshots
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const pageDataUrl = canvas.toDataURL("image/png");

    // 2. Extract Text
    const textContent = await page.getTextContent();
    const lines = extractStructuredLinesFromPage(textContent.items, viewport);

    // 3. Extract Embedded Images via Operator List
    const pageImages = [];
    try {
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        if (fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintInlineImageXObject) {
          const imgName = ops.argsArray[i][0];
          // Get Image Object
          await new Promise((resolve) => {
            page.objs.get(imgName, (imgObj) => {
              if (imgObj) {
                const dataUrl = convertPdfImageToDataUrl(imgObj);
                if (dataUrl) {
                  const imgItem = {
                    id: `img_p${pageNum}_${pageImages.length + 1}`,
                    pageNum,
                    name: imgName,
                    width: imgObj.width,
                    height: imgObj.height,
                    dataUrl
                  };
                  pageImages.push(imgItem);
                  allExtractedImages.push(imgItem);
                }
              }
              resolve();
            });
            // Fallback timeout in case objs.get does not call back
            setTimeout(resolve, 80);
          });
        }
      }
    } catch (err) {
      console.warn(`Image extraction notice on page ${pageNum}:`, err);
    }

    pagesData.push({
      pageNum,
      width: viewport.width,
      height: viewport.height,
      pageDataUrl,
      lines,
      images: pageImages
    });

    lines.forEach(l => {
      allStructuredLines.push({
        ...l,
        pageNum
      });
    });
  }

  if (onProgress) {
    onProgress({
      stage: "parsing",
      current: 40,
      total: 40,
      message: "Parsing EPS-TOPIK Korean questions (Q1 to Q40)..."
    });
  }

  // Parse questions according to user instructions
  const questions = buildQuestionsFromExtractedLines(allStructuredLines, pagesData, allExtractedImages, options);

  return {
    questions,
    pages: pagesData,
    extractedImages: allExtractedImages,
    numPages
  };
}

/**
 * Builds the 40 questions following all user rules:
 * - Starting from Q1
 * - Inheriting previous heading until next heading
 * - Placing question pictures in description / image
 * - Mapping circled digits ①, ②, ③, ④ into options 1, 2, 3, 4
 * - Associating option images
 * - Keeping listening (Q21-Q40) description and options empty
 */
function buildQuestionsFromExtractedLines(allLines, pagesData, allExtractedImages, options = {}) {
  const targetPackage = options.package || "Full Set UBT";
  const targetSet = options.set || "UBT SET 01";

  // Regex for group headings:
  // Examples: [1~2] 다음 내용과 관계있는 그림을 고르십시오., [3~4] 다음 질문에 답하십시오., etc.
  const headingRegex = /^(\[|【|\(|)\s*(\d{1,2})\s*[~～\-]\s*(\d{1,2})\s*(\]|】|\)|)\s*(.+)/;
  // Fallback heading pattern matching Korean directions
  const generalHeadingRegex = /^(다음\s*(내용과|그림을|질문에|글을|빈칸에|표지는|을\s*듣고|대화를|설명에).*고르십시오|답하십시오|무엇입니까)/;

  // Regex for question start:
  // Matches: "1.", "1 .", "[1]", "(1)", "1번", "1)", "Q1."
  const qStartRegex = /^(?:\[|\(|\bQ\.?|)?\s*(\d{1,2})\s*(?:\.|\)|\]|\번)\s*(.*)/;

  let currentHeading = "[1~2] 다음 내용과 관계있는 그림을 고르십시오.";

  // Track raw question blocks by question number (1 to 40)
  const qBlocks = {};
  for (let i = 1; i <= 40; i++) {
    qBlocks[i] = {
      qNum: i,
      mainHeading: getDefaultHeadingForQ(i),
      lines: [],
      startLineIndex: -1,
      pageNum: 1
    };
  }

  let activeQNum = null;

  for (let idx = 0; idx < allLines.length; idx++) {
    const lineObj = allLines[idx];
    const text = lineObj.text.trim();
    if (!text) continue;

    // 1. Check if line is a group heading
    const headingMatch = text.match(headingRegex);
    if (headingMatch) {
      currentHeading = text;
      continue;
    }

    if (generalHeadingRegex.test(text) && (text.length > 10 || text.includes("고르십시오") || text.includes("답하십시오"))) {
      currentHeading = text;
      continue;
    }

    // 2. Check if line starts a question number (Q1 to Q40)
    const qMatch = text.match(qStartRegex);
    if (qMatch) {
      const parsedNum = parseInt(qMatch[1], 10);
      if (parsedNum >= 1 && parsedNum <= 40) {
        // If question number is valid and in sequence or acceptable jump
        activeQNum = parsedNum;
        qBlocks[activeQNum].startLineIndex = idx;
        qBlocks[activeQNum].pageNum = lineObj.pageNum;
        // User rule: "here take pervous quuestion heading till not getting next quuestion heading"
        qBlocks[activeQNum].mainHeading = currentHeading;

        const remainder = (qMatch[2] || "").trim();
        if (remainder) {
          qBlocks[activeQNum].lines.push(remainder);
        }
        continue;
      }
    }

    // 3. Accumulate lines into currently active question
    if (activeQNum !== null && qBlocks[activeQNum]) {
      qBlocks[activeQNum].lines.push(text);
    }
  }

  // Now assemble all 40 questions
  const finalQuestions = [];

  for (let qNum = 1; qNum <= 40; qNum++) {
    const block = qBlocks[qNum];
    const isListening = qNum >= 21;
    const qType = isListening ? "Listening" : "Reading";

    // Heading inheritance fallback check
    const mainHeading = block.mainHeading || getDefaultHeadingForQ(qNum);

    // Default structure
    const questionObj = {
      id: Date.now() + qNum,
      package: targetPackage,
      set: targetSet,
      qIndex: qNum,
      questionHeading: String(qNum),
      type: qType,
      mainHeading,
      description: "",
      image: "",
      audio: "",
      options: [
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" }
      ],
      answer: 0
    };

    // USER RULE: "and if their in listening then keep empty quuestion and options"
    if (isListening) {
      // Keep question description and options empty
      questionObj.description = "";
      questionObj.options = [
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" },
        { text: "", audio: "", image: "", video: "" }
      ];
      finalQuestions.push(questionObj);
      continue;
    }

    // READING QUESTIONS (1 to 20): Parse description, circled options, and images
    const rawContent = block.lines.join("\n");

    // Circled digits pattern: ① (0x2460), ② (0x2461), ③ (0x2462), ④ (0x2463)
    // Also support filled circled digits: ❶ ❷ ❸ ❹ or (1) (2) (3) (4)
    const hasCircledDigits = /[①②③④❶❷❸❹]/.test(rawContent);

    if (hasCircledDigits) {
      // Find where options start
      const firstOptMatch = rawContent.search(/[①❶]/);
      if (firstOptMatch !== -1) {
        questionObj.description = rawContent.substring(0, firstOptMatch).trim();
        const optionsBody = rawContent.substring(firstOptMatch);

        // USER RULE: "option strted with 1 in circle keep this in option 1 such as 2,3,4 pt on option"
        const opt1 = extractOptionBetween(optionsBody, /[①❶]/, /[②❷]/);
        const opt2 = extractOptionBetween(optionsBody, /[②❷]/, /[③❸]/);
        const opt3 = extractOptionBetween(optionsBody, /[③❸]/, /[④❹]/);
        const opt4 = extractOptionAfter(optionsBody, /[④❹]/);

        questionObj.options[0].text = cleanOptionString(opt1);
        questionObj.options[1].text = cleanOptionString(opt2);
        questionObj.options[2].text = cleanOptionString(opt3);
        questionObj.options[3].text = cleanOptionString(opt4);
      } else {
        questionObj.description = rawContent.trim();
      }
    } else {
      // Check for parenthesized options (1) (2) (3) (4) or 1) 2) 3) 4)
      const hasParenDigits = /\(1\)/.test(rawContent);
      if (hasParenDigits) {
        const firstOptMatch = rawContent.search(/\(1\)/);
        questionObj.description = rawContent.substring(0, firstOptMatch).trim();
        const optionsBody = rawContent.substring(firstOptMatch);

        questionObj.options[0].text = cleanOptionString(extractOptionBetween(optionsBody, /\(1\)/, /\(2\)/));
        questionObj.options[1].text = cleanOptionString(extractOptionBetween(optionsBody, /\(2\)/, /\(3\)/));
        questionObj.options[2].text = cleanOptionString(extractOptionBetween(optionsBody, /\(3\)/, /\(4\)/));
        questionObj.options[3].text = cleanOptionString(extractOptionAfter(optionsBody, /\(4\)/));
      } else {
        // Fallback: entire content is description
        questionObj.description = rawContent.trim();
      }
    }

    // USER RULE: "and if their picture in question then keep picture in description"
    // USER RULE: "if their is any image then keep image acording to options"
    // Associate extracted images on this question's page
    const pageObj = pagesData.find(p => p.pageNum === block.pageNum);
    if (pageObj && pageObj.images && pageObj.images.length > 0) {
      // If exactly 1 image exists on the page corresponding to this question:
      // In EPS-TOPIK exams, questions 1~2 or 9~12 often have 1 illustration / sign per question
      if (pageObj.images.length === 1 && !questionObj.image) {
        questionObj.image = pageObj.images[0].dataUrl;
      } else if (pageObj.images.length === 4) {
        // If 4 images are on the page (e.g. 4 picture options for Q1 or Q2):
        // Assign to options[0..3].image
        questionObj.options[0].image = pageObj.images[0].dataUrl;
        questionObj.options[1].image = pageObj.images[1].dataUrl;
        questionObj.options[2].image = pageObj.images[2].dataUrl;
        questionObj.options[3].image = pageObj.images[3].dataUrl;
      }
    }

    finalQuestions.push(questionObj);
  }

  return finalQuestions;
}

function extractOptionBetween(text, startRegex, endRegex) {
  const startMatch = text.search(startRegex);
  if (startMatch === -1) return "";
  const sub = text.substring(startMatch);
  const endMatch = sub.search(endRegex);
  if (endMatch === -1) {
    return sub.replace(startRegex, "").trim();
  }
  return sub.substring(0, endMatch).replace(startRegex, "").trim();
}

function extractOptionAfter(text, startRegex) {
  const startMatch = text.search(startRegex);
  if (startMatch === -1) return "";
  return text.substring(startMatch).replace(startRegex, "").trim();
}

function cleanOptionString(str) {
  if (!str) return "";
  return str
    .replace(/^[①②③④❶❷❸❹\(\)\d\.\s]+/, "")
    .replace(/[\n\r]+/g, " ")
    .trim();
}
