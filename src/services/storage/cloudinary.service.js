import { v2 as cloudinary } from 'cloudinary';
import ApiError from '../../utils/errorHandler.js';

class CloudinaryStorageService {
  constructor() {
    this._configured = false;
  }

  _assertConfig() {
    if (this._configured) return;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ApiError(
        500,
        'Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      );
    }

    if (/\s/.test(cloudName)) {
      throw new ApiError(
        500,
        'Invalid CLOUDINARY_CLOUD_NAME: must not contain spaces.'
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    this._configured = true;
  }

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
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(500, `Cloudinary upload failed: ${error.message}`)
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async updateFile({ file, oldPublicId, folder = 'avatars' }) {
    const uploadResult = await this.uploadFile({ file, folder });

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' });
      } catch (err) {
        console.warn(`[Cloudinary] Failed to delete old image "${oldPublicId}": ${err.message}`);
      }
    }

    return uploadResult;
  }

  async deleteFile(publicId) {
    this._assertConfig();
    if (!publicId || typeof publicId !== 'string') {
      throw new ApiError(400, 'A valid Cloudinary publicId is required for deletion.');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

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

export const cloudinaryService = new CloudinaryStorageService();