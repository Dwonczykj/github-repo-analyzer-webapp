'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Popper, Paper, List, ListItemButton, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Chip, Autocomplete, FormControlLabel, Switch } from '@mui/material';
import SearchResults from '@/components/Search/SearchResults';
import { Repository, RepositoryDetails } from '@/services/githubService';
import RepositoryDetailsComponent from '@/components/Repository/RepositoryDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const qualifiers = [
  { name: 'Repository name', example: 'repo:octocat/hello-world' },
  { name: 'Organization / user name', example: 'user:defunkt' },
  { name: 'Language qualifier', example: 'language:javascript' },
  { name: 'Path qualifier', example: 'path:app/models' },
  { name: 'Symbol qualifier', example: 'symbol:function' },
  { name: 'Content qualifier', example: 'content:TODO' },
];

const isQualifierOptions = [
  { value: '', label: 'None', description: '' },
  { value: 'archived', label: 'Archived', description: 'Restricts the search to archived repositories' },
  { value: 'fork', label: 'Fork', description: 'Restricts the search to forked repositories' },
  { value: 'vendored', label: 'Vendored', description: 'Restricts the search to vendored repositories' },
  { value: 'generated', label: 'Generated', description: 'Restricts the search to generated repositories' },
];

interface LanguageOperatorChipProps {
  index: number;
  operator: string;
  onChange: (index: number, newOperator: string) => void;
}

const LanguageOperatorChip: React.FC<LanguageOperatorChipProps> = ({ index, operator, onChange }) => {
  return (
    <Chip
      label={operator}
      onClick={() => {
        const newOperator = operator === 'OR' ? 'AND' : 'OR';
        onChange(index, newOperator);
      }}
      color="primary"
      variant="outlined"
    />
  );
};

