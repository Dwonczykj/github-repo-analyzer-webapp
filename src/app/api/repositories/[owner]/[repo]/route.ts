import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryDetails, getRepositoryCommits, getRepositoryBranches, getRepositoryForks } from '@/services/githubService';
import logger from '@/config/logging';

export async function GET(
    request: NextRequest,
    { params }: { params: { owner: string; repo: string } }
) {
    const { owner, repo } = params;

    try {
        const [details, commits, branches, forks] = await Promise.all([
            getRepositoryDetails(owner, repo),
            getRepositoryCommits(owner, repo),
            getRepositoryBranches(owner, repo),
            getRepositoryForks(owner, repo)
        ]);

        return NextResponse.json({ details, commits, branches, forks });
    } catch (error) {
        logger.error(`Error fetching repository data for ${owner}/${repo}:`, error);

        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return NextResponse.json(
            { error: 'An error occurred while fetching repository data', details: errorMessage },
            { status: 500 }
        );
    }
}
