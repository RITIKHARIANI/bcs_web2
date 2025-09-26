// Simplified storage for Vercel deployment - avoids large dependencies
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Storage configuration interface
interface StorageConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadDir: string;
}

// Get storage configuration from environment
const getStorageConfig = (): StorageConfig => ({
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '52428800'), // 50MB default
  allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/mov',
    'video/quicktime',
    // Audio
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-rar-compressed'
  ],
  uploadDir: process.env.UPLOAD_DIR || './public/uploads',
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

// Simple local file storage (works in serverless with public folder)
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
    path: fileName
  };
};

// Main file upload function (simplified)
export const uploadFile = async (file: File): Promise<{ url: string; path: string }> => {
  const config = getStorageConfig();
  
  // Validate file
  const validation = validateFile(file, config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Use local storage for now (can be extended later)
  return await saveFileLocally(file, config);
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

// Simple storage utilities
const storageUtils = {
  uploadFile,
  validateFile,
  getUploadLimits,
};

export default storageUtils;
