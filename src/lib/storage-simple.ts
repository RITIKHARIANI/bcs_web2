import fs from 'fs';
import path from 'path';

// Simple file validation for local uploads
export const validateFile = (file: File, config: any): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed size of ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`
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

// Simple local file upload
export const uploadFile = async (file: File): Promise<{ url: string; path: string }> => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${randomStr}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);

    return {
      url: `/uploads/${filename}`,
      path: filename
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};