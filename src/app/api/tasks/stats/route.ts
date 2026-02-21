import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';

// GET - Get task statistics for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';

    // Get all tasks for the user
    const tasks = await db.task.findMany({
      where: { userId },
    });

    // Calculate statistics
    const stats = {
      total: tasks.length,
      byStatus: {
        open: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
        pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
        inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
        review: tasks.filter((t) => t.status === TaskStatus.REVIEW).length,
        completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      },
      byPriority: {
        low: tasks.filter((t) => t.priority === 'LOW').length,
        medium: tasks.filter((t) => t.priority === 'MEDIUM').length,
        high: tasks.filter((t) => t.priority === 'HIGH').length,
        urgent: tasks.filter((t) => t.priority === 'URGENT').length,
      },
      completionRate:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === TaskStatus.COMPLETED).length /
                tasks.length) *
                100
            )
          : 0,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== TaskStatus.COMPLETED
      ).length,
      dueToday: tasks.filter(
        (t) =>
          t.dueDate &&
          isToday(new Date(t.dueDate)) &&
          t.status !== TaskStatus.COMPLETED
      ).length,
      dueThisWeek: tasks.filter(
        (t) =>
          t.dueDate &&
          isThisWeek(new Date(t.dueDate)) &&
          t.status !== TaskStatus.COMPLETED
      ).length,
      recentActivity: await getRecentActivity(userId),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isThisWeek(date: Date): boolean {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

async function getRecentActivity(userId: string) {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const tasks = await db.task.findMany({
    where: {
      userId,
      updatedAt: { gte: last7Days },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  // Group by day
  const activityByDay: Record<string, number> = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = `${days[date.getDay()]} ${date.getDate()}`;
    activityByDay[key] = 0;
  }

  for (const task of tasks) {
    const date = new Date(task.updatedAt);
    const key = `${days[date.getDay()]} ${date.getDate()}`;
    if (activityByDay[key] !== undefined) {
      activityByDay[key]++;
    }
  }

  return Object.entries(activityByDay).map(([day, count]) => ({
    day,
    count,
  }));
}
