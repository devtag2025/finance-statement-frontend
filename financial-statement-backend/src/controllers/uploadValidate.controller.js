const { fileTypeFromBuffer } = require('file-type');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const {
  MAX_PAGES,
  MAX_SIZE_BYTES,
  ALLOWED_MIME,
  ALLOWED_EXT,
} = require('../config/uploadConfig');

async function extractTextFromFile(file) {
  let pages = [];

  try {
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      if (!parsed.text) throw new Error('PDF parsing returned empty text');

      // Split PDF text into pages (form feed \f or double newlines heuristic)
      pages = parsed.text
        .split(/\f|\n\n/)
        .map((t, idx) => ({ page: idx + 1, text: t.trim() }))
        .filter((p) => p.text.length > 0);

    } else if (mimeType.startsWith('image/')) {
      // Run Tesseract OCR
      const { data } = await Tesseract.recognize(file.buffer, 'eng', {
        logger: (m) => console.log(m),
      });

      if (!data?.text) throw new Error('OCR failed to extract text');
      pages = [{ page: 1, text: data.text }];
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return pages;
  } catch (err) {
    console.error('extractTextFromFile error:', err);
    throw new Error(`Failed to extract text: ${err.message}`);
  }
}

exports.validateUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        ok: false,
        checks: { typeOk: false, sizeOk: false, pagesOk: false },
        warnings: [],
        reasons: ['NO_FILE'],
      });
    }

    // Size check
    if (file.size > MAX_SIZE_BYTES) {
      return res.status(422).json({
        ok: false,
        checks: { typeOk: true, sizeOk: false, pagesOk: true },
        warnings: [],
        reasons: ['FILE_TOO_LARGE'],
      });
    }

    // Type check using magic bytes
    let detectedMime = file.mimetype;
    let detectedExt = file.originalname.split('.').pop()?.toLowerCase();
    try {
      const ft = await fileTypeFromBuffer(file.buffer);
      if (ft) {
        detectedMime = ft.mime;
        detectedExt = ft.ext;
      }
    } catch (e) {
      console.warn('fileType detection failed:', e);
    }

    const typeOk = ALLOWED_MIME.has(detectedMime) && ALLOWED_EXT.has(detectedExt);
    if (!typeOk) {
      return res.status(422).json({
        ok: false,
        checks: { typeOk: false, sizeOk: true, pagesOk: true },
        warnings: [],
        reasons: ['UNSUPPORTED_TYPE'],
      });
    }

    // Extract text (PDF or OCR)
    let pages = [];
    try {
      pages = await extractTextFromFile(file);
    } catch (err) {
      return res.status(500).json({
        ok: false,
        checks: { typeOk, sizeOk: true, pagesOk: false },
        warnings: [],
        reasons: ['TEXT_EXTRACTION_FAILED', err.message],
      });
    }

    // Page count check
    const pagesOk = pages.length > 0 && pages.length <= MAX_PAGES;
    if (!pagesOk) {
      return res.status(422).json({
        ok: false,
        checks: { typeOk, sizeOk: true, pagesOk: false },
        warnings: pages.length === 0 ? ['NO_PAGES_DETECTED'] : ['PAGE_LIMIT_EXCEEDED'],
        reasons: ['PAGE_COUNT_INVALID'],
      });
    }

    // All good
    return res.json({
      ok: true,
      mime: detectedMime,
      ext: detectedExt,
      sizeBytes: file.size,
      pages,
      checks: { typeOk, sizeOk: true, pagesOk: true },
      warnings: [],
    });

  } catch (err) {
    console.error('validateUpload error:', err);
    return res.status(500).json({
      ok: false,
      checks: { typeOk: false, sizeOk: false, pagesOk: false },
      warnings: [],
      reasons: ['INTERNAL_ERROR', err.message],
    });
  }
};
