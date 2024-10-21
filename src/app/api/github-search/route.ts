import { NextResponse } from 'next/server'
import { searchRepositoriesWithRegex } from '@/services/githubService'
import logger from '@/config/logging';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('perPage') || '30', 10)

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    try {
        const { repositories, totalCount } = await searchRepositoriesWithRegex(query, page, perPage)
        return NextResponse.json({ repositories, totalCount, page, perPage })
    } catch (error) {
        logger.error('Error searching repositories:', error)
        return NextResponse.json({ error: 'An error occurred while searching repositories' }, { status: 500 })
    }
}
