import React from 'react';
import { RepositoryDetails as RepoDetails } from '@/services/githubService';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { Star, ForkRight, BugReport, Code, Schedule, Update } from '@mui/icons-material';
import RepositoryVisualizations from './RepositoryVisualizations';

interface RepositoryDetailsProps {
    repository: RepoDetails;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ repository }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h4" gutterBottom>
                {repository.full_name}
            </Typography>
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
                        <Typography variant="body2">{repository.open_issues_count} Open Issues</Typography>
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
                    <Chip label={`Owner: ${repository.owner.login}`} sx={{ mb: 1, ml: { xs: 0, md: 1 } }} />
                </Grid>
            </Grid>

            <RepositoryVisualizations repository={repository} />
        </Paper>
    );
};

export default RepositoryDetails;
