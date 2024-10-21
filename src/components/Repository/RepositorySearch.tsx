import React from 'react';
import { List, ListItem, ListItemText, Link, Typography } from '@mui/material';

interface RepositorySearchProps {
    type: 'files' | 'issues' | 'commits';
    items: any[];
}

const RepositorySearch: React.FC<RepositorySearchProps> = ({ type, items }) => {
    const renderItem = (item: any) => {
        switch (type) {
            case 'files':
                return (
                    <ListItem key={item.sha}>
                        <ListItemText
                            primary={<Link href={item.html_url} target="_blank" rel="noopener noreferrer">{item.path}</Link>}
                            secondary={`Last updated: ${new Date(item.repository.updated_at).toLocaleDateString()}`}
                        />
                    </ListItem>
                );
            case 'issues':
                return (
                    <ListItem key={item.id}>
                        <ListItemText
                            primary={<Link href={item.html_url} target="_blank" rel="noopener noreferrer">{item.title}</Link>}
                            secondary={`#${item.number} opened on ${new Date(item.created_at).toLocaleDateString()} by ${item.user.login}`}
                        />
                    </ListItem>
                );
            case 'commits':
                return (
                    <ListItem key={item.sha}>
                        <ListItemText
                            primary={<Link href={item.html_url} target="_blank" rel="noopener noreferrer">{item.commit.message}</Link>}
                            secondary={`${item.sha.substring(0, 7)} committed on ${new Date(item.commit.author.date).toLocaleDateString()} by ${item.commit.author.name}`}
                        />
                    </ListItem>
                );
            default:
                return null;
        }
    };

    return (
        <List>
            {items.length > 0 ? (
                items.map(renderItem)
            ) : (
                <Typography>No results found.</Typography>
            )}
        </List>
    );
};

export default RepositorySearch;
