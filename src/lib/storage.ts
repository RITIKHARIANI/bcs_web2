// Production-ready file storage configuration
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Storage configuration interface
interface StorageConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadDir: string;
  useCloudStorage: boolean;
  cloudProvider?: 'aws' | 'cloudinary' | 'vercel';
}

// Get storage configuration from environment
const getStorageConfig = (): StorageConfig => ({
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '52428800'), // 50MB default
  allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ],
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  useCloudStorage: process.env.NODE_ENV === 'production' && (
    !!process.env.AWS_S3_BUCKET_NAME || 
    !!process.env.CLOUDINARY_CLOUD_NAME ||
    !!process.env.VERCEL_BLOB_READ_WRITE_TOKEN
  ),
  cloudProvider: process.env.AWS_S3_BUCKET_NAME ? 'aws' : 
                 process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' :
                 process.env.VERCEL_BLOB_READ_WRITE_TOKEN ? 'vercel' : undefined
});

// File validation
export const validateFile = (file: File, config: StorageConfig): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(config.maxFileSize / 1024 / 1024)}MB`
    };
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

// Generate unique filename
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 50);
  
  return `${timestamp}-${randomString}-${baseName}${extension}`;
};

// Local file storage
const saveFileLocally = async (file: File, config: StorageConfig): Promise<{ url: string; path: string }> => {
  const fileName = generateFileName(file.name);
  const uploadPath = path.join(process.cwd(), config.uploadDir);
  
  // Create upload directory if it doesn't exist
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }
  
  const filePath = path.join(uploadPath, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await writeFile(filePath, buffer);
  
  return {
    url: `/uploads/${fileName}`,
    path: filePath
  };
};

// AWS S3 file storage (requires @aws-sdk/client-s3)
const saveFileToS3 = async (file: File): Promise<{ url: string; path: string }> => {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('AWS S3 configuration missing');
  }

  try {
    // Dynamic import to avoid bundle bloat if not using S3
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const awsSdk = await import('@aws-sdk/client-s3' as any).catch((err: Error) => {
      console.warn('AWS SDK not available:', err.message);
      throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
    });
    
    const { S3Client, PutObjectCommand } = awsSdk;
    
    const s3Client = new S3Client({
      region: process.env.AWS_S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const fileName = generateFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    
    return { url, path: fileName };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Cloudinary file storage (requires cloudinary)
const saveFileToCloudinary = async (file: File): Promise<{ url: string; path: string }> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary configuration missing');
  }

  try {
    // Dynamic import to avoid bundle bloat if not using Cloudinary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloudinary = await import('cloudinary' as any).catch((err: Error) => {
      console.warn('Cloudinary SDK not available:', err.message);
      throw new Error('Cloudinary SDK not installed. Run: npm install cloudinary');
    });
    
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    const result = await cloudinary.v2.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'bcs-etextbook',
      public_id: generateFileName(file.name),
    });

    return { url: result.secure_url, path: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Vercel Blob storage (requires @vercel/blob)
const saveFileToVercelBlob = async (file: File): Promise<{ url: string; path: string }> => {
  if (!process.env.VERCEL_BLOB_READ_WRITE_TOKEN) {
    throw new Error('Vercel Blob configuration missing');
  }

  try {
    // Dynamic import to avoid bundle bloat if not using Vercel Blob
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vercelBlob = await import('@vercel/blob' as any).catch((err: Error) => {
      console.warn('Vercel Blob SDK not available:', err.message);
      throw new Error('Vercel Blob SDK not installed. Run: npm install @vercel/blob');
    });
    
    const { put } = vercelBlob;
    const fileName = generateFileName(file.name);
    
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    });

    return { url: blob.url, path: fileName };
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw new Error(`Failed to upload to Vercel Blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Main file upload function
export const uploadFile = async (file: File): Promise<{ url: string; path: string }> => {
  const config = getStorageConfig();
  
  // Validate file
  const validation = validateFile(file, config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Choose storage method based on configuration
  if (config.useCloudStorage) {
    switch (config.cloudProvider) {
      case 'aws':
        return await saveFileToS3(file);
      case 'cloudinary':
        return await saveFileToCloudinary(file);
      case 'vercel':
        return await saveFileToVercelBlob(file);
      default:
        throw new Error('Cloud storage provider not configured');
    }
  } else {
    return await saveFileLocally(file, config);
  }
};

// Helper function to get file upload limits for client-side validation
export const getUploadLimits = () => {
  const config = getStorageConfig();
  return {
    maxFileSize: config.maxFileSize,
    allowedTypes: config.allowedTypes,
    maxFileSizeMB: Math.round(config.maxFileSize / 1024 / 1024),
  };
};

// Helper function to cleanup old files (run periodically)
export const cleanupOldFiles = async (daysOld: number = 30): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return;
  
  const config = getStorageConfig();
  
  // Only cleanup local files (cloud storage should have its own lifecycle policies)
  if (!config.useCloudStorage) {
    try {
      const { readdir, stat, unlink } = await import('fs/promises');
      const uploadPath = path.join(process.cwd(), config.uploadDir);
      
      if (!existsSync(uploadPath)) return;
      
      const files = await readdir(uploadPath);
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
      
      for (const file of files) {
        const filePath = path.join(uploadPath, file);
        const fileStat = await stat(filePath);
        
        if (fileStat.mtime < cutoffDate) {
          await unlink(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
};

// Default export for storage utilities
const storageUtils = {
  uploadFile,
  validateFile,
  getUploadLimits,
  cleanupOldFiles,
};

export default storageUtils;
