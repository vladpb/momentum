import { useState } from 'react';
import {
    Box, Paper, Typography, Button, Grid, Card,
    CardContent, CardActions, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, FormControl, InputLabel, Select,
    Fab, SxProps, Theme, Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
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

const TasksPage = () => {
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
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSaveTask = () => {
        if (isEditing && currentTask.id) {
            updateTask(currentTask.id, currentTask);
        } else {
            addTask(currentTask as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'timeTracking'>);
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

    // Add a handler to open the task detail
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
                />
            </div>
        );
    };

    // Non-sortable task card component (used for both sortable items and drag overlay)
    interface TaskCardProps {
        task: Task;
        onEdit: () => void;
        onDelete: () => void;
        dragHandleProps?: Record<string, unknown>;
    }

    const TaskCard = ({ task, onEdit, onDelete, dragHandleProps = {} }: TaskCardProps) => {
        return (
            <Card
                sx={{ mb: 1, cursor: 'pointer' }}
                onClick={() => handleOpenTaskDetail(task.id)}
                {...dragHandleProps}
            >
                <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {task.title}
                    </Typography>
                    {task.description && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                            {task.description}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Chip
                                label={task.priority}
                                size="small"
                                color={
                                    task.priority === 'low' ? 'success' :
                                    task.priority === 'medium' ? 'warning' :
                                    task.priority === 'high' ? 'error' : 'error'
                                }
                                sx={{ mr: 0.5 }}
                            />
                            {task.dueDate && (
                                <Chip
                                    label={new Date(task.dueDate).toLocaleDateString()}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </CardActions>
            </Card>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Tasks</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Task
                </Button>
            </Box>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                height: 'calc(100vh - 180px)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2 }}>To Do</Typography>
                            <ColumnDroppable id="todo" sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                height: 'calc(100vh - 180px)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2 }}>In Progress</Typography>
                            <ColumnDroppable id="in_progress" sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                height: 'calc(100vh - 180px)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2 }}>Done</Typography>
                            <ColumnDroppable id="done" sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                        </Paper>
                    </Grid>
                </Grid>

                {/* Drag overlay for better visual feedback */}
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard 
                            task={activeTask} 
                            onEdit={() => {}} 
                            onDelete={() => {}} 
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={currentTask.title}
                        onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={currentTask.description}
                        onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={currentTask.priority}
                                    label="Priority"
                                    onChange={(e) => setCurrentTask({
                                        ...currentTask,
                                        priority: e.target.value as Task['priority']
                                    })}
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
                                        margin: 'dense'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={currentTask.projectId || ''}
                            label="Project"
                            onChange={(e) => setCurrentTask({
                                ...currentTask,
                                projectId: e.target.value || null
                            })}
                        >
                            <MenuItem value="">None</MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveTask} variant="contained" color="primary">
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => handleOpenDialog()}
            >
                <AddIcon />
            </Fab>

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
