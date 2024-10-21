import axios, { AxiosError } from 'axios';
import logger from '@/config/logging';

function serverSideOnly<T extends (...args: any[]) => ReturnType<T>>(fn: T): T {
    const wrappedFunction = ((...args: Parameters<T>): ReturnType<T> => {
        if (typeof window !== 'undefined') {
            throw new Error(`${fn.name} can only be called on the server side.`);
        }
        return fn(...args);
    }) as any as T;

    return wrappedFunction;
}

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (typeof window === 'undefined' && !GITHUB_ACCESS_TOKEN) {
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
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        type: string;
        site_admin: boolean;
    };
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
    } | null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: string;
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
    score: number;
}

export interface RepositoryDetails {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        type: string;
        site_admin: boolean;
    };
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    mirror_url: string | null;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
    } | null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: string;
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
    temp_clone_token: string | null;
    network_count: number;
    subscribers_count: number;
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

export class GitHubService {
    static async searchRepositoriesWithRegex(query: string, page: number = 1, perPage: number = 30): Promise<{ repositories: Repository[], totalCount: number, error?: SearchError }> {
        try {
            // Check query length
            if (query.length > 256) {
                return { repositories: [], totalCount: 0, error: { message: 'Query is too long (max 256 characters)', type: 'query_length' } };
            }

            // Check for too many operators
            const operatorCount = (query.match(/\b(AND|OR|NOT)\b/g) || []).length;
            if (operatorCount > 5) {
                return { repositories: [], totalCount: 0, error: { message: 'Query has too many AND, OR, or NOT operators (max 5)', type: 'query_operators' } };
            }

            const response = await githubApi.get('/search/repositories', {
                params: {
                    q: query,
                    page,
                    per_page: perPage
                },
            });

            // Check rate limit
            const rateLimit = parseInt(response.headers['x-ratelimit-remaining'] || '0', 10);
            if (rateLimit <= 5) {
                logger.warn(`Rate limit is low: ${rateLimit} requests remaining`);
            }

            return { repositories: response.data.items, totalCount: response.data.total_count };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 403 && axiosError.response.headers['x-ratelimit-remaining'] === '0') {
                    return { repositories: [], totalCount: 0, error: { message: 'Rate limit exceeded', type: 'rate_limit' } };
                }
                if (axiosError.response?.status === 422) {
                    return { repositories: [], totalCount: 0, error: { message: 'Validation failed', type: 'validation_failed' } };
                }
            }
            logger.error('Error searching repositories:', error);
            return { repositories: [], totalCount: 0, error: { message: 'An unknown error occurred', type: 'unknown' } };
        }
    }

    static searchRepositories = serverSideOnly(async (query: string): Promise<Repository[]> => {
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
    });

    static getRepository = serverSideOnly(async (owner: string, repo: string): Promise<Repository> => {
        const response = await githubApi.get(`/repos/${owner}/${repo}`);
        return response.data;
    });

    static getIssues = serverSideOnly(async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<Issue[]> => {
        const response = await githubApi.get(`/repos/${owner}/${repo}/issues`, {
            params: { state },
        });
        return response.data;
    });

    static getRepositoryDetails = serverSideOnly(async (owner: string, repo: string): Promise<RepositoryDetails> => {
        logger.debug(`Fetching details for repository: ${owner}/${repo}`);
        try {
            const response = await githubApi.get(`/repos/${owner}/${repo}`);
            logger.debug(`Successfully fetched details for ${owner}/${repo}`);
            return response.data;
        } catch (error) {
            logger.error(`Error fetching repository details for ${owner}/${repo}:`, error);
            throw error;
        }
    });

    static getRepositoryCommits = serverSideOnly(async (owner: string, repo: string): Promise<any[]> => {
        const response = await githubApi.get(`/repos/${owner}/${repo}/commits`, {
            params: {
                per_page: 100 // Fetch up to 100 commits
            }
        });

        // Fetch detailed stats for each commit
        const detailedCommits = await Promise.all(response.data.map(async (commit: any) => {
            const detailedResponse = await githubApi.get(`/repos/${owner}/${repo}/commits/${commit.sha}`);
            return {
                ...commit,
                stats: detailedResponse.data.stats
            };
        }));

        return detailedCommits;
    });

    static getRepositoryBranches = serverSideOnly(async (owner: string, repo: string): Promise<any[]> => {
        const response = await githubApi.get(`/repos/${owner}/${repo}/branches`);
        return response.data;
    });

    static getRepositoryForks = serverSideOnly(async (owner: string, repo: string): Promise<GitHubFork[]> => {
        try {
            const response = await githubApi.get(`/repos/${owner}/${repo}/forks`);
            return response.data;
        } catch (error) {
            logger.error(`Error fetching forks for ${owner}/${repo}:`, error);
            return [];
        }
    });

    static searchRepository = serverSideOnly(async (owner: string, repo: string, query: string): Promise<{ files: any[], issues: any[], commits: any[] }> => {
        const [filesResponse, issuesResponse, commitsResponse] = await Promise.all([
            githubApi.get(`/search/code`, { params: { q: `repo:${owner}/${repo} ${query}` } }),
            githubApi.get(`/search/issues`, { params: { q: `repo:${owner}/${repo} ${query}` } }),
            githubApi.get(`/search/commits`, { params: { q: `repo:${owner}/${repo} ${query}` } }),
        ]);

        return {
            files: filesResponse.data.items,
            issues: issuesResponse.data.items,
            commits: commitsResponse.data.items,
        };
    });
}

// Export the static methods
export const {
    searchRepositoriesWithRegex,
    searchRepositories,
    getRepository,
    getIssues,
    getRepositoryDetails,
    getRepositoryCommits,
    getRepositoryBranches,
    getRepositoryForks,
    searchRepository
} = GitHubService;

// Add these interfaces if they're not already defined
export interface Issue {
    // Define the structure of an Issue
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    html_url: string;
    comments: string;
    // Add other properties as needed
}

export interface GitHubFork {
    // Define the structure of a GitHubFork
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        id: number;
        avatar_url: string;
    };
    // Add other properties as needed
    stargazers_count: number;
}

interface SearchError {
    message: string;
    type: 'rate_limit' | 'query_length' | 'query_operators' | 'validation_failed' | 'unknown';
}
