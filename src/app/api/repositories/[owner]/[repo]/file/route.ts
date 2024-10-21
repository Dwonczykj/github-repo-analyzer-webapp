import { NextRequest, NextResponse } from 'next/server';
import { getFileContent } from '@/services/githubService';
import logger from '@/config/logging';

export async function GET(
    request: NextRequest,
    { params }: { params: { owner: string; repo: string } }
) {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    try {
        const fileDetail = await getFileContent(fileUrl);
        return NextResponse.json(fileDetail);
    } catch (error) {
        logger.error(`Error fetching file content:`, error);
        return NextResponse.json(
            { error: 'An error occurred while fetching file content' },
            { status: 500 }
        );
    }
}