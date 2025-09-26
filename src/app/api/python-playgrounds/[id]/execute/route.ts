import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth/config';
import { prisma } from '../../../../../lib/db';
import { executePythonCode } from '../../../../../lib/python-engine';
import { z } from 'zod';

const executeSchema = z.object({
  code: z.string().min(1),
  packages: z.array(z.string()).default([]),
  timeout: z.number().min(1000).max(60000).default(30000), // 1s to 60s
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { code, packages, timeout } = executeSchema.parse(body);

    // Check if playground exists and is accessible
    const playground = await prisma.python_playgrounds.findUnique({
      where: { id }
    });

    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    // Check access permissions
    const canAccess = (
      playground.status === 'published' ||
      playground.author_id === session.user.id ||
      session.user.role === 'admin'
    );

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Execute the Python code
    const executionResult = await executePythonCode(code, {
      timeout,
      captureOutput: true,
      installPackages: packages
    });

    // Log the execution
    const executionLog = await prisma.playground_executions.create({
      data: {
        playground_id: id,
        code,
        output: executionResult.output || null,
        error: executionResult.error || null,
        execution_time: executionResult.executionTime,
        packages_used: executionResult.requiredPackages,
        executed_by: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      execution: {
        id: executionLog.id,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: executionResult.executionTime,
        requiredPackages: executionResult.requiredPackages,
        packagesUsed: executionResult.requiredPackages
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Execute playground error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get execution history for a playground
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Check if playground exists and is accessible
    const playground = await prisma.python_playgrounds.findUnique({
      where: { id }
    });

    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 });
    }

    // Check access permissions
    const canAccess = (
      playground.status === 'published' ||
      playground.author_id === session.user.id ||
      session.user.role === 'admin'
    );

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For privacy, only show user's own executions unless they're the author
    const where: any = { playground_id: id };
    if (playground.author_id !== session.user.id) {
      where.executed_by = session.user.id;
    }

    const executions = await prisma.playground_executions.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.playground_executions.count({ where });

    return NextResponse.json({
      executions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get execution history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution history' },
      { status: 500 }
    );
  }
}
