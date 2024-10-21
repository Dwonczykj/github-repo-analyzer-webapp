import { NextResponse } from 'next/server'
import { searchRepositoriesWithRegex } from '@/services/githubService'
import logger from '@/config/logging';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const resultsPerPage = parseInt(searchParams.get('perPage') || '30', 10)

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    try {
        const { repositories, totalCount, currentPage, perPage, hasNextPage } = await searchRepositoriesWithRegex(query, page, resultsPerPage)
        return NextResponse.json({ repositories, totalCount, currentPage, perPage, hasNextPage })
    } catch (error) {
        logger.error('Error searching repositories:', error)
        return NextResponse.json({ error: 'An error occurred while searching repositories' }, { status: 500 })
    }
}
