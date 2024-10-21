import React, { useState, KeyboardEvent, useEffect } from 'react';
import { RepositoryDetails as RepoDetails } from '@/services/githubService';
import { Box, Typography, Paper, Chip, Link, Button, Dialog, DialogContent, DialogTitle, TextField, Tabs, Tab, Autocomplete, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Star, ForkRight, BugReport, Code, Schedule, Update, Link as LinkIcon, Person, Search } from '@mui/icons-material';
import RepositoryVisualizations from './RepositoryVisualizations';
import RepositoryIssues from './RepositoryIssues';
import RepositorySearch from './RepositorySearch';
import { useDebounce } from 'use-debounce';
import { formatDate } from '@/utils/dateFormatter';
import logger from '@/config/logging';

interface RepositoryDetailsProps {
    repository: RepoDetails;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ repository }) => {
    const [isIssuesDialogOpen, setIsIssuesDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    const [executeSearch, setExecuteSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<any>(null);
    const [tabValue, setTabValue] = useState(0);
    const [languageChips, setLanguageChips] = useState<string[]>([]);
    const [languageInput, setLanguageInput] = useState('');
    const [debouncedLanguageChips] = useDebounce(languageChips, 500);

    const handleOpenIssuesDialog = () => {
        setIsIssuesDialogOpen(true);
    };

    const handleCloseIssuesDialog = () => {
        setIsIssuesDialogOpen(false);
    };

    useEffect(() => {
        if (debouncedSearchQuery || (debouncedLanguageChips.length > 0 && searchQuery.trim() !== '')) {
            setExecuteSearch(true);
        }
    }, [debouncedSearchQuery, debouncedLanguageChips, searchQuery]);

    useEffect(() => {
        if (executeSearch && searchQuery.trim() !== '') {
            performSearch();
        }
    }, [executeSearch, searchQuery]);

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setExecuteSearch(true);
        }
    };

    const performSearch = async () => {
        if (searchQuery.trim() === '') return;
        try {
            const languageQuery = debouncedLanguageChips.length > 0 ? `language:${debouncedLanguageChips.join(' OR language:')}` : '';
            const fullQuery = `${debouncedSearchQuery} ${languageQuery}`.trim();
            const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}/search?q=${encodeURIComponent(fullQuery)}`);
            if (!response.ok) throw new Error('Failed to search repository');
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            logger.error('Error searching repository:', error);
        } finally {
            setExecuteSearch(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleLanguageChipChange = (event: React.SyntheticEvent, newValue: string[]) => {
        setLanguageChips(newValue);
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
        if (!languageChips.includes(newChip)) {
            setLanguageChips([...languageChips, newChip]);
        }
        setLanguageInput('');
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Link href={repository.html_url} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">
                <Typography variant="h4" gutterBottom>
                    {repository.full_name}
                </Typography>
            </Link>
            <Typography variant="body1" paragraph>
                {repository.description}
            </Typography>

            <Box display="flex" flexDirection="column" mb={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search within repository"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                        startAdornment: <Typography color="textSecondary" sx={{ mr: 1 }}>{`repo:${repository.full_name}`}</Typography>
                    }}
                />
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
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
                    onChange={handleLanguageChipChange}
                    inputValue={languageInput}
                    onInputChange={(event, newInputValue) => {
                        setLanguageInput(newInputValue);
                    }}
                />
                <Button
                    variant="contained"
                    onClick={() => setExecuteSearch(true)}
                    sx={{ mt: 1 }}
                    disabled={executeSearch || searchQuery.trim() === ''}
                >
                    {executeSearch ? <CircularProgress size={24} color="inherit" /> : <Search />}
                </Button>
            </Box>

            {searchResults && (
                <Box mt={2} mb={4}>
                    <Typography variant="h6" gutterBottom>Search Results</Typography>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="search results tabs">
                        <Tab label={`Files (${searchResults.files.length})`} />
                        <Tab label={`Issues (${searchResults.issues.length})`} />
                        <Tab label={`Commits (${searchResults.commits.length})`} />
                    </Tabs>
                    <TabPanel value={tabValue} index={0}>
                        <RepositorySearch type="files" items={searchResults.files} repository={repository} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <RepositorySearch type="issues" items={searchResults.issues} repository={repository} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <RepositorySearch type="commits" items={searchResults.commits} repository={repository} />
                    </TabPanel>
                </Box>
            )}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Star sx={{ mr: 1 }} />
                        <Typography variant="body2">{repository.stargazers_count} Stars</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <ForkRight sx={{ mr: 1 }} />
                        <Typography variant="body2">{repository.forks_count} Forks</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <BugReport sx={{ mr: 1 }} />
                        <Button onClick={handleOpenIssuesDialog} sx={{ p: 0, minWidth: 0, textTransform: 'none' }}>
                            <Typography variant="body2">{repository.open_issues_count} Open Issues</Typography>
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Code sx={{ mr: 1 }} />
                        <Typography variant="body2">Language: {repository.language || 'Not specified'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Schedule sx={{ mr: 1 }} />
                        <Typography variant="body2">Created: {formatDate(repository.created_at)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Update sx={{ mr: 1 }} />
                        <Typography variant="body2">Updated: {formatDate(repository.updated_at)}</Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    {repository.license && (
                        <Chip label={`License: ${repository.license.name}`} sx={{ mb: 1 }} />
                    )}
                    <Link href={repository.owner.html_url} target="_blank" rel="noopener noreferrer" underline="none">
                        <Chip
                            icon={<Person />}
                            label={`Owner: ${repository.owner.login}`}
                            sx={{ mb: 1, ml: { xs: 0, md: 1 }, cursor: 'pointer' }}
                            clickable
                        />
                    </Link>
                    <Box display="flex" alignItems="center" mb={1} mt={1}>
                        <LinkIcon sx={{ mr: 1 }} />
                        <Link href={repository.html_url} target="_blank" rel="noopener noreferrer" underline="hover">
                            <Typography variant="body2">Repository URL</Typography>
                        </Link>
                    </Box>
                </Grid>
            </Grid>

            <RepositoryVisualizations repository={repository} />

            <Dialog open={isIssuesDialogOpen} onClose={handleCloseIssuesDialog} maxWidth="md" fullWidth>
                <DialogTitle>Issues for {repository.full_name}</DialogTitle>
                <DialogContent>
                    <RepositoryIssues owner={repository.owner.login} repo={repository.name} />
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default RepositoryDetails;