const supportedSymbolLanguages = [
  'Bash', 'C', 'C#', 'C++', 'CodeQL', 'Elixir', 'Go', 'JSX', 'Java', 'JavaScript',
  'Lua', 'PHP', 'Protocol Buffers', 'Python', 'R', 'Ruby', 'Rust', 'Scala',
  'Starlark', 'Swift', 'TypeScript'
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQualifiers, setShowQualifiers] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchFields, setAdvancedSearchFields] = useState<Record<string, string>>({});
  const [isQualifier, setIsQualifier] = useState<string>('');
  const [contentQualifier, setContentQualifier] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [languageChips, setLanguageChips] = useState<string[]>([]);
  const [languageOperators, setLanguageOperators] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [symbolQualifier, setSymbolQualifier] = useState('');
  const [isSymbolRegex, setIsSymbolRegex] = useState(false);

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
      if (data.error) {
        setError(data.error.message);
      }
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

  const handleAdvancedSearchOpen = () => {
    setShowAdvancedSearch(true);
  };

  const handleAdvancedSearchClose = () => {
    setShowAdvancedSearch(false);
  };

  const handleLanguageChipChange = (event: React.SyntheticEvent, newValue: string[]) => {
    setLanguageChips(newValue);
    updateLanguageQuery(newValue, languageOperators);
  };

  const handleLanguageOperatorChange = (index: number, newOperator: string) => {
    const newOperators = [...languageOperators];
    newOperators[index] = newOperator;
    setLanguageOperators(newOperators);
    updateLanguageQuery(languageChips, newOperators);
  };

  const updateLanguageQuery = (chips: string[], operators: string[]) => {
    let query = '';
    chips.forEach((chip, index) => {
      if (index > 0) {
        const operator = operators[index - 1] || 'OR';
        if (operator === 'AND') {
          query += ` AND `;
        } else {
          query += ` OR `;
        }
      }
      query += `language:${chip}`;
    });
    setAdvancedSearchFields({
      ...advancedSearchFields,
      language: query
    });
  };

  const handleAdvancedSearchApply = () => {
    const newQuery = Object.entries(advancedSearchFields)
      .filter(([key, value]) => value.trim() !== '' && key !== 'content' && key !== 'language')
      .map(([key, value]) => `${key}:${value}`)
      .join(' ');

    const languageQuery = languageChips.length > 0 ? `(${languageChips.map(lang => `language:${lang}`).join(' OR ')})` : '';
    const isQualifierQuery = isQualifier ? `is:${isQualifier}` : '';
    const contentQualifierQuery = contentQualifier ? `content:${contentQualifier}` : '';

    let symbolQuery = '';
    if (symbolQualifier) {
      const unsupportedLanguages = languageChips.filter(lang => !supportedSymbolLanguages.includes(lang));
      if (unsupportedLanguages.length > 0) {
        setError(`Symbol qualifier requires removal of unsupported languages: ${unsupportedLanguages.join(', ')}`);
        return;
      }
      symbolQuery = isSymbolRegex ? `symbol:/${symbolQualifier}/` : `symbol:${symbolQualifier}`;
    }

    const combinedQuery = `${newQuery} ${languageQuery} ${isQualifierQuery} ${contentQualifierQuery} ${symbolQuery}`.trim();

    setSearchQuery(combinedQuery);
    setShowAdvancedSearch(false);
  };

  const handleLanguageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInput(event.target.value);
  };

  const handleLanguageKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' && languageInput.trim()) {
      event.preventDefault();
      addLanguageChip(languageInput.trim());
    }
  };

  const addLanguageChip = (newChip: string) => {
    const normalizedChip = supportedSymbolLanguages.find(
      lang => lang.toLowerCase() === newChip.toLowerCase()
    ) || newChip;

    if (!languageChips.includes(normalizedChip)) {
      const newChips = [...languageChips, normalizedChip];
      setLanguageChips(newChips);
      setLanguageOperators([...languageOperators, 'OR']);
      updateLanguageQuery(newChips, [...languageOperators, 'OR']);
    }
    setLanguageInput('');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        GitHub Repository Search
      </Typography>
      {!selectedRepo && (
        <Box display="flex" flexDirection="column" mb={2} position="relative">
          <Box display="flex" mb={1}>
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
          </Box>
          <Button variant="outlined" onClick={() => setShowAdvancedSearch(true)} sx={{ alignSelf: 'flex-start' }}>
            Advanced Search
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
      <Dialog open={showAdvancedSearch} onClose={() => setShowAdvancedSearch(false)}>
        <DialogTitle>Advanced Search</DialogTitle>
        <DialogContent>
          {qualifiers.filter(q => q.name !== 'Content qualifier' && q.name !== 'Language qualifier').map((qualifier) => (
            <TextField
              key={qualifier.name}
              fullWidth
              label={qualifier.name}
              variant="outlined"
              margin="normal"
              value={advancedSearchFields[qualifier.name.split(' ')[0].toLowerCase()] || ''}
              onChange={(e) => setAdvancedSearchFields({
                ...advancedSearchFields,
                [qualifier.name.split(' ')[0].toLowerCase()]: e.target.value
              })}
            />
          ))}
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <React.Fragment key={option}>
                  {index > 0 && (
                    <LanguageOperatorChip
                      index={index - 1}
                      operator={languageOperators[index - 1] || 'OR'}
                      onChange={handleLanguageOperatorChange}
                    />
                  )}
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                </React.Fragment>
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Language qualifier"
                placeholder="Type a language and press space"
                fullWidth
                margin="normal"
                value={languageInput}
                onChange={handleLanguageInputChange}
                onKeyDown={handleLanguageKeyDown}
              />
            )}
            value={languageChips}
            onChange={(event, newValue) => {
              if (newValue.length < languageChips.length) {
                setLanguageChips(newValue);
                updateLanguageQuery(newValue, languageOperators.slice(0, newValue.length - 1));
              }
            }}
            inputValue={languageInput}
            onInputChange={(event, newInputValue) => {
              setLanguageInput(newInputValue);
            }}
          />
          <TextField
            fullWidth
            label="Content qualifier"
            variant="outlined"
            margin="normal"
            value={contentQualifier}
            onChange={(e) => setContentQualifier(e.target.value)}
          />
          <Typography variant="caption" color="textSecondary" style={{ fontStyle: 'italic' }}>
            {contentQualifier
              ? `Search restricted to strictly match the content of files and not file paths for "${contentQualifier}"`
              : "Search restricted to strictly match the content of files and not file paths"}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="is-qualifier-label">Is Qualifier</InputLabel>
            <Select
              labelId="is-qualifier-label"
              value={isQualifier}
              label="Is Qualifier"
              onChange={(e) => setIsQualifier(e.target.value as string)}
            >
              {isQualifierOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="textSecondary" style={{ fontStyle: 'italic' }}>
            {isQualifierOptions.find(option => option.value === isQualifier)?.description}
          </Typography>
          <TextField
            fullWidth
            label="Symbol qualifier"
            variant="outlined"
            margin="normal"
            value={symbolQualifier}
            onChange={(e) => setSymbolQualifier(e.target.value)}
            helperText={
              languageChips.some(lang => !supportedSymbolLanguages.includes(lang))
                ? `Symbol search is not supported for: ${languageChips.filter(lang => !supportedSymbolLanguages.includes(lang)).join(', ')}`
                : "Enter symbol to search for. Use regex by toggling the switch below."
            }
            error={symbolQualifier !== '' && languageChips.some(lang => !supportedSymbolLanguages.includes(lang))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isSymbolRegex}
                onChange={(e) => setIsSymbolRegex(e.target.checked)}
                disabled={languageChips.some(lang => !supportedSymbolLanguages.includes(lang))}
              />
            }
            label="Use regex for symbol search"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedSearch(false)}>Cancel</Button>
          <Button onClick={handleAdvancedSearchApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
