'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Repository, Issue } from '../services/githubService';

export const useGitHubAPI = () => {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(30);

    const searchRepositories = useQuery({
        queryKey: ['searchRepositories', query, page, perPage],
        queryFn: async () => {
            const response = await axios.get<{ repositories: Repository[], totalCount: number, page: number, perPage: number }>(
                `/api/github-search?query=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`
            );
            return response.data;
        },
        enabled: !!query,
    });

    const getRepository = (owner: string, repo: string) => useQuery({
        queryKey: ['repository', owner, repo],
        queryFn: async () => {
            const response = await axios.get<Repository>(`/api/github-get-repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
            return response.data;
        },
        enabled: false,
    });

    const getIssues = (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') => useQuery({
        queryKey: ['issues', owner, repo, state],
        queryFn: async () => {
            const response = await axios.get<Issue[]>(`/api/github-get-repository-issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&state=${encodeURIComponent(state)}`);
            return response.data;
        },
        enabled: false,
    });

    return {
        query,
        setQuery,
        page,
        setPage,
        perPage,
        setPerPage,
        searchRepositories,
        getRepository,
        getIssues,
    };
};
