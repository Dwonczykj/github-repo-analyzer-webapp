import React from 'react';
import { Repository } from '@/services/githubService';
import { List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';

interface SearchResultsProps {
    repositories: Repository[];
    onRepoSelect: (repo: Repository) => void;
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const SearchResults: React.FC<SearchResultsProps> = ({ repositories, onRepoSelect }) => {
    return (
        <Box>
            <List>
                {repositories.map((repo) => (
                    <ListItem key={repo.id} disablePadding>
                        <ListItemButton onClick={() => onRepoSelect(repo)}>
                            <ListItemText
                                primary={repo.full_name}
                                secondary={
                                    <React.Fragment>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {repo.description}
                                        </Typography>
                                        {` — Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}, Language: ${repo.language}, Updated: ${formatDate(repo.updated_at)}` + (repo.topics.length > 0 ? `, Topics: ${repo.topics.join(', ')}` : '')}
                                    </React.Fragment>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default SearchResults;
