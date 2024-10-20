import { NextRequest, NextResponse } from 'next/server';
import { searchRepository } from '@/services/githubService';
import logger from '@/config/logging';

export async function GET(
    request: NextRequest,
    { params }: { params: { owner: string; repo: string } }
) {
    const { owner, repo } = params;
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const results = await searchRepository(owner, repo, query);
        return NextResponse.json(results);
    } catch (error) {
        logger.error(`Error searching repository ${owner}/${repo}:`, error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json(
            { error: 'An error occurred while searching the repository', details: errorMessage },
            { status: 500 }
        );
    }
}
