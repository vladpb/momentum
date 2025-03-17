import { useState } from 'react';
import {
    Box, Typography, Button, Chip, Paper, Divider,
    TextField, MenuItem, FormControl, InputLabel, Select,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useTaskStore, Task } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import TaskTimer from './TaskTimer';

interface TaskDetailProps {
    taskId: string;
    onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onClose }) => {
    const { tasks, updateTask, completeTask } = useTaskStore();
    const { projects } = useProjectStore();
    const task = tasks.find(t => t.id === taskId);
    
    const [editedTask, setEditedTask] = useState<Task | null>(task || null);
    const [isEditing, setIsEditing] = useState(false);
    
    if (!task || !editedTask) {
        return null;
    }
    
    const handleStartEditing = () => {
        setEditedTask(task);
        setIsEditing(true);
    };
    
    const handleSaveChanges = () => {
        if (editedTask) {
            updateTask(taskId, editedTask);
            setIsEditing(false);
        }
    };
    
    const handleCancelEditing = () => {
        setEditedTask(task);
        setIsEditing(false);
    };
    
    const handleCompleteTask = () => {
        completeTask(taskId);
    };
    
    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{task.title}</Typography>
                    <Chip 
                        label={task.status} 
                        color={
                            task.status === 'todo' ? 'default' :
                            task.status === 'in_progress' ? 'primary' : 'success'
                        }
                        size="small"
                    />
                </Box>
            </DialogTitle>
            
            <DialogContent>
                {!isEditing ? (
                    <Box>
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>Details</Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {task.description || 'No description provided'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Priority
                                    </Typography>
                                    <Chip 
                                        label={task.priority} 
                                        color={
                                            task.priority === 'low' ? 'success' :
                                            task.priority === 'medium' ? 'warning' :
                                            task.priority === 'high' ? 'error' : 'error'
                                        }
                                        size="small"
                                    />
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Project
                                    </Typography>
                                    {task.projectId ? (
                                        <Chip 
                                            label={projects.find(p => p.id === task.projectId)?.name || 'Unknown'} 
                                            size="small"
                                        />
                                    ) : (
                                        <Typography variant="body1">None</Typography>
                                    )}
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Due Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {task.dueDate 
                                            ? new Date(task.dueDate).toLocaleDateString()
                                            : 'No due date'
                                        }
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Estimated Time
                                    </Typography>
                                    <Typography variant="body1">
                                        {task.estimatedTime 
                                            ? `${Math.floor(task.estimatedTime / 60)}h ${task.estimatedTime % 60}m`
                                            : 'No estimate'
                                        }
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Created
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                
                                {task.completedAt && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Completed
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(task.completedAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            
                            {task.tags && task.tags.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Tags
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {task.tags.map(tag => (
                                            <Chip key={tag} label={tag} size="small" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                        
                        <TaskTimer task={task} />
                    </Box>
                ) : (
                    <Box>
                        <TextField
                            label="Title"
                            fullWidth
                            value={editedTask.title}
                            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                            margin="normal"
                        />
                        
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editedTask.description}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                            margin="normal"
                        />
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={editedTask.status}
                                    label="Status"
                                    onChange={(e) => setEditedTask({ 
                                        ...editedTask, 
                                        status: e.target.value as Task['status']
                                    })}
                                >
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={editedTask.priority}
                                    label="Priority"
                                    onChange={(e) => setEditedTask({ 
                                        ...editedTask, 
                                        priority: e.target.value as Task['priority']
                                    })}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="urgent">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    value={editedTask.projectId || ''}
                                    label="Project"
                                    onChange={(e) => setEditedTask({ 
                                        ...editedTask, 
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
                            
                            <DatePicker
                                label="Due Date"
                                value={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
                                onChange={(date) => setEditedTask({ 
                                    ...editedTask, 
                                    dueDate: date ? date.toISOString() : null 
                                })}
                                sx={{ width: '100%' }}
                            />
                            
                            <TextField
                                label="Estimated Hours"
                                type="number"
                                fullWidth
                                value={editedTask.estimatedTime 
                                    ? Math.floor(editedTask.estimatedTime / 60) 
                                    : ''
                                }
                                onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 0;
                                    const minutes = editedTask.estimatedTime 
                                        ? editedTask.estimatedTime % 60 
                                        : 0;
                                    setEditedTask({ 
                                        ...editedTask, 
                                        estimatedTime: (hours * 60) + minutes 
                                    });
                                }}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            
                            <TextField
                                label="Estimated Minutes"
                                type="number"
                                fullWidth
                                value={editedTask.estimatedTime 
                                    ? editedTask.estimatedTime % 60 
                                    : ''
                                }
                                onChange={(e) => {
                                    const minutes = Math.min(59, parseInt(e.target.value) || 0);
                                    const hours = editedTask.estimatedTime 
                                        ? Math.floor(editedTask.estimatedTime / 60)
                                        : 0;
                                    setEditedTask({ 
                                        ...editedTask, 
                                        estimatedTime: (hours * 60) + minutes 
                                    });
                                }}
                                InputProps={{ inputProps: { min: 0, max: 59 } }}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                {!isEditing ? (
                    <>
                        <Button onClick={onClose}>Close</Button>
                        <Button onClick={handleStartEditing} color="primary">
                            Edit
                        </Button>
                        {task.status !== 'done' && (
                            <Button 
                                onClick={handleCompleteTask} 
                                variant="contained" 
                                color="success"
                            >
                                Mark Complete
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <Button onClick={handleCancelEditing}>Cancel</Button>
                        <Button 
                            onClick={handleSaveChanges} 
                            variant="contained" 
                            color="primary"
                            disabled={!editedTask.title}
                        >
                            Save Changes
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TaskDetail; 