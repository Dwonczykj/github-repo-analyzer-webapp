'use client';

import React, { useState } from 'react';
import { Container, Typography, CircularProgress, Pagination } from '@mui/material';
import SearchBar from '../components/Search/SearchBar';
import SearchResults from '../components/Search/SearchResults';
import { useGitHubAPI } from '../hooks/useGitHubAPI';

export default function Home() {
  const {
    query,
    setQuery,
    page,
    setPage,
    perPage,
    searchRepositories,
    getRepository,
  } = useGitHubAPI();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSearchSubmit = async (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const { data, isLoading: isSearchLoading, error: searchError } = searchRepositories;

  const totalPages = data ? Math.ceil(data.totalCount / perPage) : 0;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        GitHub Repository Analyzer
      </Typography>
      <SearchBar onSearch={handleSearchSubmit} />
      {isSearchLoading ? (
        <CircularProgress />
      ) : searchError ? (
        <Typography color="error">{(searchError as Error).message}</Typography>
      ) : (
        <>
          <SearchResults
            repositories={data?.repositories || []}
            onRepositorySelect={(owner, repo) => {
              const { refetch } = getRepository(owner, repo);
              refetch();
            }}
          />
          {data && data.totalCount > 0 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          )}
        </>
      )}
    </Container>
  );
}
