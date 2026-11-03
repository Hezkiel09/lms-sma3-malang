import path from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Sesuai batas pada UI: 10 MB per file.
const MAX_FILES = 5;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE * MAX_FILES + 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream',
]);

class UploadError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parseDisposition(value = '') {
  const result = {};
  for (const match of value.matchAll(/(?:^|;)\s*([\w-]+)=(?:"((?:\\.|[^"])*)"|([^;]*))/g)) {
    const key = match[1].toLowerCase();
    result[key] = (match[2] ?? match[3] ?? '').replace(/\\(.)/g, '$1');
  }
  return result;
}

function hasExpectedSignature(extension, buffer) {
  if (extension === '.pdf') {
    return buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'));
  }

  // DOC/PPT lama menggunakan format OLE Compound File.
  const oleSignature = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (extension === '.doc' || extension === '.ppt') {
    return buffer.subarray(0, 8).equals(oleSignature);
  }

  // DOCX, PPTX, dan ZIP menggunakan kontainer ZIP.
  if (['.docx', '.pptx', '.zip'].includes(extension)) {
    const signature = buffer.subarray(0, 4);
    return signature.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
      || signature.equals(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
      || signature.equals(Buffer.from([0x50, 0x4b, 0x07, 0x08]));
  }

  return false;
}

function validateFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = (file.mimetype || 'application/octet-stream').toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new UploadError(`Format file ${file.originalname} tidak didukung. Gunakan PDF, DOC, DOCX, ZIP, PPT, atau PPTX.`);
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new UploadError(`Tipe file ${file.originalname} tidak diizinkan.`);
  }

  if (!file.buffer.length || !hasExpectedSignature(extension, file.buffer)) {
    throw new UploadError(`Isi file ${file.originalname} tidak sesuai dengan ekstensi file.`);
  }
}

async function readRequestBuffer(req) {
  const chunks = [];
  let totalSize = 0;

  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > MAX_REQUEST_SIZE) {
      throw new UploadError('Ukuran total upload terlalu besar. Maksimal 5 file, masing-masing 10 MB.', 413);
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks, totalSize);
}

function parseMultipart(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const separator = Buffer.from('\r\n\r\n');
  const nextBoundary = Buffer.from(`\r\n--${boundary}`);
  const body = {};
  const files = [];

  let cursor = buffer.indexOf(boundaryBuffer);
  if (cursor < 0) throw new UploadError('Format multipart tidak valid.');

  cursor += boundaryBuffer.length;

  while (cursor < buffer.length) {
    // Boundary penutup.
    if (buffer.subarray(cursor, cursor + 2).equals(Buffer.from('--'))) break;
    if (buffer.subarray(cursor, cursor + 2).equals(Buffer.from('\r\n'))) cursor += 2;

    const headerEnd = buffer.indexOf(separator, cursor);
    if (headerEnd < 0) throw new UploadError('Header bagian multipart tidak valid.');

    const headerText = buffer.subarray(cursor, headerEnd).toString('utf8');
    const headers = {};
    for (const line of headerText.split('\r\n')) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        headers[line.slice(0, colonIndex).trim().toLowerCase()] = line.slice(colonIndex + 1).trim();
      }
    }

    const contentStart = headerEnd + separator.length;
    const boundaryIndex = buffer.indexOf(nextBoundary, contentStart);
    if (boundaryIndex < 0) throw new UploadError('Penutup bagian multipart tidak ditemukan.');

    const content = buffer.subarray(contentStart, boundaryIndex);
    const disposition = parseDisposition(headers['content-disposition']);
    const fieldName = disposition.name;

    if (fieldName) {
      if (disposition.filename !== undefined && disposition.filename !== '') {
        if (fieldName !== 'files') {
          throw new UploadError('Nama field file harus menggunakan "files".');
        }

        const file = {
          fieldname: fieldName,
          originalname: path.basename(disposition.filename.replace(/\\/g, '/')),
          encoding: '7bit',
          mimetype: (headers['content-type'] || 'application/octet-stream').split(';')[0].trim(),
          size: content.length,
          buffer: Buffer.from(content),
        };

        if (file.size > MAX_FILE_SIZE) {
          throw new UploadError(`File ${file.originalname} melebihi batas 10 MB.`, 413);
        }
        validateFile(file);
        files.push(file);
        if (files.length > MAX_FILES) {
          throw new UploadError(`Maksimal ${MAX_FILES} file dapat diunggah sekaligus.`, 413);
        }
      } else {
        const value = content.toString('utf8');
        if (Object.hasOwn(body, fieldName)) {
          body[fieldName] = Array.isArray(body[fieldName])
            ? [...body[fieldName], value]
            : [body[fieldName], value];
        } else {
          body[fieldName] = value;
        }
      }
    }

    cursor = boundaryIndex + 2 + boundaryBuffer.length;
  }

  return { body, files };
}

/**
 * Parser multipart/form-data khusus endpoint materi.
 * Tidak memerlukan dependency upload tambahan; file ditahan di memory dengan batas ukuran.
 * Field file dikirim berulang menggunakan nama "files".
 */
export const parseMaterialUpload = async (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    req.body = req.body || {};
    req.files = [];
    return next();
  }

  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    const boundary = (boundaryMatch?.[1] || boundaryMatch?.[2] || '').trim();

    if (!boundary) throw new UploadError('Boundary multipart tidak ditemukan.');

    const buffer = await readRequestBuffer(req);
    const parsed = parseMultipart(buffer, boundary);
    req.body = parsed.body;
    req.files = parsed.files;
    return next();
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Gagal membaca data upload.',
    });
  }
};
