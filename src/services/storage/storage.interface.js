/*
 * storage.interface.js
 *
 * This application uses Cloudinary exclusively for all image storage.
 * Local and S3 providers have been removed to prevent accidental local writes.
 *
 * Import `cloudinaryService` wherever you need to upload, update, or delete images.
 */

export { cloudinaryService } from "./cloudinary.service.js";
