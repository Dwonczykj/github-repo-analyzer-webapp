interface EnvironmentConfig {
    github: {
        accessToken: string;
    };
    openai: {
        apiKey: string;
        model?: string;
    };
    anthropic: {
        apiKey: string;
        model?: string;
    };
    huggingface: {
        apiKey: string;
        model?: string;
    };
}

const environment: EnvironmentConfig = {
    github: {
        accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL,
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL,
    },
    huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        model: process.env.HUGGINGFACE_MODEL,
    },
};

export default environment;