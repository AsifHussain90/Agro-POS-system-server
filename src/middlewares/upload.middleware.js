import multer from 'multer';
import ApiError from '../utils/errorHandler.js';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../validators/upload.validator.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported file format: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      ),
      false
    );
  }
};

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

const handleMulterError = (err, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size limit exceeded (Max 5 MB)'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        new ApiError(400, `Unexpected upload field name: ${err.field}`)
      );
    }
    return next(new ApiError(400, `File upload error: ${err.message}`));
  }
  return next(err);
};

export const uploadSingle =
  (fieldName = 'file') =>
  (req, res, next) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) return handleMulterError(err, next);
      next();
    });
  };

export const uploadArray =
  (fieldName = 'files', maxCount = 5) =>
  (req, res, next) => {
    multerUpload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) return handleMulterError(err, next);
      next();
    });
  };

export const uploadFields = (fields) => (req, res, next) => {
  multerUpload.fields(fields)(req, res, (err) => {
    if (err) return handleMulterError(err, next);
    next();
  });
};
