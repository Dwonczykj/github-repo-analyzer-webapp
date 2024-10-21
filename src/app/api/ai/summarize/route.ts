import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import logger from '@/config/logging';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use a simple in-memory store for demo purposes
// In a production app, use a database or cache service
const summaryJobs: { [key: string]: { status: 'pending' | 'completed' | 'error', result?: string } } = {};

export async function POST(request: NextRequest) {
    const { content } = await request.json();

    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const jobId = Date.now().toString();
    summaryJobs[jobId] = { status: 'pending' };

    // Start the summarization process without waiting for it to complete
    summarizeInBackground(jobId, content);

    return NextResponse.json({ jobId });
}

async function summarizeInBackground(jobId: string, content: string) {
    try {
        const response = await anthropic.completions.create({
            model: "claude-2",
            max_tokens_to_sample: 300,
            prompt: `\n\nHuman: Summarize the following code:\n\n${content}\n\nAssistant: Here's a summary of the code:`,
        });

        summaryJobs[jobId] = { status: 'completed', result: response.completion };
    } catch (error) {
        logger.error('Error summarizing code:', error);
        summaryJobs[jobId] = { status: 'error', result: 'An error occurred while summarizing the code' };
    }
}

export async function GET(request: NextRequest) {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId || !summaryJobs[jobId]) {
        return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    return NextResponse.json(summaryJobs[jobId]);
}
