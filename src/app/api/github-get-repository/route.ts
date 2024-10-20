import { NextResponse } from 'next/server'
import { getRepository } from '@/services/githubService'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Owner and repo parameters are required' }, { status: 400 })
    }

    try {
        const repository = await getRepository(owner, repo)
        return NextResponse.json(repository)
    } catch (error) {
        console.error('Error getting repository:', error)
        return NextResponse.json({ error: 'An error occurred while fetching the repository' }, { status: 500 })
    }
}
