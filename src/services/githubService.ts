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

export interface Issue {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    body: string;
    user: {
        login: string;
        id: number;
        avatar_url: string;
    };
    labels: {
        id: number;
        name: string;
        color: string;
    }[];
    assignees: {
        login: string;
        id: number;
        avatar_url: string;
    }[];
    comments: number;
    html_url: string;
}

export const getIssues = async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<Issue[]> => {
    const response = await githubApi.get(`/repos/${owner}/${repo}/issues`, {
        params: { state },
    });
    return response.data;
};

export const getRepositoryDetails = async (owner: string, repo: string): Promise<RepositoryDetails> => {
    logger.debug(`Fetching details for repository: ${owner}/${repo}`);
    try {
        const response = await githubApi.get(`/repos/${owner}/${repo}`);
        logger.debug(`Successfully fetched details for ${owner}/${repo}`);
        return response.data;
    } catch (error) {
        logger.error(`Error fetching repository details for ${owner}/${repo}:`, error);
        throw error;
    }
};

export const getRepositoryCommits = async (owner: string, repo: string): Promise<any[]> => {
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
};

export const getRepositoryBranches = async (owner: string, repo: string): Promise<any[]> => {
    const response = await githubApi.get(`/repos/${owner}/${repo}/branches`);
    return response.data;
};

export interface GitHubFork {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    owner: {
        login: string;
        id: number;
        avatar_url: string;
        html_url: string;
        type: string;
    };
    private: boolean;
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
    forks_count: number;
    open_issues_count: number;
    default_branch: string;
    is_template: boolean;
    topics: string[];
    visibility: string;
    forks: number;
    open_issues: number;
    watchers: number;
    subscribers_count: number;
    network_count: number;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
    } | null;
}

export const getRepositoryForks = async (owner: string, repo: string): Promise<GitHubFork[]> => {
    try {
        const response = await githubApi.get(`/repos/${owner}/${repo}/forks`);
        return response.data;
    } catch (error) {
        logger.error(`Error fetching forks for ${owner}/${repo}:`, error);
        return [];
    }
};

// export {
//     searchRepositoriesWithRegex,
//     getRepositoryDetails,
//     getRepositoryCommits,
//     getRepositoryBranches,
//     getRepositoryForks,
// };
