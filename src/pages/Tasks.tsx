import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, 
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, FormControl, InputLabel, Select,
    Fab, SxProps, Theme, useTheme, useMediaQuery,
    InputAdornment
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add as AddIcon, Timer as TimerIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useTaskStore, Task } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useDroppable
} from '@dnd-kit/core';
import { 
    SortableContext, 
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskDetail from '../components/task/TaskDetail';
import GlassSurface from '../components/ui/GlassSurface';
import VisionButton from '../components/ui/VisionButton';
import TaskCard from '../components/tasks/TaskCard';
import { alpha } from '@mui/material/styles';

const TasksPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { tasks, addTask, updateTask, deleteTask, moveTask } = useTaskStore();
    const { projects } = useProjectStore();
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [currentTask, setCurrentTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        estimatedTime: null,
        tags: [],
        projectId: null,
        parentTaskId: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [hours, setHours] = useState<string>('0');
    const [minutes, setMinutes] = useState<string>('0');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Minimum drag distance before activation
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleOpenDialog = (task?: Task) => {
        if (task) {
            setCurrentTask(task);
            // Extract hours and minutes from estimatedTime if it exists
            if (task.estimatedTime) {
                setHours(Math.floor(task.estimatedTime / 60).toString());
                setMinutes((task.estimatedTime % 60).toString());
            } else {
                setHours('0');
                setMinutes('0');
            }
            // Set time picker value if dueDate exists
            if (task.dueDate) {
                setSelectedTime(new Date(task.dueDate));
            } else {
                setSelectedTime(null);
            }
            setIsEditing(true);
        } else {
            setCurrentTask({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                dueDate: null,
                estimatedTime: null,
                tags: [],
                projectId: null,
                parentTaskId: null,
            });
            setHours('0');
            setMinutes('0');
            setSelectedTime(null);
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSaveTask = () => {
        // Calculate estimated time in minutes
        const estimatedTimeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
        
        // If we have both a date and a time, combine them
        let dueDate = currentTask.dueDate;
        if (dueDate && selectedTime) {
            const dueDateObj = new Date(dueDate);
            const timeObj = new Date(selectedTime);
            
            dueDateObj.setHours(timeObj.getHours());
            dueDateObj.setMinutes(timeObj.getMinutes());
            dueDate = dueDateObj.toISOString();
        }
        
        const taskToSave = {
            ...currentTask,
            estimatedTime: estimatedTimeInMinutes > 0 ? estimatedTimeInMinutes : null,
            dueDate: dueDate
        };
        
        if (isEditing && taskToSave.id) {
            updateTask(taskToSave.id, taskToSave);
        } else {
            addTask(taskToSave as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'timeTracking'>);
        }
        handleCloseDialog();
    };

    const handleDeleteTask = (id: string) => {
        deleteTask(id);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        
        if (!over) return;
        
        const taskId = active.id.toString();
        const destination = over.id.toString();
        
        // Only allow dropping in columns, not on other tasks
        if (['todo', 'in_progress', 'done'].includes(destination)) {
            // Only move if dropping in a different container
            if (destination !== active.data.current?.status) {
                moveTask(taskId, destination as Task['status']);
            }
        }
    };

    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const doneTasks = tasks.filter(task => task.status === 'done');

    // Find the active task
    const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

    // Update handleOpenTaskDetail to work with the imported TaskCard
    const handleOpenTaskDetail = (taskId: string) => {
        setSelectedTaskId(taskId);
    };

    const handleCloseTaskDetail = () => {
        setSelectedTaskId(null);
    };

    // Column droppable component
    interface ColumnDroppableProps {
        id: string;
        children: React.ReactNode;
        sx?: SxProps<Theme>;
    }

    const ColumnDroppable = ({ id, children, sx }: ColumnDroppableProps) => {
        const { setNodeRef, isOver } = useDroppable({
            id: id
        });

        return (
            <Box
                ref={setNodeRef}
                sx={{
                    minHeight: '50px',
                    padding: 1,
                    backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                    ...sx
                }}
            >
                {children}
            </Box>
        );
    };

    // Sortable task item component
    interface SortableTaskItemProps {
        task: Task;
        onEdit: () => void;
        onDelete: () => void;
        disabled?: boolean;
    }

    const SortableTaskItem = ({ task, onEdit, onDelete, disabled = false }: SortableTaskItemProps) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging
        } = useSortable({
            id: task.id,
            data: {
                status: task.status
            },
            disabled
        });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.3 : 1,
            cursor: disabled ? 'default' : 'grab',
            position: 'relative' as const,
            zIndex: isDragging ? 1000 : 1
        };

        return (
            <div ref={setNodeRef} style={style}>
                <TaskCard 
                    task={task} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    dragHandleProps={!disabled ? { ...attributes, ...listeners } : {}}
                    onClick={() => handleOpenTaskDetail(task.id)}
                />
            </div>
        );
    };

    return (
        <Box sx={{ 
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Fill the available height
            position: 'relative',
        }}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3
                }}
            >
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 700,
                        color: theme => theme.palette.text.primary
                    }}
                >
                    Tasks
                </Typography>
                
                {!isMobile && (
                    <VisionButton
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        glow
                    >
                        New Task
                    </VisionButton>
                )}
            </Box>

            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                flexGrow: 1,
            }}>
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <Grid 
                        container 
                        spacing={3}
                        sx={{
                            flexGrow: 1,
                            margin: 0,
                            width: '100%',
                        }}
                    >
                        <Grid item xs={12} md={4}>
                            <GlassSurface
                                depth={1}
                                opacity={0.3}
                                sx={{
                                    p: 2,
                                    height: 'calc(100vh - 180px)',
                                    minHeight: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backdropFilter: 'blur(12px)',
                                    border: 'none',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2, 
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        color: (theme) => theme.palette.primary.main,
                                    }}
                                >
                                    To Do
                                </Typography>
                                <ColumnDroppable id="todo" sx={{ 
                                    flexGrow: 1, 
                                    overflow: 'auto',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <SortableContext 
                                        items={todoTasks.map(task => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {todoTasks.map((task) => (
                                            <SortableTaskItem 
                                                key={task.id} 
                                                task={task}
                                                onEdit={() => handleOpenDialog(task)}
                                                onDelete={() => handleDeleteTask(task.id)}
                                                disabled={activeId !== null}
                                            />
                                        ))}
                                    </SortableContext>
                                </ColumnDroppable>
                            </GlassSurface>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <GlassSurface
                                depth={1}
                                opacity={0.3}
                                sx={{
                                    p: 2,
                                    height: 'calc(100vh - 180px)',
                                    minHeight: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backdropFilter: 'blur(12px)',
                                    border: 'none',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2, 
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        color: (theme) => theme.palette.warning.main,
                                    }}
                                >
                                    In Progress
                                </Typography>
                                <ColumnDroppable id="in_progress" sx={{ 
                                    flexGrow: 1, 
                                    overflow: 'auto',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <SortableContext 
                                        items={inProgressTasks.map(task => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {inProgressTasks.map((task) => (
                                            <SortableTaskItem 
                                                key={task.id} 
                                                task={task}
                                                onEdit={() => handleOpenDialog(task)}
                                                onDelete={() => handleDeleteTask(task.id)}
                                                disabled={activeId !== null}
                                            />
                                        ))}
                                    </SortableContext>
                                </ColumnDroppable>
                            </GlassSurface>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <GlassSurface
                                depth={1}
                                opacity={0.3}
                                sx={{
                                    p: 2,
                                    height: 'calc(100vh - 180px)',
                                    minHeight: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backdropFilter: 'blur(12px)',
                                    border: 'none',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2, 
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        color: (theme) => theme.palette.success.main,
                                    }}
                                >
                                    Done
                                </Typography>
                                <ColumnDroppable id="done" sx={{ 
                                    flexGrow: 1, 
                                    overflow: 'auto',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <SortableContext 
                                        items={doneTasks.map(task => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {doneTasks.map((task) => (
                                            <SortableTaskItem 
                                                key={task.id} 
                                                task={task}
                                                onEdit={() => handleOpenDialog(task)}
                                                onDelete={() => handleDeleteTask(task.id)}
                                                disabled={activeId !== null}
                                            />
                                        ))}
                                    </SortableContext>
                                </ColumnDroppable>
                            </GlassSurface>
                        </Grid>
                    </Grid>

                    {/* Drag overlay for better visual feedback */}
                    <DragOverlay>
                        {activeTask ? (
                            <TaskCard 
                                task={activeTask} 
                                onEdit={() => {}} 
                                onDelete={() => {}} 
                                onClick={() => {}}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Dialog 
                    open={open} 
                    onClose={handleCloseDialog} 
                    fullWidth 
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            background: (theme) => alpha(theme.palette.background.paper, 0.7),
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 1, pt: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ pb: 3, px: 3 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Title"
                            fullWidth
                            value={currentTask.title}
                            onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                            sx={{ 
                                mb: 3, 
                                mt: 2,
                                '& .MuiOutlinedInput-root': {
                                    backdropFilter: 'blur(8px)',
                                    background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                }
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={currentTask.description}
                            onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                            sx={{ 
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    backdropFilter: 'blur(8px)',
                                    background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                }
                            }}
                        />
                        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={currentTask.priority}
                                        label="Priority"
                                        onChange={(e) => setCurrentTask({
                                            ...currentTask,
                                            priority: e.target.value as Task['priority']
                                        })}
                                        sx={{
                                            backdropFilter: 'blur(8px)',
                                            background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                            height: '56px', // Match the height of the DatePicker
                                        }}
                                    >
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Due Date"
                                    value={currentTask.dueDate ? new Date(currentTask.dueDate) : null}
                                    onChange={(newValue) => setCurrentTask({
                                        ...currentTask,
                                        dueDate: newValue ? newValue.toISOString() : null
                                    })}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'outlined',
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    backdropFilter: 'blur(8px)',
                                                    background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                                    height: '56px', // Match the height
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        
                        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TimePicker
                                    label="Due Time"
                                    value={selectedTime}
                                    onChange={(newValue) => setSelectedTime(newValue)}
                                    disabled={!currentTask.dueDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'outlined',
                                            helperText: !currentTask.dueDate ? "Set a due date first" : "",
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    backdropFilter: 'blur(8px)',
                                                    background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                                    height: '56px',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <TextField
                                        label="Hours"
                                        type="number"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TimerIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{ min: 0 }}
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                backdropFilter: 'blur(8px)',
                                                background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                                height: '56px',
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Minutes"
                                        type="number"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        inputProps={{ min: 0, max: 59 }}
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                backdropFilter: 'blur(8px)',
                                                background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                                height: '56px',
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={currentTask.projectId || ''}
                                label="Project"
                                onChange={(e) => setCurrentTask({
                                    ...currentTask,
                                    projectId: e.target.value || null
                                })}
                                sx={{
                                    backdropFilter: 'blur(8px)',
                                    background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                    height: '56px',
                                }}
                            >
                                <MenuItem value="">None</MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box 
                                                sx={{ 
                                                    width: 12, 
                                                    height: 12, 
                                                    borderRadius: '50%', 
                                                    bgcolor: project.color, 
                                                    mr: 1 
                                                }} 
                                            />
                                            {project.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button 
                            onClick={handleCloseDialog}
                            sx={{ 
                                '&:hover': { 
                                    color: (theme) => theme.palette.primary.dark 
                                } 
                            }}
                        >
                            Cancel
                        </Button>
                        <VisionButton 
                            onClick={handleSaveTask} 
                            variant="contained"
                            disabled={!currentTask.title}
                            sx={{ 
                                '&:hover': { 
                                    '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root, .MuiTypography-root': {
                                        color: (theme) => alpha(theme.palette.primary.contrastText, 0.9),
                                    },
                                } 
                            }}
                        >
                            {isEditing ? 'Update' : 'Create'}
                        </VisionButton>
                    </DialogActions>
                </Dialog>
            </LocalizationProvider>

            {/* Mobile fab button */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="add task"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={() => handleOpenDialog()}
                >
                    <AddIcon />
                </Fab>
            )}

            {selectedTaskId && (
                <TaskDetail
                    taskId={selectedTaskId}
                    onClose={handleCloseTaskDetail}
                />
            )}
        </Box>
    );
};

export default TasksPage;
