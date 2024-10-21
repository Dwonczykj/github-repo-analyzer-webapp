import { NextRequest, NextResponse } from 'next/server';
import { searchRepositoriesWithRegex } from '@/services/githubService';
import logger from '@/config/logging';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '30', 10);

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const result = await searchRepositoriesWithRegex(query, page, perPage);
        return NextResponse.json(result);
    } catch (error) {
        logger.error('Error searching repositories:', error);
        return NextResponse.json({ error: 'An error occurred while searching repositories' }, { status: 500 });
    }
}
