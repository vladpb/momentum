import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, useTheme,
  Tabs, Tab, MenuItem, Select, FormControl, InputLabel, 
  Skeleton, alpha, CircularProgress
} from '@mui/material';
import GlassSurface from '../components/ui/GlassSurface';
import VisionButton from '../components/ui/VisionButton';
import { useAnalyticsStore, ProjectAnalytics, DailyProductivity } from '../store/analyticsStore';
import { useProjectStore } from '../store/projectStore';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const Analytics = () => {
  const theme = useTheme();
  
  // Store hooks
  const { 
    refreshAnalytics, 
    getProjectAnalytics, 
    getDailyProductivity,
    getCompletionRate,
    getAverageTaskCompletionTime,
    getPriorityDistribution
  } = useAnalyticsStore();
  
  const { projects } = useProjectStore();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | 'all'>('all');
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Data states
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics[]>([]);
  const [dailyProductivity, setDailyProductivity] = useState<DailyProductivity[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [avgCompletionTime, setAvgCompletionTime] = useState<number>(0);
  const [priorityDistribution, setPriorityDistribution] = useState<Record<string, number>>({});

  // Colors for charts
  const chartColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    todo: '#5E5CE6', // Blue
    inProgress: '#FFB800', // Amber
    done: '#34C759', // Green
    estimatedTime: alpha(theme.palette.primary.main, 0.6),
    actualTime: theme.palette.primary.main,
  };

  // Custom priority colors
  const priorityColors = {
    low: '#5AC8FA',
    medium: '#5E5CE6',
    high: '#FF9500',
    urgent: '#FF3B30'
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      refreshAnalytics();
      setProjectAnalytics(getProjectAnalytics());
      setDailyProductivity(getDailyProductivity());
      setCompletionRate(getCompletionRate());
      setAvgCompletionTime(getAverageTaskCompletionTime());
      setPriorityDistribution(getPriorityDistribution());
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Process data for charts based on selected project
  const processedProjectData = React.useMemo(() => {
    if (selectedProject === 'all') {
      return projectAnalytics;
    }
    return projectAnalytics.filter(p => p.projectId === selectedProject);
  }, [projectAnalytics, selectedProject]);

  // Process task status data for pie chart
  const statusData = React.useMemo(() => {
    const totals = processedProjectData.reduce(
      (acc, curr) => {
        acc.todo += curr.todoTasks;
        acc.inProgress += curr.inProgressTasks;
        acc.done += curr.completedTasks;
        return acc;
      },
      { todo: 0, inProgress: 0, done: 0 }
    );

    return [
      { name: 'To Do', value: totals.todo },
      { name: 'In Progress', value: totals.inProgress },
      { name: 'Done', value: totals.done },
    ];
  }, [processedProjectData]);

  // Time estimated vs actual for selected projects
  const timeComparisonData = React.useMemo(() => {
    return processedProjectData.map(project => {
      const projectObj = projects.find(p => p.id === project.projectId);
      return {
        name: projectObj?.name || 'Unknown Project',
        estimatedTime: Math.round(project.estimatedTime / 60), // Convert to hours
        actualTime: Math.round(project.totalTimeSpent / 60),
      };
    });
  }, [processedProjectData, projects]);

  // Productivity data over time
  const productivityData = React.useMemo(() => {
    // Number of days to display based on timeFrame
    let days = 30;
    if (timeFrame === 'week') days = 7;
    if (timeFrame === 'quarter') days = 90;
    
    return dailyProductivity
      .slice(0, days)
      .map(day => ({
        date: format(parseISO(day.date), 'MMM dd'),
        tasksCompleted: day.tasksCompleted,
        hoursSpent: Math.round((day.timeSpent / 60) * 10) / 10, // Round to 1 decimal
      }))
      .reverse(); // Reverse to show oldest first
  }, [dailyProductivity, timeFrame]);

  // Priority distribution for pie chart
  const priorityData = React.useMemo(() => {
    return Object.entries(priorityDistribution).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));
  }, [priorityDistribution]);

  // Tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Refresh data handler
  const handleRefreshData = () => {
    setIsLoading(true);
    refreshAnalytics();
    setProjectAnalytics(getProjectAnalytics());
    setDailyProductivity(getDailyProductivity());
    setCompletionRate(getCompletionRate());
    setAvgCompletionTime(getAverageTaskCompletionTime());
    setPriorityDistribution(getPriorityDistribution());
    setIsLoading(false);
  };

  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Overview tab content
  const OverviewTab = () => (
    <Grid container spacing={3}>
      {/* Summary Statistics */}
      <Grid item xs={12} md={6} lg={3}>
        <GlassSurface depth={2}>
          <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Task Completion Rate
            </Typography>
            <Box position="relative" display="flex" alignItems="center" justifyContent="center" height={140}>
              <CircularProgress
                variant="determinate"
                value={completionRate}
                size={120}
                thickness={4}
                sx={{
                  color: chartColors.done,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h4" component="div" fontWeight="bold">
                  {Math.round(completionRate)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <GlassSurface depth={2}>
          <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Average Completion Time
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatTime(Math.round(avgCompletionTime))}
              </Typography>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <GlassSurface depth={2}>
          <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Total Tasks
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
              <Typography variant="h4" component="div" fontWeight="bold">
                {statusData.reduce((sum, item) => sum + item.value, 0)}
              </Typography>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <GlassSurface depth={2}>
          <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Tasks Completed Today
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
              <Typography variant="h4" component="div" fontWeight="bold">
                {dailyProductivity[0]?.tasksCompleted || 0}
              </Typography>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Task Status Distribution */}
      <Grid item xs={12} md={6}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Task Status Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="todo" fill={chartColors.todo} />
                    <Cell key="inProgress" fill={chartColors.inProgress} />
                    <Cell key="done" fill={chartColors.done} />
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} tasks`, 'Count']}
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Priority Distribution */}
      <Grid item xs={12} md={6}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Priority Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry) => (
                      <Cell 
                        key={entry.name} 
                        fill={priorityColors[entry.name.toLowerCase() as keyof typeof priorityColors]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} tasks`, 'Count']}
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Daily Productivity Chart */}
      <Grid item xs={12}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Daily Productivity
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="timeframe-select-label">Time Frame</InputLabel>
                <Select
                  labelId="timeframe-select-label"
                  value={timeFrame}
                  label="Time Frame"
                  onChange={(e) => setTimeFrame(e.target.value as 'week' | 'month' | 'quarter')}
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.6),
                    },
                  }}
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={productivityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="tasksCompleted"
                    name="Tasks Completed"
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#colorTasks)"
                    yAxisId="left"
                  />
                  <Area
                    type="monotone"
                    dataKey="hoursSpent"
                    name="Hours Spent"
                    stroke={chartColors.secondary}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    yAxisId="right"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>
    </Grid>
  );

  // Projects tab content
  const ProjectsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <GlassSurface>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Project Analytics</Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value as string)}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.6),
                  },
                }}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Project Task Stats */}
      <Grid item xs={12}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Project Task Distribution
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedProjectData.map(proj => {
                    const project = projects.find(p => p.id === proj.projectId);
                    return {
                      name: project?.name || 'Unknown',
                      todo: proj.todoTasks,
                      inProgress: proj.inProgressTasks,
                      done: proj.completedTasks
                    };
                  })}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="todo" name="To Do" fill={chartColors.todo} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill={chartColors.inProgress} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done" name="Done" fill={chartColors.done} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Time Comparison Chart */}
      <Grid item xs={12}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Estimated vs. Actual Time (Hours)
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="estimatedTime" name="Estimated Hours" fill={chartColors.estimatedTime} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualTime" name="Actual Hours" fill={chartColors.actualTime} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>
    </Grid>
  );

  // Time tab content
  const TimeTrackingTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <GlassSurface>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Time Tracking Analysis</Typography>
            <VisionButton 
              onClick={handleRefreshData}
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </VisionButton>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Time Spent Overview */}
      <Grid item xs={12} md={6} lg={4}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Total Time Tracked
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={120}>
              <Typography variant="h3" fontWeight="bold">
                {formatTime(
                  processedProjectData.reduce((total, proj) => total + proj.totalTimeSpent, 0)
                )}
              </Typography>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Average Daily Time
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={120}>
              <Typography variant="h3" fontWeight="bold">
                {formatTime(
                  Math.round(
                    dailyProductivity
                      .slice(0, 7) // Last week
                      .reduce((total, day) => total + day.timeSpent, 0) / 7
                  )
                )}
              </Typography>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Time Tracking Efficiency
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={120}>
              {(() => {
                const totalEstimated = processedProjectData.reduce(
                  (total, proj) => total + proj.estimatedTime, 0
                );
                const totalActual = processedProjectData.reduce(
                  (total, proj) => total + proj.totalTimeSpent, 0
                );
                
                // Calculate efficiency (lower is better, meaning tasks completed faster than estimated)
                const efficiency = totalEstimated > 0 
                  ? Math.min(200, Math.round((totalActual / totalEstimated) * 100))
                  : 0;
                
                const getEfficiencyColor = () => {
                  if (efficiency <= 85) return chartColors.success;  // Under estimated time (good)
                  if (efficiency <= 115) return chartColors.inProgress; // Around estimated time
                  return chartColors.error; // Over estimated time (bad)
                };
                
                return (
                  <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress
                      variant="determinate"
                      value={Math.min(100, efficiency)}
                      size={120}
                      thickness={4}
                      sx={{
                        color: getEfficiencyColor(),
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Box
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {efficiency}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of estimated
                      </Typography>
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </GlassSurface>
      </Grid>

      {/* Time Tracking Chart */}
      <Grid item xs={12}>
        <GlassSurface depth={2}>
          <Box p={3}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Daily Time Tracking (Hours)
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={productivityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="hoursSpent" 
                    name="Hours Tracked"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartColors.primary, stroke: chartColors.primary }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GlassSurface>
      </Grid>
    </Grid>
  );

  // Loading placeholder
  if (isLoading) {
    return (
      <Box p={3}>
        <Typography variant="h4" sx={{ mb: 3 }}>Analytics</Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Analytics</Typography>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Projects" />
          <Tab label="Time Tracking" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <Box>
        {tabValue === 0 && <OverviewTab />}
        {tabValue === 1 && <ProjectsTab />}
        {tabValue === 2 && <TimeTrackingTab />}
      </Box>
    </Box>
  );
};

export default Analytics; 