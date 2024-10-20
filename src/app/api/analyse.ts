import type { NextApiRequest, NextApiResponse } from 'next';
import environment from '../../config/environment';
import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const anthropic = new Anthropic({
            apiKey: environment.anthropic.apiKey,
        });

        try {
            const completion = await anthropic.completions.create({
                model: "claude-2",
                max_tokens_to_sample: 300,
                prompt: `Human: Analyze this code: ${req.body.code}\n\nAssistant:`,
            });

            res.status(200).json({ analysis: completion.completion });
        } catch (error) {
            res.status(500).json({ error: 'Error analyzing code' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}