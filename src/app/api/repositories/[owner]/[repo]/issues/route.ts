import { NextRequest, NextResponse } from 'next/server';
import { getIssues } from '@/services/githubService';
import logger from '@/config/logging';

export async function GET(
    request: NextRequest,
    { params }: { params: { owner: string; repo: string } }
) {
    const { owner, repo } = params;
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state') as 'open' | 'closed' | 'all' || 'all';

    try {
        const issues = await getIssues(owner, repo, state);
        return NextResponse.json(issues);
    } catch (error) {
        logger.error(`Error fetching issues for ${owner}/${repo}:`, error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json(
            { error: 'An error occurred while fetching issues', details: errorMessage },
            { status: 500 }
        );
    }
}
