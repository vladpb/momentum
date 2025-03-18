// src/pages/Dashboard.tsx
import { useMemo } from 'react';
import {
    Box, Typography, Grid, CardContent,
    LinearProgress, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import GlassSurface from '../components/ui/GlassSurface';

const Dashboard = () => {
    const theme = useTheme();
    const tasks = useTaskStore(state => state.tasks);
    const projects = useProjectStore(state => state.projects);

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

        // Find project names and create project data with proper labels
        const projectData = Object.entries(projectMap).map(([id, data]) => {
            const projectName = id === 'Unassigned' ? 'Unassigned' : 
                projects.find(p => p.id === id)?.name || 'Unknown Project';
            
            return {
                id,
                name: projectName,
                total: data.total,
                completed: data.completed
            };
        });

        return {
            totalTasks,
            completedTasks,
            completionRate,
            statusData,
            priorityData,
            projectData
        };
    }, [tasks, projects]);

    const COLORS = {
        status: [
            theme.palette.primary.main, // To Do - Blue
            theme.palette.warning.main, // In Progress
            theme.palette.success.main // Done
        ],
        priority: [
            theme.palette.error.main, // High
            theme.palette.warning.main, // Medium
            theme.palette.success.main // Low
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} md={4}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ minHeight: '160px' }}>
                        <CardContent sx={{ height: '120px' }}>
                            <Typography color="textSecondary" gutterBottom>Total Tasks</Typography>
                            <Typography variant="h3">{stats.totalTasks}</Typography>
                        </CardContent>
                    </GlassSurface>
                </Grid>
                <Grid item xs={12} md={4}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ minHeight: '160px' }}>
                        <CardContent sx={{ height: '120px' }}>
                            <Typography color="textSecondary" gutterBottom>Completed Tasks</Typography>
                            <Typography variant="h3">{stats.completedTasks}</Typography>
                        </CardContent>
                    </GlassSurface>
                </Grid>
                <Grid item xs={12} md={4}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ minHeight: '160px' }}>
                        <CardContent sx={{ height: '120px' }}>
                            <Typography color="textSecondary" gutterBottom>Completion Rate</Typography>
                            <Typography variant="h3">{stats.completionRate.toFixed(1)}%</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats.completionRate}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </GlassSurface>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: 350 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Tasks by Status</Typography>
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
                                        <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassSurface>
                </Grid>

                <Grid item xs={12} md={6}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: 350 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Tasks by Priority</Typography>
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
                                        <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassSurface>
                </Grid>

                <Grid item xs={12}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: 340 }}>
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
                    </GlassSurface>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
