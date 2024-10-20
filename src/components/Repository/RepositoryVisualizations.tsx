import React, { useEffect, useState, useRef } from 'react';
import { RepositoryDetails, GitHubFork } from '@/services/githubService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';

interface RepositoryVisualizationsProps {
    repository: RepositoryDetails;
}

interface GraphData {
    nodes: Array<{ id: string; group: number }>;
    links: Array<{ source: string; target: string }>;
}

const RepositoryVisualizations: React.FC<RepositoryVisualizationsProps> = ({ repository }) => {
    const [commits, setCommits] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [forks, setForks] = useState<GitHubFork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    const fgRef = useRef<ForceGraph2D>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}`);
                if (!response.ok) throw new Error('Failed to fetch repository data');
                const data = await response.json();
                setCommits(data.commits || []);
                setBranches(data.branches || []);
                setForks(data.forks || []);
                processGraphData(data.commits, data.branches);
            } catch (error) {
                console.error('Error fetching repository data:', error);
                setError('Failed to load some repository data. Charts may be incomplete.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [repository]);

    const processGraphData = (commits: any[], branches: any[]) => {
        const nodes = commits.map(commit => ({
            id: commit.sha,
            group: 1
        }));

        const links = commits.map((commit, index) => {
            if (index < commits.length - 1) {
                return {
                    source: commit.sha,
                    target: commits[index + 1].sha
                };
            }
            return null;
        }).filter((link): link is { source: string; target: string } => link !== null);

        branches.forEach(branch => {
            nodes.push({
                id: branch.name,
                group: 2
            });
            if (branch.commit) {
                links.push({
                    source: branch.name,
                    target: branch.commit.sha
                });
            }
        });

        setGraphData({ nodes, links });
    };

    if (loading) {
        return <CircularProgress />;
    }

    const commitData = commits.map((commit) => ({
        date: new Date(commit.commit.author.date).toLocaleDateString(),
        linesChanged: commit.stats ? commit.stats.total : 0,
    })).reverse();

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
                    <Typography variant="h6" gutterBottom>Commit History (Lines Changed)</Typography>
                    <LineChart width={600} height={300} data={commitData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="linesChanged" stroke="#8884d8" name="Lines Changed" />
                    </LineChart>
                </>
            )}

            {graphData.nodes.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom mt={4}>Branch Graph</Typography>
                    <Box height={400} mb={4} sx={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={graphData}
                            nodeAutoColorBy="group"
                            nodeLabel="id"
                            linkDirectionalParticles={2}
                            width={600}
                            height={400}
                        />
                    </Box>
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
        </Box>
    );
};

export default RepositoryVisualizations;
