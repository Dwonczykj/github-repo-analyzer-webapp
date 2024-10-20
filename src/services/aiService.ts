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

export async function generateSummary(text: string) {
    // OpenAI example
    const openaiResponse = await openai.chat.completions.create({
        model: environment.openai.model || "text-davinci-002",
        prompt: `Summarize the following: ${text}`,
        max_tokens: 100,
    });

    // Use other AI services similarly...

    return openaiResponse.data.choices[0].text;
}

// Add other AI-related functions here...

export default {
    generateSummary,
    // other functions...
};
