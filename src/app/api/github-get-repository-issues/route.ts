import { NextResponse } from 'next/server'
import { getIssues } from '@/services/githubService'
import logger from '@/config/logging';
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const state = searchParams.get('state') as 'open' | 'closed' | 'all' | null

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Owner and repo parameters are required' }, { status: 400 })
    }

    try {
        const issues = await getIssues(owner, repo, state || 'all')
        return NextResponse.json(issues)
    } catch (error) {
        logger.error('Error getting repository issues:', error)
        return NextResponse.json({ error: 'An error occurred while fetching repository issues' }, { status: 500 })
    }
}
