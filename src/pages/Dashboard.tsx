// src/pages/Dashboard.tsx
import { useMemo } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent,
    LinearProgress, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '../store/taskStore';

const Dashboard = () => {
    const theme = useTheme();
    const tasks = useTaskStore(state => state.tasks);

    const stats = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const statusData = [
            { name: 'To Do', value: tasks.filter(task => task.status === 'todo').length },
            { name: 'In Progress', value: tasks.filter(task => task.status === 'in_progress').length },
            { name: 'Done', value: completedTasks }
        ];

        const priorityData = [
            { name: 'High', value: tasks.filter(task => task.priority === 'high').length },
            { name: 'Medium', value: tasks.filter(task => task.priority === 'medium').length },
            { name: 'Low', value: tasks.filter(task => task.priority === 'low').length }
        ];

        // Group tasks by project
        const projectMap = tasks.reduce((acc, task) => {
            const project = task.projectId || 'Unassigned';
            if (!acc[project]) {
                acc[project] = { total: 0, completed: 0 };
            }
            acc[project].total += 1;
            if (task.status === 'done') {
                acc[project].completed += 1;
            }
            return acc;
        }, {} as Record<string, { total: number, completed: number }>);

        const projectData = Object.entries(projectMap).map(([name, data]) => ({
            name,
            total: data.total,
            completed: data.completed
        }));

        // Time tracking - using optional chaining to prevent errors if timeTracking is undefined
        const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeTracking?.totalTime || 0), 0);
        const timeByProject = Object.entries(
            tasks.reduce((acc, task) => {
                const project = task.projectId || 'Unassigned';
                if (!acc[project]) acc[project] = 0;
                acc[project] += (task.timeTracking?.totalTime || 0);
                return acc;
            }, {} as Record<string, number>)
        ).map(([name, time]) => ({ name, time }));

        return {
            totalTasks,
            completedTasks,
            completionRate,
            statusData,
            priorityData,
            projectData,
            totalTimeSpent,
            timeByProject
        };
    }, [tasks]);

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Tasks</Typography>
                            <Typography variant="h3">{stats.totalTasks}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Completed Tasks</Typography>
                            <Typography variant="h3">{stats.completedTasks}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Completion Rate</Typography>
                            <Typography variant="h3">{stats.completionRate.toFixed(1)}%</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats.completionRate}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6">Tasks by Status</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={stats.statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {stats.statusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6">Tasks by Priority</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={stats.priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {stats.priorityData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6">Project Progress</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart
                                data={stats.projectData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" name="Total Tasks" fill={theme.palette.primary.main} />
                                <Bar dataKey="completed" name="Completed" fill={theme.palette.success.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
