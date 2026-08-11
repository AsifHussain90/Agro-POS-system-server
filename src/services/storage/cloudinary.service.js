/*
 * cloudinary.service.js
 *
 * Singleton Cloudinary storage service.
 * Handles upload, update (replace), and deletion of images exclusively on Cloudinary.
 * No files are ever written to the local filesystem.
 */

import { v2 as cloudinary } from 'cloudinary';
import ApiError from '../../utils/errorHandler.js';

class CloudinaryStorageService {
  constructor() {
    // Config is applied eagerly but with whatever values exist at load time.
    // Validation is deferred to first actual usage (see _assertConfig) so the
    // singleton can be created before dotenv.config() has run in server.js.
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });
  }

  /** Re-apply config and assert all required env vars are present. */
  _assertConfig() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

    if (
      !cloudName ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new ApiError(
        500,
        'Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
      );
    }

    if (/\s/.test(cloudName)) {
      throw new ApiError(
        500,
        'Invalid CLOUDINARY_CLOUD_NAME: must not contain spaces. Copy the "Cloud name" from Cloudinary Dashboard → Product environment credentials (e.g. "dxyz123abc"), not the project title.'
      );
    }
  }

  /**
   * Upload a file buffer directly to Cloudinary.
   *
   * @param {object} options
   * @param {Express.Multer.File} options.file  - Multer file object (memoryStorage)
   * @param {string}  [options.folder="avatars"] - Cloudinary folder
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  async uploadFile({ file, folder = 'avatars' }) {
    this._assertConfig();
    if (!file?.buffer) {
      throw new ApiError(400, 'File buffer is required for Cloudinary upload.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Automatically optimize the image on Cloudinary
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(500, `Cloudinary upload failed: ${error.message}`)
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Replace an existing Cloudinary image with a new upload.
   * Uploads the new image first; only deletes the old one on success,
   * preventing orphaned images when the upload fails.
   *
   * @param {object} options
   * @param {Express.Multer.File} options.file      - New file to upload
   * @param {string}  [options.oldPublicId]          - Cloudinary publicId of the image to replace
   * @param {string}  [options.folder="avatars"]     - Cloudinary folder for the new upload
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  async updateFile({ file, oldPublicId, folder = 'avatars' }) {
    // 1. Upload the new image first
    const uploadResult = await this.uploadFile({ file, folder });

    // 2. Delete the old image only after the new upload succeeds
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: 'image',
        });
      } catch (err) {
        // Log the warning but do NOT fail the request — the new image is already up
        console.warn(
          `[Cloudinary] Warning: failed to delete old image "${oldPublicId}": ${err.message}`
        );
      }
    }

    return uploadResult;
  }

  /**
   *
   * Delete an image from Cloudinary by its public ID.
   *
   * @param {string} publicId - Cloudinary public ID of the image to delete
   * @returns {Promise<{ success: boolean, publicId: string }>}
   */
  async deleteFile(publicId) {
    this._assertConfig();
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError(
        400,
        'A valid Cloudinary publicId is required for deletion.'
      );
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new ApiError(500, `Cloudinary deletion failed: ${result.result}`);
      }

      return { success: true, publicId };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Cloudinary deletion failed: ${error.message}`);
    }
  }
}

// Export a single shared instance — Cloudinary is the ONLY storage provider
export const cloudinaryService = new CloudinaryStorageService();
