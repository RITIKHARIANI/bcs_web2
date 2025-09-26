"use client";

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { NeuralButton } from './neural-button';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { toast } from 'sonner';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadProgress?: number;
  uploadStatus?: 'uploading' | 'success' | 'error';
  error?: string;
}

interface MediaUploadProps {
  onUpload?: (files: MediaFile[]) => void;
  onFileSelect?: (file: MediaFile) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  moduleId?: string;
  showPreview?: boolean;
  compact?: boolean;
  className?: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function MediaUpload({
  onUpload,
  onFileSelect,
  maxFiles = 5,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav',
    'application/pdf', 'text/plain'
  ],
  moduleId,
  showPreview = true,
  compact = false,
  className = ''
}: MediaUploadProps) {
  
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (moduleId) {
      formData.append('moduleId', moduleId);
    }

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    return result.media;
  }, [moduleId]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const newFiles: MediaFile[] = [];

    try {
      for (const file of files) {
        // Validate file size
        if (file.size > maxFileSize) {
          toast.error(`File ${file.name} is too large. Max size: ${formatFileSize(maxFileSize)}`);
          continue;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} not allowed for ${file.name}`);
          continue;
        }

        try {
          // Create temporary file entry for progress tracking
          const tempFile: MediaFile = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            url: '',
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
            uploadStatus: 'uploading'
          };

          setUploadedFiles(prev => [...prev, tempFile]);

          // Upload file
          const uploadedFile = await uploadFile(file);
          
          // Update with successful upload data
          const successFile: MediaFile = {
            ...uploadedFile,
            uploadProgress: 100,
            uploadStatus: 'success'
          };

          newFiles.push(successFile);
          
          setUploadedFiles(prev => 
            prev.map(f => f.id === tempFile.id ? successFile : f)
          );

          toast.success(`${file.name} uploaded successfully`);

        } catch (error) {
          const errorFile: MediaFile = {
            id: `error_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            url: '',
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
            uploadStatus: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          };

          setUploadedFiles(prev => [...prev, errorFile]);
          toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (onUpload && newFiles.length > 0) {
        onUpload(newFiles);
      }

    } finally {
      setIsUploading(false);
    }
  }, [maxFileSize, allowedTypes, uploadFile, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    maxFiles,
    disabled: isUploading,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const selectFile = useCallback((file: MediaFile) => {
    if (onFileSelect && file.uploadStatus === 'success') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <NeuralButton
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload Media
        </NeuralButton>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(Array.from(e.target.files));
            }
          }}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <Card className={`transition-colors duration-200 ${
        isDragActive 
          ? 'border-neural-primary bg-neural-primary/5' 
          : 'border-dashed border-2 border-border hover:border-neural-primary/50'
      }`}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className="cursor-pointer text-center"
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-neural-primary/10 rounded-full flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-neural-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-neural-primary" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload media files'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop files here, or click to browse
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Max file size: {formatFileSize(maxFileSize)}</p>
                  <p>Max {maxFiles} files • Images, videos, audio, documents</p>
                </div>
              </div>

              <NeuralButton
                variant="outline"
                disabled={isUploading}
                type="button"
              >
                Choose Files
              </NeuralButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => {
              const IconComponent = getFileIcon(file.mimeType);
              
              return (
                <Card key={file.id} className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.originalName}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>{file.mimeType}</span>
                        </div>
                        
                        {file.uploadStatus === 'uploading' && (
                          <Progress value={file.uploadProgress} className="h-1 mt-2" />
                        )}
                        
                        {file.uploadStatus === 'error' && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {file.uploadStatus === 'success' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {onFileSelect && (
                              <NeuralButton
                                variant="ghost"
                                size="sm"
                                onClick={() => selectFile(file)}
                              >
                                Select
                              </NeuralButton>
                            )}
                          </>
                        )}
                        
                        {file.uploadStatus === 'uploading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-neural-primary" />
                        )}
                        
                        {file.uploadStatus === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}

                        <NeuralButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </NeuralButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
