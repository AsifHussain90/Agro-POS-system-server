import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import ApiError from "../../utils/errorHandler.js";

export class S3StorageService {
  constructor() {
    this.region = process.env.AWS_REGION || "us-east-1";
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      endpoint: process.env.AWS_S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.AWS_S3_FORCE_PATH_STYLE),
    });
  }

  /**
   * Upload file to AWS S3 bucket
   */
  async uploadFile({ file, folder = "uploads", customFilename }) {
    if (!file || !file.buffer) {
      throw new ApiError(400, "File buffer is required for S3 upload");
    }

    if (!this.bucketName) {
      throw new ApiError(
        500,
        "AWS S3 configuration missing. Please set AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
      );
    }

    const fileExtension = file.originalname.split(".").pop();
    const randomHash = crypto.randomBytes(8).toString("hex");
    const key = customFilename
      ? `${folder}/${customFilename}`
      : `${folder}/${Date.now()}-${randomHash}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      const url = process.env.AWS_S3_ENDPOINT
        ? `${process.env.AWS_S3_ENDPOINT}/${this.bucketName}/${key}`
        : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        url,
        publicId: key,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        provider: "s3",
      };
    } catch (error) {
      throw new ApiError(500, `S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from AWS S3 bucket
   */
  async deleteFile(publicId) {
    if (!publicId) {
      throw new ApiError(400, "File key (publicId) is required for S3 deletion");
    }

    if (!this.bucketName) {
      throw new ApiError(500, "AWS S3 bucket configuration missing.");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: publicId,
    });

    try {
      await this.s3Client.send(command);
      return {
        success: true,
        publicId,
        provider: "s3",
      };
    } catch (error) {
      throw new ApiError(500, `S3 file deletion failed: ${error.message}`);
    }
  }
}
