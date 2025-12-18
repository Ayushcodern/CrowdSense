import { NextResponse } from 'next/server';
import { processReport } from '@/lib/clustering';
import dbConnect from '@/lib/db';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase limit for Base64 images
        },
    },
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.location || !body.issueType || !body.severity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { report, cluster } = await processReport(body);

        return NextResponse.json({ success: true, report, cluster });
    } catch (error) {
        console.error('Error processing report:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
