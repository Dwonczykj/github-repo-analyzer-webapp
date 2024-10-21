import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";
import Anthropic from "@anthropic-ai/sdk";
import environment from "../config/environment";

const openai = new OpenAI({
    apiKey: environment.openai.apiKey,
});

const huggingface = new HfInference(environment.huggingface.apiKey);

const anthropic = new Anthropic({
    apiKey: environment.anthropic.apiKey,
});

export async function summarizeText(text: string): Promise<string> {
    try {
        const openaiResponse = await openai.chat.completions.create({
            model: environment.openai.model || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that summarizes text." },
                { role: "user", content: `Summarize the following: ${text}` }
            ],
            max_tokens: 100,
        });

        return openaiResponse.choices[0]?.message?.content || "Unable to generate summary.";
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        throw new Error('Failed to generate summary');
    }
}

// Add other AI-related functions here...

export default {
    summarizeText,
    // other functions...
};
