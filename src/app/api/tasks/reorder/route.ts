import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { updates } = body;

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json(
                { success: false, error: 'An array of updates is required' },
                { status: 400 }
            );
        }

        // Using a transaction to ensure all updates succeed or fail together
        await db.$transaction(
            updates.map((update: { id: string; order: number }) =>
                db.task.update({
                    where: { id: update.id },
                    data: { order: update.order },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering tasks:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reorder tasks' },
            { status: 500 }
        );
    }
}
