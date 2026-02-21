import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Clear all tasks for a specific user
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Prisma: deletes all records matching the where condition
        await db.task.deleteMany({
            where: { userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing all tasks:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear all tasks' },
            { status: 500 }
        );
    }
}
