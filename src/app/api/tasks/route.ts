import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(2000, "Description is too long").nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
});

const updateTaskSchema = taskSchema.partial().extend({
  id: z.string().min(1, "Task ID is required"),
});

// GET - Fetch all tasks for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = (session.user as any).id;
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await db.task.findMany({
      where,
      orderBy: [{ order: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const parsedData = taskSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate, tags } = parsedData.data;

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        status: status || TaskStatus.OPEN,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags ? JSON.stringify(tags) : null,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Update a task
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const parsedData = updateTaskSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { id, title, description, status, priority, dueDate, tags } = parsedData.data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;

    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    await db.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
