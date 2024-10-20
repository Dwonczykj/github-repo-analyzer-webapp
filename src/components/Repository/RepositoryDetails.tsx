import React, { useState } from 'react';
import { RepositoryDetails as RepoDetails } from '@/services/githubService';
import { Box, Typography, Paper, Grid, Chip, Link, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Star, ForkRight, BugReport, Code, Schedule, Update, Link as LinkIcon, Person } from '@mui/icons-material';
import RepositoryVisualizations from './RepositoryVisualizations';
import RepositoryIssues from './RepositoryIssues';

interface RepositoryDetailsProps {
    repository: RepoDetails;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ repository }) => {
    const [isIssuesDialogOpen, setIsIssuesDialogOpen] = useState(false);

    const handleOpenIssuesDialog = () => {
        setIsIssuesDialogOpen(true);
    };

    const handleCloseIssuesDialog = () => {
        setIsIssuesDialogOpen(false);
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
