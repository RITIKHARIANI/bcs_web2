import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth/config';
import { uploadFile } from '../../../../lib/storage-simple';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Optimized for minimal bundle size
export const runtime = 'nodejs';
export const maxDuration = 60;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Unauthorized. Faculty access required.' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('moduleId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    // Upload file using simplified storage
    const uploadResult = await uploadFile(file);

    // Create minimal record in a simple JSON file (to avoid Prisma overhead)
    const mediaRecord = {
      id: crypto.randomUUID(),
      originalName: file.name,
      fileName: uploadResult.path,
      url: uploadResult.url,
      mimeType: file.type,
      size: file.size,
      moduleId: moduleId,
      facultyId: session.user.id,
      uploadedAt: new Date().toISOString(),
    };

    // Store metadata in JSON file (simple alternative to database)
    const mediaDir = path.join(process.cwd(), 'public', 'media-metadata');
    if (!existsSync(mediaDir)) {
      await mkdir(mediaDir, { recursive: true });
    }

    const metadataFile = path.join(mediaDir, `${mediaRecord.id}.json`);
    await writeFile(metadataFile, JSON.stringify(mediaRecord, null, 2));

    return NextResponse.json(
      {
        success: true,
        file: {
          id: mediaRecord.id,
          originalName: mediaRecord.originalName,
          url: mediaRecord.url,
          mimeType: mediaRecord.mimeType,
          size: mediaRecord.size,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload media file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
