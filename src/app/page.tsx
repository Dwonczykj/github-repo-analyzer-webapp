'use client';

import React, { useState } from 'react';
import { Container, Typography, CircularProgress } from '@material-ui/core';
import SearchBar from '../components/Search/SearchBar';
import SearchResults from '../components/Search/SearchResults';
import { useGitHubAPI } from '../hooks/useGitHubAPI';

export default function Home() {
  const {
    query,
    setQuery,
    repositories,
    handleSearch,
    handleGetRepository
  } = useGitHubAPI();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSearchSubmit = async (searchQuery: string) => {
    setQuery(searchQuery); // Update the query state
    setIsLoading(true);
    setError(null);
    try {
      await handleSearch(searchQuery); // Pass the searchQuery to handleSearch
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositorySelect = async (owner: string, repo: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await handleGetRepository(owner, repo);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        GitHub Repository Analyzer
      </Typography>
      <SearchBar onSearch={handleSearchSubmit} />
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error.message}</Typography>
      ) : (
        <SearchResults
          repositories={repositories}
          onRepositorySelect={handleRepositorySelect}
        />
      )}
    </Container>
  );
}
