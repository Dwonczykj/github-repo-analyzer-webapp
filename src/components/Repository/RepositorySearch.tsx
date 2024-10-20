import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, Link, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RepositoryDetails } from '@/services/githubService';

interface RepositorySearchProps {
    repository: RepositoryDetails;
    query: string;
}

interface SearchResult {
    files: any[];
    issues: any[];
    commits: any[];
}

const RepositorySearch: React.FC<RepositorySearchProps> = ({ repository, query }) => {
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setResults(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Failed to fetch search results');
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError('An error occurred while searching the repository.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [repository, query]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!results) return null;

    return (
        <>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Files ({results.files.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {results.files.map((file, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Link href={file.html_url} target="_blank" rel="noopener noreferrer">{file.path}</Link>}
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Issues ({results.issues.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {results.issues.map((issue, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Link href={issue.html_url} target="_blank" rel="noopener noreferrer">{issue.title}</Link>}
                                    secondary={`#${issue.number} opened on ${new Date(issue.created_at).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Commits ({results.commits.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {results.commits.map((commit, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Link href={commit.html_url} target="_blank" rel="noopener noreferrer">{commit.commit.message}</Link>}
                                    secondary={`${commit.sha.substring(0, 7)} on ${new Date(commit.commit.author.date).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default RepositorySearch;
