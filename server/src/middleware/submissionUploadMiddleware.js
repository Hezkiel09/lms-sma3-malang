import path from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES = 2; // Koreksi guru biasanya 1 file
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.zip',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.jpg',
  '.jpeg',
  '.png',
  '.txt',
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain',
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

function validateFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = (file.mimetype || 'application/octet-stream').toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new UploadError(
      `Format file ${file.originalname} tidak didukung. Gunakan PDF, DOC, DOCX, ZIP, PPT, PPTX, XLS, XLSX, JPG, JPEG, PNG, atau TXT.`
    );
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new UploadError(`Tipe file ${file.originalname} tidak diizinkan.`);
  }
}

function readRequestBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > 25 * 1024 * 1024) {
        reject(new UploadError('Ukuran request melebihi batas maksimal.', 413));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(new UploadError(`Gagal membaca stream request: ${err.message}`, 400)));
  });
}

function parseMultipart(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);
  const body = {};
  const files = [];

  let cursor = 0;
  const headerDelimiter = Buffer.from('\r\n\r\n');
  const lineDelimiter = Buffer.from('\r\n');

  while (cursor < buffer.length) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, cursor);
    if (boundaryIndex === -1) break;

    if (buffer.subarray(boundaryIndex, boundaryIndex + endBoundaryBuffer.length).equals(endBoundaryBuffer)) {
      break;
    }

    const partStart = boundaryIndex + boundaryBuffer.length + 2; // lewati \r\n
    const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, partStart);
    if (nextBoundaryIndex === -1) break;

    const partEnd = nextBoundaryIndex - 2; // sebelum \r\n boundary berikutnya
    const part = buffer.subarray(partStart, partEnd);

    const headerEndIndex = part.indexOf(headerDelimiter);
    if (headerEndIndex === -1) {
      cursor = nextBoundaryIndex;
      continue;
    }

    const rawHeaders = part.subarray(0, headerEndIndex).toString('utf8');
    const content = part.subarray(headerEndIndex + headerDelimiter.length);

    const headers = {};
    for (const line of rawHeaders.split('\r\n')) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        headers[line.substring(0, colonIndex).trim().toLowerCase()] = line.substring(colonIndex + 1).trim();
      }
    }

    const disposition = parseDisposition(headers['content-disposition'] || '');
    const fieldName = disposition.name;

    if (fieldName) {
      if (disposition.filename !== undefined && disposition.filename !== '') {
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

    cursor = nextBoundaryIndex;
  }

  return { body, files };
}

/**
 * Middleware untuk memproses penilaian tugas dengan opsi upload file koreksi.
 * Mendukung JSON payload dan multipart/form-data.
 */
export const parseSubmissionUpload = async (req, res, next) => {
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
      message: error.message || 'Gagal membaca data pengunggahan file koreksi.',
    });
  }
};
