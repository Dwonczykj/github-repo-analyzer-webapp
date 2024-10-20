import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} display="flex" alignItems="center" mb={2}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search GitHub repositories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" startIcon={<SearchIcon />} style={{ marginLeft: '1rem' }}>
                Search
            </Button>
        </Box>
    );
};

export default SearchBar;