import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cluster from '@/models/Cluster';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { id } = params;

        const cluster = await Cluster.findByIdAndUpdate(
            id,
            { status: 'resolved' },
            { new: true }
        );

        if (!cluster) {
            return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, cluster });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
