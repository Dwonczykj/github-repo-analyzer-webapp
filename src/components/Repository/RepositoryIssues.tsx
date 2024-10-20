import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Link, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Issue } from '@/services/githubService';

interface RepositoryIssuesProps {
    owner: string;
    repo: string;
}

const RepositoryIssues: React.FC<RepositoryIssuesProps> = ({ owner, repo }) => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/repositories/${owner}/${repo}/issues?state=${filter}`);
                if (!response.ok) throw new Error('Failed to fetch issues');
                const data = await response.json();
                setIssues(data);
            } catch (err) {
                setError('An error occurred while fetching issues.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [owner, repo, filter]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div>
            <Typography variant="h6" gutterBottom>Repository Issues</Typography>
            <FormControl sx={{ mb: 2, minWidth: 120 }}>
                <InputLabel id="issue-filter-label">Filter</InputLabel>
                <Select
                    labelId="issue-filter-label"
                    value={filter}
                    label="Filter"
                    onChange={(e) => setFilter(e.target.value as 'all' | 'open' | 'closed')}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                </Select>
            </FormControl>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>State</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {issues.map((issue) => (
                            <TableRow
                                key={issue.id}
                                sx={{
                                    backgroundColor:
                                        filter === 'all' && issue.state === 'open'
                                            ? 'rgba(0, 255, 255, 0.1)'  // Light turquoise/aqua color
                                            : 'inherit'
                                }}
                            >
                                <TableCell>
                                    <Link href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                        {issue.title}
                                    </Link>
                                </TableCell>
                                <TableCell>{issue.state}</TableCell>
                                <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(issue.updated_at).toLocaleDateString()}</TableCell>
                                <TableCell>{issue.comments}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default RepositoryIssues;
