'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import SearchResults from '@/components/Search/SearchResults';
import { Repository, RepositoryDetails } from '@/services/githubService';
import RepositoryDetailsComponent from '@/components/Repository/RepositoryDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // Prevent empty searches
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/repositories/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data.repositories);
    } catch (err) {
      setError('An error occurred while searching repositories.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleRepoSelect = async (repo: Repository) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/repositories/${repo.owner.login}/${repo.name}`);
      if (!response.ok) throw new Error('Failed to fetch repository details');
      const data = await response.json();
      setSelectedRepo(data.details);
    } catch (err) {
      setError('An error occurred while fetching repository details.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedRepo(null);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        GitHub Repository Search
      </Typography>
      {!selectedRepo && (
        <Box display="flex" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search repositories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading || !searchQuery.trim()} sx={{ ml: 1 }}>
            Search
          </Button>
        </Box>
      )}
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {selectedRepo ? (
            <>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Back to Search Results
              </Button>
              <RepositoryDetailsComponent repository={selectedRepo} />
            </>
          ) : (
            <SearchResults repositories={repositories} onRepoSelect={handleRepoSelect} />
          )}
        </>
      )}
    </Container>
  );
}
