/*
 * upload.validator.js
 *
 * Validation rules for image uploads.
 * Only image MIME types are permitted — documents (PDF, Word) are not accepted
 * by the profile image endpoint.
 */

import { z } from 'zod';

// ── Allowed MIME types ────────────────────────────────────────────────────────
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Keep the old export name so the upload middleware doesn't break
export const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;

// ── File size ─────────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Zod schema for upload options ─────────────────────────────────────────────
export const uploadOptionsSchema = z.object({
  folder: z.string().trim().min(1).max(100).optional().default('avatars'),
  allowedTypes: z
    .array(z.string())
    .optional()
    .default(ALLOWED_IMAGE_MIME_TYPES),
  maxSize: z.number().positive().optional().default(MAX_FILE_SIZE_BYTES),
});

/**
 * Validate that a multer file object has an accepted MIME type and is within
 * the size limit.  Throws a plain Error (caught by asyncHandler → errorHandler)
 * on failure.
 *
 * @param {Express.Multer.File} file
 * @param {object} [options]
 */
export const validateImageFile = (file, options = {}) => {
  const { allowedTypes, maxSize } = uploadOptionsSchema.parse(options);

  if (!file) throw new Error('No file provided.');

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type: "${file.mimetype}". Accepted types: ${allowedTypes.join(', ')}.`
    );
  }

  if (file.size > maxSize) {
    const limitMb = (maxSize / (1024 * 1024)).toFixed(0);
    throw new Error(`File exceeds the ${limitMb} MB size limit.`);
  }

  return true;
};

// Backwards-compatible alias used by upload.middleware.js
export const validateFileMetadata = validateImageFile;
