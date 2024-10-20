'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Popper, Paper, List, ListItemButton, ListItemText } from '@mui/material';
import SearchResults from '@/components/Search/SearchResults';
import { Repository, RepositoryDetails } from '@/services/githubService';
import RepositoryDetailsComponent from '@/components/Repository/RepositoryDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const qualifiers = [
  { name: 'Repository qualifier', example: 'repo:octocat/hello-world' },
  { name: 'Organization and user qualifiers', example: 'user:defunkt' },
  { name: 'Language qualifier', example: 'language:javascript' },
  { name: 'Path qualifier', example: 'path:app/models' },
  { name: 'Symbol qualifier', example: 'symbol:function' },
  { name: 'Content qualifier', example: 'content:TODO' },
  { name: 'Is qualifier', example: 'is:public' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQualifiers, setShowQualifiers] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.endsWith(':')) {
      setShowQualifiers(true);
      setAnchorEl(inputRef.current);
    } else {
      setShowQualifiers(false);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
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

  const handleQualifierSelect = (qualifier: string, example: string) => {
    const [prefix, value] = example.split(':');
    const newQuery = `${searchQuery}${prefix}:${value} `;
    setSearchQuery(newQuery);
    setShowQualifiers(false);
    inputRef.current?.focus();
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        GitHub Repository Search
      </Typography>
      {!selectedRepo && (
        <Box display="flex" mb={2} position="relative">
          <TextField
            fullWidth
            variant="outlined"
            label='Search repositories. (":" for search qualifiers...)'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
            title="Type ':' to see search filters"
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading || !searchQuery.trim()} sx={{ ml: 1 }}>
            Search
          </Button>
          <Popper open={showQualifiers} anchorEl={anchorEl} placement="bottom-start">
            <Paper>
              <List>
                {qualifiers.map((qualifier) => (
                  <ListItemButton
                    key={qualifier.name}
                    onClick={() => handleQualifierSelect(qualifier.name.split(' ')[0].toLowerCase(), qualifier.example)}
                  >
                    <ListItemText primary={qualifier.name} secondary={qualifier.example} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popper>
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
