import React, { useState, useRef, useEffect } from 'react';
import { List, ListItemButton, ListItemText, Link, Typography, Popover, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { formatDate } from '@/utils/dateFormatter';
import { GithubFile, GithubCommit, Issue, TextMatch, GithubFileDetail, RepositoryDetails } from '@/services/githubService';

interface RepositorySearchProps {
    type: 'files' | 'issues' | 'commits';
    items: (GithubFile | Issue | GithubCommit)[];
    repository: RepositoryDetails;
}

const RepositorySearch: React.FC<RepositorySearchProps> = ({ type, items, repository }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<GithubFile | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const contentRef = useRef<HTMLPreElement>(null);
    const [aiSummaryAnchorEl, setAiSummaryAnchorEl] = useState<HTMLElement | null>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const handleFileClick = async (event: React.MouseEvent<HTMLElement>, file: GithubFile) => {
        setAnchorEl(event.currentTarget);
        setSelectedFile(file);
        try {
            const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}/file?url=${encodeURIComponent(file.url)}`);
            if (!response.ok) throw new Error('Failed to fetch file content');
            const data: GithubFileDetail = await response.json();
            const decodedContent = atob(data.content);
            setFileContent(decodedContent);
        } catch (error) {
            console.error('Error fetching file content:', error);
            setFileContent(null);
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setSelectedFile(null);
        setFileContent(null);
    };

    useEffect(() => {
        if (contentRef.current && fileContent && selectedFile?.text_matches) {
            const firstMatch = selectedFile.text_matches[0];
            const matchStart = fileContent.indexOf(firstMatch.fragment);
            if (matchStart !== -1) {
                const lineHeight = 20; // Adjust this value based on your font size and line height
                const scrollPosition = Math.max(0, matchStart * lineHeight - 100); // 100px offset from the top
                contentRef.current.scrollTop = scrollPosition;
            }
        }
    }, [fileContent, selectedFile]);

    const renderHighlightedContent = (content: string, text_matches: TextMatch[]) => {
        let lastIndex = 0;
        let matchIndex = 0;
        const elements: React.ReactNode[] = [];
        for (const text_match of text_matches) {
            const fragmentStart = content.indexOf(text_match.fragment);
            if (fragmentStart === -1) {
                console.warn(`unable to locate fragmentStart: ${text_match.fragment} in content`);
                continue;
            }
            console.debug(`fragmentStart: ${fragmentStart} offset from start of content`);

            for (const match of text_match.matches) {
                matchIndex += 1;
                const [_start, _end] = match.indices;
                const start = _start + fragmentStart;
                const end = _end + fragmentStart;

                if (start > lastIndex) {
                    elements.push(<span key={`normal-${matchIndex}`}>{content.slice(lastIndex, start)}</span>);
                }
                elements.push(
                    <span key={`highlight-${matchIndex}`} style={{ backgroundColor: 'rgba(64, 224, 208, 0.5)' }}>
                        {content.slice(start, end)}
                    </span>
                );
                lastIndex = end;
            }

            if (lastIndex < content.length) {
                elements.push(<span key="normal-last">{content.slice(lastIndex)}</span>);
            }
        }
        return elements;
    };

    const renderItem = (item: GithubFile | Issue | GithubCommit) => {
        switch (type) {
            case 'files':
                const file = item as GithubFile;
                return (
                    <ListItemButton key={file.sha} onClick={(e) => handleFileClick(e, file)}>
                        <ListItemText
                            primary={<Link href={file.html_url} target="_blank" rel="noopener noreferrer">{file.path}</Link>}
                            secondary={`Matches: ${file.text_matches?.flatMap(m => m.matches.length).reduce((a, b) => a + b, 0)}`}
                        />
                    </ListItemButton>
                );
            case 'issues':
                const issue = item as Issue;
                return (
                    <ListItemButton key={issue.id}>
                        <ListItemText
                            primary={<Link href={issue.html_url} target="_blank" rel="noopener noreferrer">{issue.title}</Link>}
                            secondary={`#${issue.number} opened on ${formatDate(issue.created_at)} by ${issue.user.login}`}
                        />
                    </ListItemButton>
                );
            case 'commits':
                const commit = item as GithubCommit;
                return (
                    <ListItemButton key={commit.sha}>
                        <ListItemText
                            primary={<Link href={commit.html_url} target="_blank" rel="noopener noreferrer">{commit.commit.message}</Link>}
                            secondary={`${commit.sha.substring(0, 7)} committed on ${formatDate(commit.commit.author.date)} by ${commit.commit.author.name}`}
                        />
                    </ListItemButton>
                );
            default:
                return null;
        }
    };

    const handleAiSummaryClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAiSummaryAnchorEl(event.currentTarget);
        if (!fileContent) return;

        try {
            const response = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: fileContent }),
            });

            if (!response.ok) throw new Error('Failed to get AI summary');
            const data = await response.json();
            setAiSummary(data.summary);
        } catch (error) {
            console.error('Error getting AI summary:', error);
            setAiSummary('Failed to generate summary');
        }
    };

    const handleAiSummaryClose = () => {
        setAiSummaryAnchorEl(null);
        setAiSummary(null);
    };

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    return (
        <>
            <List>
                {items.length > 0 ? (
                    items.map(renderItem)
                ) : (
                    <Typography>No results found.</Typography>
                )}
            </List>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        width: isSmallScreen ? '95vw' : isMediumScreen ? '80vw' : '60vw',
                        maxWidth: 'none',
                    },
                }}
            >
                {selectedFile && (
                    <Box sx={{ p: 2, maxHeight: '80vh', overflow: 'auto' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
                                {selectedFile.path}
                            </Typography>
                            <IconButton onClick={handleAiSummaryClick}>
                                <SmartToyIcon />
                            </IconButton>
                        </Box>
                        <pre ref={contentRef} style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '12px' }}>
                            {fileContent ? (
                                renderHighlightedContent(fileContent, selectedFile.text_matches || [])
                            ) : (
                                'Loading file content...'
                            )}
                        </pre>
                    </Box>
                )}
            </Popover>
            <Popover
                open={Boolean(aiSummaryAnchorEl)}
                anchorEl={aiSummaryAnchorEl}
                onClose={handleAiSummaryClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>AI Summary</Typography>
                    {aiSummary ? (
                        <Typography>{aiSummary}</Typography>
                    ) : (
                        <Typography>Generating summary...</Typography>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default RepositorySearch;
