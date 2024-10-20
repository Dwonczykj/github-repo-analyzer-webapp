import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';
import { Repository } from '../../services/githubService';

interface SearchResultsProps {
    repositories: Repository[];
    onRepositorySelect: (owner: string, repo: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ repositories, onRepositorySelect }) => {
    if (repositories.length === 0) return <Typography>No repositories found.</Typography>;

    return (
        <List>
            {repositories.map((repo) => (
                <ListItem key={repo.id} disablePadding>
                    <ListItemButton onClick={() => onRepositorySelect(repo.owner.login, repo.name)}>
                        <ListItemText
                            primary={repo.name}
                            secondary={
                                <Box>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        {repo.description}
                                    </Typography>
                                    <br />
                                    <Typography component="span" variant="body2">
                                        Stars: {repo.stargazers_count} | Forks: {repo.forks_count}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default SearchResults;
