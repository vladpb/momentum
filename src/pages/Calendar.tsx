import { useState, useMemo } from 'react';
import {
    Box, Typography, Grid, IconButton, Button,
    useTheme, alpha, MenuItem, Menu, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, Divider
} from '@mui/material';
import { LocalizationProvider, DateCalendar, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Add as AddIcon,
    ViewDay as ViewDayIcon,
    ViewWeek as ViewWeekIcon,
    CalendarMonth as ViewMonthIcon,
    MoreVert as MoreVertIcon,
    FilterList as FilterListIcon,
    CheckCircle as DoneIcon,
    RadioButtonUnchecked as TodoIcon,
    DonutLarge as InProgressIcon,
    AccessTime as TimeIcon,
    Timer as DurationIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, 
    isWithinInterval, addMonths, subMonths, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import GlassSurface from '../components/ui/GlassSurface';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';

// Calendar views
type CalendarView = 'month' | 'week' | 'day';

const Calendar = () => {
    const theme = useTheme();
    const { tasks } = useTaskStore();
    const { projects } = useProjectStore();
    
    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarView, setCalendarView] = useState<CalendarView>('month');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    //const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        projectId: null as string | null,
        dueDate: new Date().toISOString(),
    });
    const [filters, setFilters] = useState({
        project: 'all',
        priority: 'all',
        status: 'all'
    });

    // Calendar navigation functions
    const handlePrevious = () => {
        if (calendarView === 'month') {
            setSelectedDate(subMonths(selectedDate, 1));
        } else if (calendarView === 'week') {
            setSelectedDate(addDays(selectedDate, -7));
        } else {
            setSelectedDate(addDays(selectedDate, -1));
        }
    };

    const handleNext = () => {
        if (calendarView === 'month') {
            setSelectedDate(addMonths(selectedDate, 1));
        } else if (calendarView === 'week') {
            setSelectedDate(addDays(selectedDate, 7));
        } else {
            setSelectedDate(addDays(selectedDate, 1));
        }
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenFilters = (event: React.MouseEvent<HTMLElement>) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilters = () => {
        setFilterAnchorEl(null);
    };

    // Handle task dialog
    const handleOpenTaskDialog = () => {
        setOpenTaskDialog(true);
    };

    const handleCloseTaskDialog = () => {
        setOpenTaskDialog(false);
        setNewTaskData({
            title: '',
            description: '',
            priority: 'medium',
            projectId: null,
            dueDate: new Date().toISOString(),
        });
    };

    const handleCreateTask = () => {
        const { title, description, priority, projectId, dueDate } = newTaskData;
        
        if (title.trim()) {
            useTaskStore.getState().addTask({
                title,
                description,
                status: 'todo',
                priority: priority as 'low' | 'medium' | 'high' | 'urgent',
                projectId,
                tags: [],
                dueDate,
                estimatedTime: null,
                parentTaskId: null,
            });
            
            handleCloseTaskDialog();
        }
    };

    // Filter tasks by date
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const taskDate = new Date(task.dueDate);
            
            // Filter by project
            if (filters.project !== 'all' && task.projectId !== filters.project) {
                return false;
            }
            
            // Filter by priority
            if (filters.priority !== 'all' && task.priority !== filters.priority) {
                return false;
            }
            
            // Filter by status
            if (filters.status !== 'all' && task.status !== filters.status) {
                return false;
            }
            
            if (calendarView === 'month') {
                const start = startOfMonth(selectedDate);
                const end = endOfMonth(selectedDate);
                return isWithinInterval(taskDate, { start, end });
            } else if (calendarView === 'week') {
                const start = startOfWeek(selectedDate);
                const end = endOfWeek(selectedDate);
                return isWithinInterval(taskDate, { start, end });
            } else {
                return isSameDay(taskDate, selectedDate);
            }
        });
    }, [tasks, selectedDate, calendarView, filters]);

    // Generate calendar days for month view
    const calendarDays = useMemo(() => {
        if (calendarView !== 'month') return [];
        
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }, [selectedDate, calendarView]);

    // Generate calendar hours for day view
    const calendarHours = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => i);
    }, []);

    // Generate week days
    const weekDays = useMemo(() => {
        if (calendarView !== 'week') return [];
        
        const weekStart = startOfWeek(selectedDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [selectedDate, calendarView]);

    // Check if a day has tasks
    const getDayTasks = (day: Date) => {
        return filteredTasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), day);
        });
    };

    // Render calendar based on the selected view
    const renderCalendarContent = () => {
        if (calendarView === 'month') {
            return (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <Grid item key={day} xs={12/7}>
                            <Box sx={{ 
                                textAlign: 'center', 
                                p: 1, 
                                color: theme.palette.text.secondary,
                                fontWeight: 'bold',
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                            }}>
                                {day}
                            </Box>
                        </Grid>
                    ))}
                    
                    {calendarDays.map((day, i) => {
                        const dayTasks = getDayTasks(day);
                        const isCurrentDay = isToday(day);
                        
                        return (
                            <Grid item key={i} xs={12/7}>
                                <Box 
                                    onClick={() => setSelectedDate(day)}
                                    sx={{ 
                                        minHeight: '100px',
                                        p: 1, 
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: isCurrentDay ? `1px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                                        backgroundColor: isCurrentDay ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        }
                                    }}
                                >
                                    <Typography 
                                        sx={{ 
                                            textAlign: 'center',
                                            fontWeight: isCurrentDay ? 'bold' : 'normal',
                                            color: isCurrentDay ? theme.palette.primary.main : theme.palette.text.primary,
                                            mb: 1
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </Typography>
                                    
                                    {dayTasks.slice(0, 3).map(task => (
                                        <Box
                                            key={task.id}
                                            sx={{
                                                p: 0.5,
                                                mb: 0.5,
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                backgroundColor: alpha(
                                                    task.priority === 'high' || task.priority === 'urgent' 
                                                        ? theme.palette.error.main 
                                                        : task.priority === 'medium' 
                                                            ? theme.palette.warning.main 
                                                            : theme.palette.success.main,
                                                    0.1
                                                ),
                                                color: task.priority === 'high' || task.priority === 'urgent' 
                                                    ? theme.palette.error.main 
                                                    : task.priority === 'medium' 
                                                        ? theme.palette.warning.main 
                                                        : theme.palette.success.main,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            {/* Status icon */}
                                            {task.status === 'done' ? (
                                                <DoneIcon sx={{ fontSize: '0.875rem' }} />
                                            ) : task.status === 'in_progress' ? (
                                                <InProgressIcon sx={{ fontSize: '0.875rem' }} />
                                            ) : (
                                                <TodoIcon sx={{ fontSize: '0.875rem' }} />
                                            )}
                                            
                                            {/* Task title */}
                                            <Typography
                                                component="span"
                                                sx={{
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {task.title}
                                            </Typography>
                                            
                                            {/* Time information */}
                                            {task.dueDate && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <TimeIcon sx={{ fontSize: '0.875rem' }} />
                                                    {format(new Date(task.dueDate), 'HH:mm')}
                                                </Box>
                                            )}
                                            {task.estimatedTime && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <DurationIcon sx={{ fontSize: '0.875rem' }} />
                                                    {`${Math.floor(task.estimatedTime / 60)}h${task.estimatedTime % 60}m`}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                    
                                    {dayTasks.length > 3 && (
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            +{dayTasks.length - 3} more
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            );
        } else if (calendarView === 'week') {
            return (
                <Box sx={{ mt: 2, overflow: 'auto' }}>
                    <Grid container>
                        <Grid item xs={1}>
                            <Box sx={{ height: '50px' }}></Box>
                            {calendarHours.map(hour => (
                                <Box key={hour} sx={{ 
                                    height: '60px', 
                                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    paddingRight: 1,
                                    textAlign: 'right',
                                    color: theme.palette.text.secondary
                                }}>
                                    {hour}:00
                                </Box>
                            ))}
                        </Grid>
                        
                        <Grid item xs={11}>
                            <Grid container>
                                {weekDays.map((day, index) => (
                                    <Grid item key={index} xs={12/7}>
                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            p: 1, 
                                            fontWeight: isToday(day) ? 'bold' : 'normal',
                                            color: isToday(day) ? theme.palette.primary.main : theme.palette.text.primary,
                                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                        }}>
                                            <Typography variant="body2">{format(day, 'EEE')}</Typography>
                                            <Typography variant="h6">{format(day, 'd')}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                                
                                {calendarHours.map(hour => (
                                    <Grid container key={hour}>
                                        {weekDays.map((day, index) => {
                                            const hourTasks = filteredTasks.filter(task => {
                                                if (!task.dueDate) return false;
                                                const taskDate = new Date(task.dueDate);
                                                return isSameDay(taskDate, day) && taskDate.getHours() === hour;
                                            });
                                            
                                            return (
                                                <Grid item key={index} xs={12/7}>
                                                    <Box sx={{ 
                                                        height: '60px', 
                                                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                        p: 0.5,
                                                        position: 'relative',
                                                        backgroundColor: isToday(day) ? alpha(theme.palette.primary.main, 0.02) : 'transparent'
                                                    }}>
                                                        {hourTasks.map(task => (
                                                            <Box
                                                                key={task.id}
                                                                sx={{
                                                                    p: 0.5,
                                                                    mb: 0.5,
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.75rem',
                                                                    backgroundColor: alpha(
                                                                        task.priority === 'high' || task.priority === 'urgent' 
                                                                            ? theme.palette.error.main 
                                                                            : task.priority === 'medium' 
                                                                                ? theme.palette.warning.main 
                                                                                : theme.palette.success.main,
                                                                        0.1
                                                                    ),
                                                                    color: task.priority === 'high' || task.priority === 'urgent' 
                                                                        ? theme.palette.error.main 
                                                                        : task.priority === 'medium' 
                                                                            ? theme.palette.warning.main 
                                                                            : theme.palette.success.main,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5
                                                                }}
                                                            >
                                                                {/* Status icon */}
                                                                {task.status === 'done' ? (
                                                                    <DoneIcon sx={{ fontSize: '0.875rem' }} />
                                                                ) : task.status === 'in_progress' ? (
                                                                    <InProgressIcon sx={{ fontSize: '0.875rem' }} />
                                                                ) : (
                                                                    <TodoIcon sx={{ fontSize: '0.875rem' }} />
                                                                )}
                                                                
                                                                <Typography
                                                                    component="span"
                                                                    sx={{
                                                                        flex: 1,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {task.title}
                                                                </Typography>
                                                                
                                                                {task.estimatedTime && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <DurationIcon sx={{ fontSize: '0.875rem' }} />
                                                                        {`${Math.floor(task.estimatedTime / 60)}h${task.estimatedTime % 60}m`}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            );
        } else {
            // Day view
            return (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                    
                    <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                        {calendarHours.map(hour => {
                            const hourTasks = filteredTasks.filter(task => {
                                if (!task.dueDate) return false;
                                const taskDate = new Date(task.dueDate);
                                return taskDate.getHours() === hour;
                            });
                            
                            return (
                                <Box key={hour} sx={{ 
                                    display: 'flex', 
                                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
                                    minHeight: '60px'
                                }}>
                                    <Box sx={{ 
                                        width: '60px', 
                                        p: 1, 
                                        color: theme.palette.text.secondary,
                                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        textAlign: 'right'
                                    }}>
                                        {hour}:00
                                    </Box>
                                    
                                    <Box sx={{ 
                                        flexGrow: 1, 
                                        p: 0.5,
                                        position: 'relative',
                                    }}>
                                        {hourTasks.map(task => (
                                            <GlassSurface 
                                                key={task.id} 
                                                depth={1}
                                                opacity={0.1}
                                                sx={{ 
                                                    mb: 1, 
                                                    p: 1,
                                                    borderLeft: `3px solid ${
                                                        task.priority === 'high' || task.priority === 'urgent' 
                                                            ? theme.palette.error.main 
                                                            : task.priority === 'medium' 
                                                                ? theme.palette.warning.main 
                                                                : theme.palette.success.main
                                                    }`
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    {/* Status icon */}
                                                    {task.status === 'done' ? (
                                                        <DoneIcon color="success" />
                                                    ) : task.status === 'in_progress' ? (
                                                        <InProgressIcon color="warning" />
                                                    ) : (
                                                        <TodoIcon color="info" />
                                                    )}
                                                    
                                                    <Typography variant="subtitle2">{task.title}</Typography>
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4 }}>
                                                    {task.dueDate && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <TimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {format(new Date(task.dueDate), 'HH:mm')}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    
                                                    {task.estimatedTime && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <DurationIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {`${Math.floor(task.estimatedTime / 60)}h${task.estimatedTime % 60}m`}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    
                                                    {task.description && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {task.description.length > 50 
                                                                ? `${task.description.substring(0, 50)}...` 
                                                                : task.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </GlassSurface>
                                        ))}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            );
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4
            }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 700,
                        color: theme => theme.palette.text.primary 
                    }}
                >
                    Calendar
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenTaskDialog}
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
                            backdropFilter: 'blur(10px)',
                            boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        Add Task
                    </Button>
                    
                    <IconButton onClick={handleOpenFilters}>
                        <FilterListIcon />
                    </IconButton>
                    
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={handleCloseFilters}
                    >
                        <Box sx={{ p: 2, width: '250px' }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Filters
                            </Typography>
                            
                            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                                <InputLabel id="project-filter-label">Project</InputLabel>
                                <Select
                                    labelId="project-filter-label"
                                    value={filters.project}
                                    onChange={(e) => setFilters({...filters, project: e.target.value})}
                                    label="Project"
                                >
                                    <MenuItem value="all">All Projects</MenuItem>
                                    {projects.map(project => (
                                        <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                                <InputLabel id="priority-filter-label">Priority</InputLabel>
                                <Select
                                    labelId="priority-filter-label"
                                    value={filters.priority}
                                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                                    label="Priority"
                                >
                                    <MenuItem value="all">All Priorities</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="urgent">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel id="status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    label="Status"
                                >
                                    <MenuItem value="all">All Statuses</MenuItem>
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Menu>
                    
                    <IconButton onClick={handleOpenMenu}>
                        <MoreVertIcon />
                    </IconButton>
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem onClick={() => { setCalendarView('day'); handleCloseMenu(); }}>
                            <ViewDayIcon sx={{ mr: 1 }} /> Day View
                        </MenuItem>
                        <MenuItem onClick={() => { setCalendarView('week'); handleCloseMenu(); }}>
                            <ViewWeekIcon sx={{ mr: 1 }} /> Week View
                        </MenuItem>
                        <MenuItem onClick={() => { setCalendarView('month'); handleCloseMenu(); }}>
                            <ViewMonthIcon sx={{ mr: 1 }} /> Month View
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    <GlassSurface depth={1} opacity={0.3}>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={handlePrevious}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    
                                    <Typography variant="h6" sx={{ mx: 2 }}>
                                        {calendarView === 'month' && format(selectedDate, 'MMMM yyyy')}
                                        {calendarView === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`}
                                        {calendarView === 'day' && format(selectedDate, 'MMMM d, yyyy')}
                                    </Typography>
                                    
                                    <IconButton onClick={handleNext}>
                                        <ChevronRightIcon />
                                    </IconButton>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Day View">
                                        <IconButton 
                                            onClick={() => setCalendarView('day')}
                                            color={calendarView === 'day' ? 'primary' : 'default'}
                                        >
                                            <ViewDayIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Week View">
                                        <IconButton 
                                            onClick={() => setCalendarView('week')}
                                            color={calendarView === 'week' ? 'primary' : 'default'}
                                        >
                                            <ViewWeekIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Month View">
                                        <IconButton 
                                            onClick={() => setCalendarView('month')}
                                            color={calendarView === 'month' ? 'primary' : 'default'}
                                        >
                                            <ViewMonthIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2, opacity: 0.2 }} />
                            
                            {renderCalendarContent()}
                        </Box>
                    </GlassSurface>
                </Grid>
                
                <Grid item xs={12} md={3}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <GlassSurface depth={1} opacity={0.3}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Mini Calendar</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateCalendar 
                                        value={selectedDate}
                                        onChange={(newValue) => newValue && setSelectedDate(newValue)}
                                        disableHighlightToday={false}
                                        sx={{
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                backgroundColor: theme.palette.primary.main,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </GlassSurface>
                        
                        <GlassSurface depth={1} opacity={0.3}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Today's Tasks</Typography>
                                
                                {filteredTasks.filter(task => {
                                    if (!task.dueDate) return false;
                                    return isToday(new Date(task.dueDate));
                                }).length === 0 ? (
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        No tasks scheduled for today.
                                    </Typography>
                                ) : (
                                    filteredTasks.filter(task => {
                                        if (!task.dueDate) return false;
                                        return isToday(new Date(task.dueDate));
                                    }).map(task => (
                                        <Box 
                                            key={task.id}
                                            sx={{ 
                                                p: 1.5, 
                                                mb: 1, 
                                                borderRadius: '8px',
                                                backgroundColor: alpha(theme.palette.background.paper, 0.3),
                                                borderLeft: `3px solid ${
                                                    task.priority === 'high' || task.priority === 'urgent' 
                                                        ? theme.palette.error.main 
                                                        : task.priority === 'medium' 
                                                            ? theme.palette.warning.main 
                                                            : theme.palette.success.main
                                                }`
                                            }}
                                        >
                                            <Typography variant="subtitle2">{task.title}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                {task.dueDate && format(new Date(task.dueDate), 'h:mm a')}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </GlassSurface>
                    </Box>
                </Grid>
            </Grid>
            
            {/* Create Task Dialog */}
            <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTaskData.title}
                        onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={newTaskData.description}
                        onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                            labelId="priority-label"
                            value={newTaskData.priority}
                            onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
                            label="Priority"
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id="project-label">Project</InputLabel>
                        <Select
                            labelId="project-label"
                            value={newTaskData.projectId || ''}
                            onChange={(e) => setNewTaskData({...newTaskData, projectId: e.target.value || null})}
                            label="Project"
                        >
                            <MenuItem value="">No Project</MenuItem>
                            {projects.map(project => (
                                <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Due Date"
                            value={new Date(newTaskData.dueDate)}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setNewTaskData({...newTaskData, dueDate: newValue.toISOString()})
                                }
                            }}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTaskDialog}>Cancel</Button>
                    <Button 
                        onClick={handleCreateTask} 
                        variant="contained"
                        disabled={!newTaskData.title.trim()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Calendar; 