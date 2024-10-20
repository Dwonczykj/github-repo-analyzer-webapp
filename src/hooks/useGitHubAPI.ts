'use client';

import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import githubService, { Repository, Issue } from '../services/githubService';
import axios from 'axios';

export const useGitHubAPI = () => {
    const [query, setQuery] = useState('');
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);

    const handleSearch = async (searchQuery: string) => {
        try {
            const response = await axios.get<Repository[]>(`/api/github-search?query=${encodeURIComponent(searchQuery)}`);
            setRepositories(response.data);
        } catch (error) {
            console.error('Error searching repositories:', error);
            throw error; // Rethrow the error so it can be caught in the component
        }
    };

    const handleGetRepository = async (owner: string, repo: string) => {
        try {
            const response = await axios.get<Repository>(`/api/github-get-repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
            setRepositories([response.data]);
        } catch (error) {
            console.error('Error getting repository:', error);
        }
    };

    const handleGetIssuesForRepository = async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') => {
        try {
            const response = await axios.get<Issue[]>(`/api/github-get-repository-issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&state=${encodeURIComponent(state)}`);
            setIssues(response.data);
        } catch (error) {
            console.error('Error getting repository issues:', error);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    const searchRepositories = useQuery(
        ['searchRepositories', searchQuery],
        () => githubService.searchRepositories(searchQuery),
        { enabled: !!searchQuery }
    );

    const getRepository = useCallback((owner: string, repo: string) => {
        return useQuery(['repository', owner, repo], () => githubService.getRepository(owner, repo));
    }, []);

    const getIssues = useCallback((owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') => {
        return useQuery(['issues', owner, repo, state], () => githubService.getIssues(owner, repo, state));
    }, []);

    return {
        query,
        setQuery,
        repositories,
        issues,
        handleSearch,
        handleGetRepository,
        handleGetIssuesForRepository,
    };
};
