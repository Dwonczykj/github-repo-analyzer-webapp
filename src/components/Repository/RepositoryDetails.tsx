import React, { useState, KeyboardEvent, useEffect } from 'react';
import { RepositoryDetails as RepoDetails } from '@/services/githubService';
import { Box, Typography, Paper, Grid, Chip, Link, Button, Dialog, DialogContent, DialogTitle, TextField, Tabs, Tab } from '@mui/material';
import { Star, ForkRight, BugReport, Code, Schedule, Update, Link as LinkIcon, Person, Search } from '@mui/icons-material';
import RepositoryVisualizations from './RepositoryVisualizations';
import RepositoryIssues from './RepositoryIssues';
import RepositorySearch from './RepositorySearch';
import { useDebounce } from 'use-debounce';

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

    const handleOpenIssuesDialog = () => {
        setIsIssuesDialogOpen(true);
    };

    const handleCloseIssuesDialog = () => {
        setIsIssuesDialogOpen(false);
    };

    useEffect(() => {
        if (debouncedSearchQuery) {
            setExecuteSearch(true);
        }
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (executeSearch) {
            performSearch();
        }
    }, [executeSearch]);

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setExecuteSearch(true);
        }
    };

    const performSearch = async () => {
        try {
            const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
            if (!response.ok) throw new Error('Failed to search repository');
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching repository:', error);
        } finally {
            setExecuteSearch(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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

            <Box display="flex" mb={2}>
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
                <Button variant="contained" onClick={() => setExecuteSearch(true)} sx={{ ml: 1 }}>
                    <Search />
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
                        <RepositorySearch type="files" items={searchResults.files} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <RepositorySearch type="issues" items={searchResults.issues} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <RepositorySearch type="commits" items={searchResults.commits} />
                    </TabPanel>
                </Box>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
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
                <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Code sx={{ mr: 1 }} />
                        <Typography variant="body2">Language: {repository.language || 'Not specified'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Schedule sx={{ mr: 1 }} />
                        <Typography variant="body2">Created: {new Date(repository.created_at).toLocaleDateString()}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Update sx={{ mr: 1 }} />
                        <Typography variant="body2">Updated: {new Date(repository.updated_at).toLocaleDateString()}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
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
