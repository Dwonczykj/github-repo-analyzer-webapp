import { NextResponse } from 'next/server'
import { searchRepositories } from '@/services/githubService'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    try {
        const repositories = await searchRepositories(query)
        return NextResponse.json(repositories)
    } catch (error) {
        console.error('Error searching repositories:', error)
        return NextResponse.json({ error: 'An error occurred while searching repositories' }, { status: 500 })
    }
}
