import React from 'react';
import { Box, Typography } from '@mui/material';

interface CommitGraphProps {
    commits: any[];
}

const CommitGraph: React.FC<CommitGraphProps> = ({ commits }) => {
    const maxCommits = 50; // Limit the number of commits to display
    const displayCommits = commits.slice(0, maxCommits);

    return (
        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', py: 2 }}>
            {displayCommits.map((commit, index) => (
                <Box key={commit.sha} sx={{ display: 'inline-block', mr: 2, verticalAlign: 'top' }}>
                    <Box
                        sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#1976d2',
                            display: 'inline-block',
                            mr: 1,
                        }}
                    />
                    <Typography variant="body2" sx={{ display: 'inline-block' }}>
                        {commit.commit.message.split('\n')[0].substring(0, 30)}
                        {commit.commit.message.split('\n')[0].length > 30 ? '...' : ''}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(commit.commit.author.date).toLocaleDateString()}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default CommitGraph;
