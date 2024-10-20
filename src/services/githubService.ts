import axios from 'axios';
import logger from '@/config/logging';

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_ACCESS_TOKEN) {
    logger.error('GITHUB_ACCESS_TOKEN is not set');
}

const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
    },
});

export interface Repository {
    id: number;
    owner: {
        login: string;
    };
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
}

export interface Issue {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed';
    created_at: string;
    html_url: string;
}

// export const searchRepositories = async (query: string): Promise<Repository[]> => {
//     const response = await githubApi.get('/search/repositories', {
//         params: { q: query },
//     });
//     return response.data.items;
// };
export const searchRepositories = async (query: string): Promise<Repository[]> => {
    logger.debug(`Searching repositories with query: ${query}`);

    try {
        const response = await githubApi.get('/search/repositories', {
            params: { q: query },
        });

        logger.debug(`Found ${response.data.items.length} repositories`);
        return response.data.items;
    } catch (error) {
        logger.error('Error searching repositories:', error);
        throw error;
    }
};

export const getRepository = async (owner: string, repo: string): Promise<Repository> => {
    const response = await githubApi.get(`/repos/${owner}/${repo}`);
    return response.data;
};

export const getIssues = async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<Issue[]> => {
    const response = await githubApi.get(`/repos/${owner}/${repo}/issues`, {
        params: { state },
    });
    return response.data;
};

export default {
    searchRepositories,
    getRepository,
    getIssues,
};
