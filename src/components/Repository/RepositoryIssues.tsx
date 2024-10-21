import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Link, Select, MenuItem, FormControl, InputLabel, TableSortLabel
} from '@mui/material';
import { Issue } from '@/services/githubService';
import { formatDate, calculateDuration } from '@/utils/dateFormatter';
import logger from '@/config/logging';

interface RepositoryIssuesProps {
    owner: string;
    repo: string;
}

type SortColumn = 'title' | 'state' | 'created_at' | 'updated_at' | 'comments' | 'resolution_time';
type SortDirection = 'asc' | 'desc';

const parseDate = (date: undefined | Date | string | number): Date | null => {
    if (date === undefined) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string' || typeof date === 'number') {
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    return null;
};

const RepositoryIssues: React.FC<RepositoryIssuesProps> = ({ owner, repo }) => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
                logger.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [owner, repo, filter]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortIssues = (a: Issue, b: Issue): number => {
        if (!sortColumn) return 0;

        let valueA: any, valueB: any;

        switch (sortColumn) {
            case 'title':
            case 'state':
                valueA = a[sortColumn].toLowerCase();
                valueB = b[sortColumn].toLowerCase();
                break;
            case 'created_at':
            case 'updated_at':
                valueA = parseDate(a[sortColumn]);
                valueB = parseDate(b[sortColumn]);
                break;
            case 'comments':
                valueA = a[sortColumn];
                valueB = b[sortColumn];
                break;
            case 'resolution_time':
                valueA = a.state === 'closed' && a.closed_at ? new Date(a.closed_at).getTime() - new Date(a.created_at).getTime() : Infinity;
                valueB = b.state === 'closed' && b.closed_at ? new Date(b.closed_at).getTime() - new Date(b.created_at).getTime() : Infinity;
                break;
            default:
                return 0;
        }

        if (valueA === null && valueB === null) return 0;
        if (valueA === null) return sortDirection === 'asc' ? 1 : -1;
        if (valueB === null) return sortDirection === 'asc' ? -1 : 1;

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    };

    const sortedIssues = [...issues].sort(sortIssues);

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
                            {['Title', 'State', 'Created At', 'Updated At', 'Comments', 'Resolution Time'].map((header, index) => (
                                <TableCell key={index}>
                                    <TableSortLabel
                                        active={sortColumn === header.toLowerCase().replace(' ', '_') as SortColumn}
                                        direction={sortColumn === header.toLowerCase().replace(' ', '_') as SortColumn ? sortDirection : 'asc'}
                                        onClick={() => handleSort(header.toLowerCase().replace(' ', '_') as SortColumn)}
                                    >
                                        {header}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedIssues.map((issue) => (
                            <TableRow
                                key={issue.id}
                                sx={{
                                    backgroundColor:
                                        filter === 'all' && issue.state === 'open'
                                            ? 'rgba(0, 255, 255, 0.1)'
                                            : 'inherit'
                                }}
                            >
                                <TableCell>
                                    <Link href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                        {issue.title}
                                    </Link>
                                </TableCell>
                                <TableCell>{issue.state}</TableCell>
                                <TableCell>{formatDate(issue.created_at)}</TableCell>
                                <TableCell>{formatDate(issue.updated_at)}</TableCell>
                                <TableCell>{issue.comments}</TableCell>
                                <TableCell>
                                    {issue.state === 'closed' && issue.closed_at
                                        ? calculateDuration(new Date(issue.created_at), new Date(issue.closed_at))
                                        : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default RepositoryIssues;
