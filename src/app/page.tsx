'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Popper, Paper, List, ListItemButton, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Chip, Autocomplete, FormControlLabel, Switch, IconButton, InputAdornment } from '@mui/material';
import SearchResults from '@/components/Search/SearchResults';
import { Repository, RepositoryDetails } from '@/services/githubService';
import RepositoryDetailsComponent from '@/components/Repository/RepositoryDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';

const qualifiers = [
  { name: 'Repository name', example: 'repo:octocat/hello-world' },
  { name: 'Organization name', example: 'org:bcorp' },
  { name: 'User name', example: 'user:defunkt' },
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
  const [freeText, setFreeText] = useState('');

  useEffect(() => {
    if (searchQuery.endsWith(' :') || searchQuery === (':')) {
      setShowQualifiers(true);
      setAnchorEl(inputRef.current);
    } else {
      setShowQualifiers(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Initialize freeText with the current searchQuery when component mounts
    setFreeText(searchQuery);
  }, []);

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

  const handleQualifierSelect = (name: string, example: string) => {
    const [prefix, value] = example.split(':');
    const newQuery = `${searchQuery}${prefix}:${value} `;
    setSearchQuery(newQuery);
    setShowQualifiers(false);
    inputRef.current?.focus();
  };

  const parseSearchQuery = (query: string) => {
    const qualifierRegex = /([\w-]+):("[^"]*"|[^\s]+)/g;
    const qualifiers: { type: 'qualifier' | 'free'; key?: string; value: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = qualifierRegex.exec(query)) !== null) {
      if (lastIndex < match.index) {
        qualifiers.push({ type: 'free', value: query.slice(lastIndex, match.index).trim() });
      }
      qualifiers.push({ type: 'qualifier', key: match[1], value: match[2].replace(/^"|"$/g, '') });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < query.length) {
      qualifiers.push({ type: 'free', value: query.slice(lastIndex).trim() });
    }

    return qualifiers;
  };

  const handleAdvancedSearchOpen = () => {
    const parsedQuery = parseSearchQuery(searchQuery);
    const freeTextParts = parsedQuery
      .filter(part => part.type === 'free')
      .map(part => part.value);
    setFreeText(freeTextParts.join(' ').trim());

    // Set other qualifiers based on the parsed query
    const newAdvancedSearchFields: Record<string, string> = {};
    const newLanguageChips: string[] = [];
    parsedQuery.forEach(part => {
      if (part.type === 'qualifier' && part.key) {
        switch (part.key) {
          case 'language':
            newLanguageChips.push(part.value);
            break;
          case 'is':
            setIsQualifier(part.value);
            break;
          case 'content':
            setContentQualifier(part.value);
            break;
          case 'symbol':
            setSymbolQualifier(part.value);
            break;
          // case 'repo':
          //   setRepo(part.value);
          //   break;
          // case 'org':
          //   setSymbolQualifier(part.value);
          //   break;
          // case 'user':
          //   setSymbolQualifier(part.value);
          //   break;
          default:
            newAdvancedSearchFields[part.key] = part.value;
        }
      }
    });

    setAdvancedSearchFields(newAdvancedSearchFields);
    setLanguageChips(newLanguageChips);
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
    const qualifiers = Object.entries(advancedSearchFields)
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

    const combinedQualifiers = [qualifiers, languageQuery, isQualifierQuery, contentQualifierQuery, symbolQuery]
      .filter(q => q !== '')
      .join(' ');

    const newQuery = freeText.trim() !== ''
      ? `${freeText} ${combinedQualifiers}`.trim()
      : combinedQualifiers;

    setSearchQuery(newQuery);
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

  const resetQualifiers = () => {
    setLanguageChips([]);
    setLanguageOperators([]);
    setIsQualifier('');
    setContentQualifier('');
    setSymbolQualifier('');
    setIsSymbolRegex(false);
    setAdvancedSearchFields({
      repo: '',
      user: '',
      org: '',
      path: '',
      // ... any other fields you have in advancedSearchFields
    });
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Updated regex patterns
    const languageQualifierRegex = /\(?language:([^()]+)\)?/g;
    const symbolQualifierRegex = /symbol:("[^"]+"|[^\s]+)/;
    const contentQualifierRegex = /content:("[^"]+"|[^\s]+)/;
    const isQualifierRegex = /\bis:(\S+)/;
    const repoQualifierRegex = /repo:([^\s]+)/;
    const userQualifierRegex = /(?:user):([^\s]+)/;
    const orgQualifierRegex = /(?:org):([^\s]+)/;
    const pathQualifierRegex = /path:("[^"]+"|[^\s]+)/;

    // Parse language qualifiers
    const languageMatches: string[] = [];
    let match;
    while ((match = languageQualifierRegex.exec(newQuery)) !== null) {
      languageMatches.push(match[1]);
    }

    if (languageMatches.length > 0) {
      const newLanguageChips = languageMatches.flatMap(match =>
        match.split(/\s+(?:OR|AND)\s+/).map(lang => lang.trim())
      );
      setLanguageChips(newLanguageChips);
      updateLanguageQuery(newLanguageChips, languageOperators.slice(0, newLanguageChips.length - 1));
    } else {
      setLanguageChips([]);
    }

    // Parse symbol qualifier
    const symbolMatch = newQuery.match(symbolQualifierRegex);
    setSymbolQualifier(symbolMatch ? symbolMatch[1].replace(/^"|"$/g, '') : '');

    // Parse content qualifier
    const contentMatch = newQuery.match(contentQualifierRegex);
    setContentQualifier(contentMatch ? contentMatch[1].replace(/^"|"$/g, '') : '');

    // Parse is qualifier
    const isMatch = newQuery.match(isQualifierRegex);
    setIsQualifier(isMatch ? isMatch[1] : '');

    // Parse repository qualifier
    const repoMatch = newQuery.match(repoQualifierRegex);
    setAdvancedSearchFields(prev => ({
      ...prev,
      repo: repoMatch ? repoMatch[1] : ''
    }));

    // Parse user/org qualifier
    const userMatch = newQuery.match(userQualifierRegex);
    if (userMatch) {
      const [fullMatch, value] = userMatch;
      setAdvancedSearchFields(prev => ({
        ...prev,
        ['user']: value
      }));
    } else {
      setAdvancedSearchFields(prev => ({
        ...prev,
        user: ''
      }));
    }
    const orgMatch = newQuery.match(orgQualifierRegex);
    if (orgMatch) {
      const [fullMatch, value] = orgMatch;
      const key = fullMatch.startsWith('org:') ? 'org' : 'org';
      setAdvancedSearchFields(prev => ({
        ...prev,
        ['org']: value
      }));
    } else {
      setAdvancedSearchFields(prev => ({
        ...prev,
        org: ''
      }));
    }

    // Parse path qualifier
    const pathMatch = newQuery.match(pathQualifierRegex);
    setAdvancedSearchFields(prev => ({
      ...prev,
      path: pathMatch ? pathMatch[1].replace(/^"|"$/g, '') : ''
    }));

    // Check for malformed query
    const openParenCount = (newQuery.match(/\(/g) || []).length;
    const closeParenCount = (newQuery.match(/\)/g) || []).length;
    if (openParenCount !== closeParenCount) {
      resetQualifiers();
    }

    // Update free text
    const freeText = newQuery.replace(/\([^)]*\)|[\w-]+:("[^"]*"|[^\s]+)/g, '').trim();
    setFreeText(freeText);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    resetQualifiers();
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
              onChange={handleSearchQueryChange}
              onKeyPress={handleKeyPress}
              inputRef={inputRef}
              title="Type ':' to see search filters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading || !searchQuery.trim()} sx={{ ml: 1 }}>
              Search
            </Button>
          </Box>
          <Button variant="outlined" onClick={() => setShowAdvancedSearch(true)} sx={{ alignSelf: 'flex-start' }}>
            Advanced Search
          </Button>
          {/* <Popper open={showQualifiers} anchorEl={anchorEl} placement="bottom-start">
            <Paper>
              <List>
                {qualifiers.map((qualifier) => (
                  <ListItemButton
                    key={qualifier.name}
                    onClick={() => handleQualifierSelect(qualifier.name.split(' ')[0].toLowerCase(), qualifier.example)}
                  >
                    <ListItemText primary={qualifier.example} secondary={qualifier.example} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popper> */}
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
      <Dialog open={showAdvancedSearch} onClose={handleAdvancedSearchClose}>
        <DialogTitle>Advanced Search</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Free Text Search"
            variant="outlined"
            margin="normal"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
          {qualifiers.filter(q => !['Content qualifier', 'Language qualifier', 'Symbol qualifier'].includes(q.name)).map((qualifier) => (
            <TextField
              key={qualifier.name}
              fullWidth
              label={qualifier.name}
              variant="outlined"
              margin="normal"
              value={advancedSearchFields[qualifier.example.split(':')[0].toLowerCase()] || ''}
              onChange={(e) => setAdvancedSearchFields({
                ...advancedSearchFields,
                [qualifier.example.split(':')[0].toLowerCase()]: e.target.value
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
          <Button onClick={handleAdvancedSearchClose}>Cancel</Button>
          <Button onClick={handleAdvancedSearchApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
