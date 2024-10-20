import React, { useEffect, useState } from 'react';
import { RepositoryDetails, GitHubFork } from '@/services/githubService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

interface RepositoryVisualizationsProps {
    repository: RepositoryDetails;
}

const RepositoryVisualizations: React.FC<RepositoryVisualizationsProps> = ({ repository }) => {
    const [commits, setCommits] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [forks, setForks] = useState<GitHubFork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}`);
                if (!response.ok) throw new Error('Failed to fetch repository data');
                const data = await response.json();
                setCommits(data.commits || []);
                setBranches(data.branches || []);
                setForks(data.forks || []);
            } catch (error) {
                console.error('Error fetching repository data:', error);
                setError('Failed to load some repository data. Charts may be incomplete.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [repository]);

    if (loading) {
        return <CircularProgress />;
    }

    const commitData = commits.map((commit, index) => ({
        date: new Date(commit.commit.author.date).toLocaleDateString(),
        commits: commits.length - index,
    }));

    const forkData = forks.map((fork) => ({
        name: fork.owner.login,
        value: fork.stargazers_count,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <Box mt={4}>
            <Typography variant="h5" gutterBottom>Repository Visualizations</Typography>
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {commitData.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom>Commit History</Typography>
                    <LineChart width={600} height={300} data={commitData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="commits" stroke="#8884d8" />
                    </LineChart>
                </>
            )}

            {forks.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom mt={4}>Top Forks by Stars</Typography>
                    <PieChart width={400} height={400}>
                        <Pie
                            data={forkData.slice(0, 5)}
                            cx={200}
                            cy={200}
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                        >
                            {forkData.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </>
            )}

            {branches.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom mt={4}>Branches</Typography>
                    <BarChart width={600} height={300} data={branches}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="name" fill="#8884d8" />
                    </BarChart>
                </>
            )}
        </Box>
    );
};

export default RepositoryVisualizations;
