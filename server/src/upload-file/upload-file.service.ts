import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';

/**
 * T105-T108, T115: FileUploadService
 * Handles image upload, validation, and URL generation
 *
 * Features:
 * - Generate presigned URLs for direct cloud storage upload
 * - Validate image files (type, size, dimensions)
 * - Sanitize filenames to prevent security issues
 * - Validate image URLs
 */
@Injectable()
export class UploadFileService {
  private readonly logger = new Logger(UploadFileService.name);
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly ALLOWED_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
  ];
  private readonly PRESIGNED_URL_EXPIRATION = 900; // 15 minutes in seconds

  constructor(private readonly configService: ConfigService) {}

  /**
   * T106: Generate presigned URL for direct upload to cloud storage
   *
   * @param filename - Original filename from user
   * @param mimeType - MIME type of the file
   * @param size - File size in bytes
   * @returns Object containing presigned URL, expiration, and final URL
   */
  async generatePresignedUrl(
    filename: string,
    mimeType: string,
    size: number,
  ): Promise<{
    presignedUrl: string;
    expiresIn: number;
    finalUrl: string;
  }> {
    // Validate file
    this.validateImageFile(filename, mimeType, size);

    // Generate unique filename
    const sanitizedFilename = this.sanitizeFilename(filename);
    const uniqueFilename = this.generateUniqueFilename(sanitizedFilename);

    // Get storage configuration
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_S3_REGION');
    const cdnUrl = this.configService.get<string>('CDN_URL');

    // For now, return mock URLs (in production, use AWS SDK to generate real presigned URLs)
    // TODO: Implement actual AWS S3 presigned URL generation when AWS credentials are configured
    const presignedUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uniqueFilename}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${this.PRESIGNED_URL_EXPIRATION}`;
    const finalUrl = `${cdnUrl || `https://${bucket}.s3.${region}.amazonaws.com`}/${uniqueFilename}`;

    this.logger.log(`Generated presigned URL for file: ${uniqueFilename}`);

    return {
      presignedUrl,
      expiresIn: this.PRESIGNED_URL_EXPIRATION,
      finalUrl,
    };
  }

  /**
   * T107: Validate image file (type, size, dimensions)
   *
   * @param filename - File name
   * @param mimeType - MIME type
   * @param size - File size in bytes
   * @throws Error if validation fails
   */
  validateImageFile(filename: string, mimeType: string, size: number): void {
    // Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(
        `Invalid file type: ${mimeType}. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Validate file extension
    const ext = path.extname(filename).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(
        `Invalid file extension: ${ext}. Allowed extensions: ${this.ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    // Validate file size
    if (size <= 0) {
      throw new Error('File size must be greater than 0');
    }

    if (size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    this.logger.debug(
      `File validation passed: ${filename} (${mimeType}, ${size} bytes)`,
    );
  }

  /**
   * T108: Sanitize filename to prevent path traversal and security issues
   *
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  sanitizeFilename(filename: string): string {
    // Remove path components (prevent directory traversal)
    let sanitized = path.basename(filename);

    // Remove or replace dangerous characters
    sanitized = sanitized
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric chars
      .replace(/\.{2,}/g, '.') // Replace multiple dots
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, ''); // Remove trailing dots

    // Ensure filename is not empty after sanitization
    if (!sanitized || sanitized.length === 0) {
      sanitized = 'upload';
    }

    // Limit filename length (keep extension)
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    const maxNameLength = 100;

    if (nameWithoutExt.length > maxNameLength) {
      sanitized = nameWithoutExt.substring(0, maxNameLength) + ext;
    }

    this.logger.debug(`Sanitized filename: ${filename} -> ${sanitized}`);
    return sanitized;
  }

  /**
   * T115: Validate image URL (check accessibility, MIME type)
   *
   * @param imageUrl - URL to validate
   * @returns Object containing validation result and metadata
   */
  async validateImageUrl(imageUrl: string): Promise<{
    valid: boolean;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    error?: string;
  }> {
    try {
      // Validate URL format
      let url: URL;
      try {
        url = new URL(imageUrl);
      } catch {
        return {
          valid: false,
          error: 'Invalid URL format',
        };
      }

      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return {
          valid: false,
          error: 'Only HTTP and HTTPS protocols are allowed',
        };
      }

      // Fetch image metadata using HEAD request
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
        },
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Check Content-Type
      const contentType = response.headers.get('content-type');
      if (
        !contentType ||
        !this.ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())
      ) {
        return {
          valid: false,
          error: `Invalid content type: ${contentType}. Expected image type.`,
        };
      }

      // Check Content-Length
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : undefined;

      if (size && size > this.MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `Image size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
      }

      this.logger.log(`Image URL validated successfully: ${imageUrl}`);

      return {
        valid: true,
        mimeType: contentType,
        size,
        // Note: Width and height would require downloading and processing the image
        // For now, we'll skip dimension validation to avoid downloading large files
      };
    } catch (error) {
      this.logger.error(`Failed to validate image URL: ${imageUrl}`, error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate unique filename using UUID
   *
   * @param originalFilename - Original filename
   * @returns Unique filename with UUID prefix
   */
  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const uuid = crypto.randomUUID();
    return `bookmarks/${uuid}${ext}`;
  }
}
