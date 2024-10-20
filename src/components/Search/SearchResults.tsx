import React from 'react';
import { Repository } from '@/services/githubService';
import { List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';

interface SearchResultsProps {
    repositories: Repository[];
    onRepoSelect: (repo: Repository) => void;
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
                                        {` — Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}`}
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
