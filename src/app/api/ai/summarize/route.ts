import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
    const { content } = await request.json();

    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    try {
        const response = await anthropic.completions.create({
            model: "claude-2",
            max_tokens_to_sample: 300,
            prompt: `\n\nHuman: Summarize the following code:\n\n${content}\n\nAssistant: Here's a summary of the code:`,
        });

        return NextResponse.json({ summary: response.completion });
    } catch (error) {
        console.error('Error summarizing code:', error);
        return NextResponse.json({ error: 'An error occurred while summarizing the code' }, { status: 500 });
    }
}
