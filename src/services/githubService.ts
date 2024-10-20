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

const isValidRegex = (pattern: string): boolean => {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
};

const filterRepositoriesByRegex = (repositories: Repository[], pattern: string): Repository[] => {
    const regex = new RegExp(pattern, 'i');
    return repositories.filter(repo =>
        regex.test(repo.name) ||
        regex.test(repo.full_name) ||
        (repo.description && regex.test(repo.description))
    );
};

export const searchRepositoriesWithRegex = async (query: string, page: number = 1, perPage: number = 30): Promise<{ repositories: Repository[], totalCount: number }> => {
    const isRegex = isValidRegex(query);
    const searchQuery = isRegex ? query.replace(/[^a-zA-Z0-9]/g, '') : query;

    const response = await githubApi.get('/search/repositories', {
        params: {
            q: searchQuery,
            page,
            per_page: isRegex ? 100 : perPage // Fetch more results if it's a regex query
        },
    });

    let repositories = response.data.items;
    let totalCount = response.data.total_count;

    if (isRegex) {
        repositories = filterRepositoriesByRegex(repositories, query);
        totalCount = repositories.length;

        // Apply paging after filtering
        const startIndex = (page - 1) * perPage;
        repositories = repositories.slice(startIndex, startIndex + perPage);
    }

    return { repositories, totalCount };
};

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
    searchRepositoriesWithRegex,
    getRepository,
    getIssues,
};
