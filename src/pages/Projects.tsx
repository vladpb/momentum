import { useState } from 'react';
import {
    Box, Typography, Button, Grid, Card, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, FormControl, InputLabel, Select,
    IconButton, Chip, Paper, Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Archive as ArchiveIcon,
    CheckCircle as CompleteIcon,
    Flag as FlagIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useProjectStore, Project } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';

// Color options for projects
const colorOptions = [
    { value: '#f44336', label: 'Red' },
    { value: '#e91e63', label: 'Pink' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#673ab7', label: 'Deep Purple' },
    { value: '#3f51b5', label: 'Indigo' },
    { value: '#2196f3', label: 'Blue' },
    { value: '#03a9f4', label: 'Light Blue' },
    { value: '#00bcd4', label: 'Cyan' },
    { value: '#009688', label: 'Teal' },
    { value: '#4caf50', label: 'Green' },
    { value: '#8bc34a', label: 'Light Green' },
    { value: '#cddc39', label: 'Lime' },
    { value: '#ffeb3b', label: 'Yellow' },
    { value: '#ffc107', label: 'Amber' },
    { value: '#ff9800', label: 'Orange' },
    { value: '#ff5722', label: 'Deep Orange' },
    { value: '#795548', label: 'Brown' },
    { value: '#607d8b', label: 'Blue Grey' },
];

const ProjectsPage = () => {
    const { projects, addProject, updateProject, deleteProject, completeProject, archiveProject } = useProjectStore();
    const { tasks } = useTaskStore();
    const [open, setOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project>>({
        name: '',
        description: '',
        color: '#2196f3',
        status: 'active',
        dueDate: null,
        goal: '',
        tags: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // Group projects by status
    const activeProjects = projects.filter(project => project.status === 'active');
    const onHoldProjects = projects.filter(project => project.status === 'on_hold');
    const completedProjects = projects.filter(project => project.status === 'completed');
    const archivedProjects = projects.filter(project => project.status === 'archived');

    const handleOpenDialog = (project?: Project) => {
        if (project) {
            setCurrentProject(project);
            setIsEditing(true);
        } else {
            setCurrentProject({
                name: '',
                description: '',
                color: '#2196f3',
                status: 'active',
                dueDate: null,
                goal: '',
                tags: [],
            });
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSaveProject = () => {
        if (isEditing && currentProject.id) {
            updateProject(currentProject.id, currentProject);
        } else {
            addProject(currentProject as Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>);
        }
        handleCloseDialog();
    };

    const handleDeleteProject = (id: string) => {
        deleteProject(id);
    };

    const handleCompleteProject = (id: string) => {
        completeProject(id);
    };

    const handleArchiveProject = (id: string) => {
        archiveProject(id);
    };

    const handleAddTag = () => {
        if (tagInput && !currentProject.tags?.includes(tagInput)) {
            setCurrentProject({
                ...currentProject,
                tags: [...(currentProject.tags || []), tagInput]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setCurrentProject({
            ...currentProject,
            tags: currentProject.tags?.filter(t => t !== tag) || []
        });
    };

    // Count tasks per project
    const getProjectMetrics = (projectId: string) => {
        const projectTasks = tasks.filter(task => task.projectId === projectId);
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(task => task.status === 'done').length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return { totalTasks, completedTasks, progressPercentage };
    };

    const renderProjectCard = (project: Project) => {
        const { totalTasks, completedTasks, progressPercentage } = getProjectMetrics(project.id);
        
        return (
            <Card key={project.id} sx={{ mb: 2, borderLeft: 5, borderColor: project.color }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {project.name}
                        </Typography>
                        <Chip 
                            label={project.status} 
                            color={
                                project.status === 'active' ? 'primary' :
                                project.status === 'on_hold' ? 'warning' :
                                project.status === 'completed' ? 'success' : 'default'
                            }
                            size="small"
                        />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                    </Typography>
                    
                    {project.dueDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Due:</strong> {new Date(project.dueDate).toLocaleDateString()}
                        </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Progress:</strong> {completedTasks}/{totalTasks} tasks ({progressPercentage}%)
                    </Typography>
                    
                    {project.tags && project.tags.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {project.tags.map(tag => (
                                <Chip key={tag} label={tag} size="small" />
                            ))}
                        </Box>
                    )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    {project.status !== 'completed' && (
                        <IconButton 
                            size="small" 
                            onClick={() => handleCompleteProject(project.id)}
                            title="Mark as Completed"
                        >
                            <CompleteIcon />
                        </IconButton>
                    )}
                    
                    {project.status !== 'archived' && (
                        <IconButton 
                            size="small" 
                            onClick={() => handleArchiveProject(project.id)}
                            title="Archive Project"
                        >
                            <ArchiveIcon />
                        </IconButton>
                    )}
                    
                    <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(project)}
                        title="Edit Project"
                    >
                        <EditIcon />
                    </IconButton>
                    
                    <IconButton 
                        size="small" 
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete Project"
                    >
                        <DeleteIcon />
                    </IconButton>
                </CardActions>
            </Card>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Projects</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Project
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} xl={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Active ({activeProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {activeProjects.map(renderProjectCard)}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">On Hold ({onHoldProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {onHoldProjects.map(renderProjectCard)}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6">Completed ({completedProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {completedProjects.map(renderProjectCard)}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ArchiveIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Archived ({archivedProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {archivedProjects.map(renderProjectCard)}
                    </Paper>
                </Grid>
            </Grid>

            {/* Project Form Dialog */}
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Edit Project' : 'New Project'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Project Name"
                        fullWidth
                        value={currentProject.name || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={currentProject.description || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Goal"
                        fullWidth
                        value={currentProject.goal || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, goal: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={currentProject.status || 'active'}
                            label="Status"
                            onChange={(e) => setCurrentProject({ 
                                ...currentProject, 
                                status: e.target.value as Project['status'] 
                            })}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="on_hold">On Hold</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel>Color</InputLabel>
                        <Select
                            value={currentProject.color || '#2196f3'}
                            label="Color"
                            onChange={(e) => setCurrentProject({ ...currentProject, color: e.target.value })}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box 
                                        sx={{ 
                                            width: 20, 
                                            height: 20, 
                                            borderRadius: '50%', 
                                            bgcolor: selected as string, 
                                            mr: 1 
                                        }} 
                                    />
                                    {colorOptions.find(color => color.value === selected)?.label}
                                </Box>
                            )}
                        >
                            {colorOptions.map((color) => (
                                <MenuItem key={color.value} value={color.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                width: 20, 
                                                height: 20, 
                                                borderRadius: '50%', 
                                                bgcolor: color.value, 
                                                mr: 1 
                                            }} 
                                        />
                                        {color.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <DatePicker
                        label="Due Date"
                        value={currentProject.dueDate ? new Date(currentProject.dueDate) : null}
                        onChange={(date) => setCurrentProject({ 
                            ...currentProject, 
                            dueDate: date ? date.toISOString() : null 
                        })}
                        sx={{ width: '100%', mb: 2 }}
                    />
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Tags
                        </Typography>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                            <TextField
                                size="small"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add tag..."
                                sx={{ flexGrow: 1 }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <Button 
                                onClick={handleAddTag}
                                variant="contained" 
                                sx={{ ml: 1 }}
                                disabled={!tagInput}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {currentProject.tags?.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSaveProject} 
                        variant="contained"
                        disabled={!currentProject.name}
                    >
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectsPage; 