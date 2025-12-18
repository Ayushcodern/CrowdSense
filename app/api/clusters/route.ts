import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cluster from '@/models/Cluster';

export const dynamic = 'force-dynamic'; // Ensure no caching for real-time updates

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'active';

        // Filter based on status. If 'resolved', look for 'resolved'. 
        // If 'active', look for anything NOT resolved.
        const query = status === 'resolved' ? { status: 'resolved' } : { status: { $ne: 'resolved' } };

        // Fetch clusters
        const clusters = await Cluster.find(query)
            .sort({ priorityScore: -1 })
            .populate('reportIds')
            .limit(100);

        return NextResponse.json({ clusters });
    } catch (error) {
        console.error('Error fetching clusters:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
