import { Storage } from '@google-cloud/storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from './logger.js';
import config from '../config.js';
import { validate } from './validation.js';

class FileUpload {
  constructor() {
    // Initialize storage clients based on configuration
    if (config.storage.google) {
      this.gcs = new Storage({
        projectId: config.storage.google.projectId,
        keyFilename: config.storage.google.keyFile,
      });
      this.gcsBucket = this.gcs.bucket(config.storage.google.bucket);
    }

    if (config.storage.aws) {
      this.s3 = new S3Client({
        region: config.storage.aws.region,
        credentials: {
          accessKeyId: config.storage.aws.accessKeyId,
          secretAccessKey: config.storage.aws.secretAccessKey,
        },
      });
      this.s3Bucket = config.storage.aws.bucket;
    }
  }

  // Upload file to storage
  async upload(file, options = {}) {
    try {
      // Validate file
      if (!file || !file.buffer) {
        throw new Error('Invalid file');
      }

      // Set default options
      const {
        provider = 'google', // or 'aws'
        folder = 'uploads',
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxSize = 5 * 1024 * 1024, // 5MB
        generateThumbnail = false,
      } = options;

      // Validate file type and size
      if (!validate.validateFileType(file, allowedTypes)) {
        throw new Error('Invalid file type');
      }

      if (!validate.validateFileSize(file, maxSize)) {
        throw new Error('File size exceeds limit');
      }

      // Generate unique filename
      const filename = this.generateFilename(file.originalname);
      const path = `${folder}/${filename}`;

      // Upload based on provider
      let url;
      if (provider === 'google' && this.gcs) {
        url = await this.uploadToGCS(file.buffer, path, file.mimetype);
      } else if (provider === 'aws' && this.s3) {
        url = await this.uploadToS3(file.buffer, path, file.mimetype);
      } else {
        throw new Error('Storage provider not configured');
      }

      // Generate thumbnail if requested
      let thumbnailUrl;
      if (generateThumbnail && file.mimetype.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(file.buffer, path);
      }

      logger.info('File uploaded successfully', {
        filename,
        path,
        size: file.size,
        type: file.mimetype,
      });

      return {
        url,
        thumbnailUrl,
        filename,
        path,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      logger.error('File upload error:', error);
      throw error;
    }
  }

  // Upload to Google Cloud Storage
  async uploadToGCS(buffer, path, contentType) {
    try {
      const file = this.gcsBucket.file(path);

      await file.save(buffer, {
        metadata: {
          contentType,
        },
        resumable: false,
      });

      // Make file publicly accessible
      await file.makePublic();

      return `https://storage.googleapis.com/${this.gcsBucket.name}/${path}`;
    } catch (error) {
      logger.error('GCS upload error:', error);
      throw error;
    }
  }

  // Upload to AWS S3
  async uploadToS3(buffer, path, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: path,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      });

      await this.s3.send(command);

      return `https://${this.s3Bucket}.s3.amazonaws.com/${path}`;
    } catch (error) {
      logger.error('S3 upload error:', error);
      throw error;
    }
  }

  // Generate thumbnail
  async generateThumbnail(buffer, originalPath) {
    try {
      const sharp = await import('sharp');
      const thumbnailBuffer = await sharp
        .default(buffer)
        .resize(200, 200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1');

      // Upload thumbnail to the same provider as the original
      if (this.gcs) {
        return await this.uploadToGCS(thumbnailBuffer, thumbnailPath, 'image/jpeg');
      } else if (this.s3) {
        return await this.uploadToS3(thumbnailBuffer, thumbnailPath, 'image/jpeg');
      }

      return null;
    } catch (error) {
      logger.error('Thumbnail generation error:', error);
      return null;
    }
  }

  // Delete file from storage
  async delete(path, provider = 'google') {
    try {
      if (provider === 'google' && this.gcs) {
        await this.gcsBucket.file(path).delete();
      } else if (provider === 'aws' && this.s3) {
        const command = new DeleteObjectCommand({
          Bucket: this.s3Bucket,
          Key: path,
        });
        await this.s3.send(command);
      } else {
        throw new Error('Storage provider not configured');
      }

      logger.info('File deleted successfully', { path });
    } catch (error) {
      logger.error('File deletion error:', error);
      throw error;
    }
  }

  // Generate unique filename
  generateFilename(originalname) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalname.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  // Get file metadata
  async getMetadata(path, provider = 'google') {
    try {
      if (provider === 'google' && this.gcs) {
        const [metadata] = await this.gcsBucket.file(path).getMetadata();
        return metadata;
      } else if (provider === 'aws' && this.s3) {
        const command = new HeadObjectCommand({
          Bucket: this.s3Bucket,
          Key: path,
        });
        const response = await this.s3.send(command);
        return response;
      } else {
        throw new Error('Storage provider not configured');
      }
    } catch (error) {
      logger.error('Get metadata error:', error);
      throw error;
    }
  }
}

export const upload = new FileUpload();
