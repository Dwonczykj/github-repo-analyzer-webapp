import React, { useEffect, useState } from 'react';
import { RepositoryDetails, GitHubFork, Issue } from '@/services/githubService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { formatDate } from '@/utils/dateFormatter';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import logger from '@/config/logging';

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), { ssr: false });
const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), { ssr: false });

interface RepositoryVisualizationsProps {
    repository: RepositoryDetails;
}

interface BranchNode {
    name: string;
    children: BranchNode[];
}

const StyledNode = styled.div`
    padding: 5px;
    border-radius: 8px;
    display: inline-block;
    border: 1px solid #ccc;
`;

const MAX_DEPTH = 5; // Maximum depth for branch visualization

const BranchStructure: React.FC<{ branchTree: BranchNode | null }> = ({ branchTree }) => {
    const renderBranchNode = (node: BranchNode, depth: number = 0) => {
        if (depth >= MAX_DEPTH || node.children.length === 0) {
            return <TreeNode label={<StyledNode>{node.name}</StyledNode>} />;
        }
        return (
            <TreeNode label={<StyledNode>{node.name}</StyledNode>}>
                {node.children.map((child, index) => (
                    <React.Fragment key={index}>{renderBranchNode(child, depth + 1)}</React.Fragment>
                ))}
            </TreeNode>
        );
    };

    if (!branchTree) return null;

    return (
        <Tree
            lineWidth={'2px'}
            lineColor={'#bbb'}
            lineBorderRadius={'10px'}
            label={<StyledNode>{branchTree.name}</StyledNode>}
        >
            {branchTree.children.map((child, index) => (
                <React.Fragment key={index}>{renderBranchNode(child)}</React.Fragment>
            ))}
        </Tree>
    );
};

const RepositoryVisualizations: React.FC<RepositoryVisualizationsProps> = ({ repository }) => {
    const [commits, setCommits] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [forks, setForks] = useState<GitHubFork[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [branchTree, setBranchTree] = useState<BranchNode | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/repositories/${repository.owner.login}/${repository.name}`);
                if (!response.ok) throw new Error('Failed to fetch repository data');
                const data = await response.json();
                setCommits(data.commits || []);
                setBranches(data.branches || []);
                setForks(data.forks || []);
                setIssues(data.issues || []);
                constructBranchTree(data.branches);
            } catch (error) {
                logger.error('Error fetching repository data:', error);
                setError('Failed to load some repository data. Charts may be incomplete.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [repository]);

    const constructBranchTree = (branches: any[]) => {
        const root: BranchNode = { name: 'main', children: [] };
        const branchMap: { [key: string]: BranchNode } = { main: root };

        branches.forEach(branch => {
            if (!branchMap[branch.name]) {
                branchMap[branch.name] = { name: branch.name, children: [] };
            }

            const parentBranch = branch.name.split('/').slice(0, -1).join('/') || 'main';
            if (!branchMap[parentBranch]) {
                branchMap[parentBranch] = { name: parentBranch, children: [] };
            }

            branchMap[parentBranch].children.push(branchMap[branch.name]);
        });

        setBranchTree(root);
    };

    if (loading) {
        return <CircularProgress />;
    }

    const commitData = commits.map((commit) => ({
        date: formatDate(commit.commit.author.date),
        linesChanged: commit.stats ? commit.stats.total : 0,
    })).reverse();

    const getForkDataByPeriod = () => {
        if (forks.length === 0) return [];

        const now = new Date();
        const forkDates = forks.map(fork => new Date(fork.created_at));
        const minForkDate = new Date(Math.min(...forkDates.map(d => d.getTime())));
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const startDate = minForkDate > oneYearAgo ? minForkDate : oneYearAgo;
        const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const periodLength = Math.max(Math.ceil(totalDays / 4), 1); // Ensure at least 1 day per period

        const periods: { start: Date; end: Date; forks: number }[] = [];
        for (let i = 0; i < 4; i++) {
            const periodStart = new Date(startDate.getTime() + i * periodLength * 24 * 60 * 60 * 1000);
            const periodEnd = new Date(Math.min(periodStart.getTime() + periodLength * 24 * 60 * 60 * 1000 - 1, now.getTime()));
            periods.push({ start: periodStart, end: periodEnd, forks: 0 });
        }

        forks.forEach(fork => {
            const forkDate = new Date(fork.created_at);
            const period = periods.find(p => forkDate >= p.start && forkDate <= p.end);
            if (period) {
                period.forks++;
            }
        });

        return periods.map(period => ({
            period: `${formatDate(period.start)} - ${formatDate(period.end)}`,
            forks: period.forks,
            startDate: period.start,
        }));
    };

    const forkData = getForkDataByPeriod();

    const issueData = [
        { name: 'Open', value: issues.filter(issue => issue.state === 'open').length },
        { name: 'Closed', value: issues.filter(issue => issue.state === 'closed').length }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <Box mt={4}>
            <Typography variant="h5" gutterBottom>Repository Visualizations</Typography>
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={4}>
                {commitData.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Commit History (Lines Changed)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={commitData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="linesChanged" stroke="#8884d8" name="Lines Changed" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>
                )}

                {branchTree && (
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Branch Structure</Typography>
                        <Box height={400} mb={4} sx={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'auto' }}>
                            <BranchStructure branchTree={branchTree} />
                        </Box>
                    </Grid>
                )}

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Forks by Period</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={forkData.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())}>
                            <XAxis
                                dataKey="period"
                                tickFormatter={(value) => {
                                    const date = new Date(value.split(' - ')[0]);
                                    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                }}
                                label={{ value: 'Period Start', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis label={{ value: 'Number of Forks', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                labelFormatter={(value) => `Period: ${value}`}
                                formatter={(value: number) => [`Forks: ${value}`, 'Forks']}
                            />
                            <Legend />
                            <Bar dataKey="forks" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Issues Breakdown</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={issueData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {issueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RepositoryVisualizations;
