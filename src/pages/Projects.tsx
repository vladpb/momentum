import { useState } from 'react';
import {
    Box, Typography, Button, Grid, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, FormControl, InputLabel, Select,
    IconButton, Chip, Divider, useTheme, useMediaQuery, alpha
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
import GlassSurface from '../components/ui/GlassSurface';
import VisionButton from '../components/ui/VisionButton';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
            <GlassSurface 
                key={project.id} 
                sx={{ 
                    mb: 2, 
                    position: 'relative',
                    overflow: 'visible',
                    border: 'none',
                    borderLeft: `5px solid ${project.color}`,
                    '&:hover': {
                        transform: 'translateY(-2px)',
                    }
                }}
                depth={1}
                opacity={0.4}
            >
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
                            sx={{ 
                                backdropFilter: 'blur(8px)',
                                background: (theme) => 
                                    project.status === 'active' 
                                        ? alpha(theme.palette.primary.main, 0.15)
                                        : project.status === 'on_hold'
                                        ? alpha(theme.palette.warning.main, 0.15)
                                        : project.status === 'completed'
                                        ? alpha(theme.palette.success.main, 0.15)
                                        : alpha(theme.palette.grey[500], 0.15),
                                border: 'none',
                            }}
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
                    
                    <Box sx={{ 
                        mb: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between' 
                    }}>
                        <Typography variant="body2">
                            <strong>Progress:</strong> {completedTasks}/{totalTasks} tasks
                        </Typography>
                        <Typography variant="body2" color={
                            progressPercentage >= 75 ? 'success.main' :
                            progressPercentage >= 50 ? 'warning.main' : 
                            'text.secondary'
                        }>
                            {progressPercentage}%
                        </Typography>
                    </Box>
                    
                    <Box 
                        component="div" 
                        sx={{ 
                            width: '100%', 
                            height: '6px', 
                            bgcolor: alpha(theme.palette.background.paper, 0.3),
                            borderRadius: '3px',
                            mt: 1,
                            mb: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <Box 
                            component="div" 
                            sx={{ 
                                width: `${progressPercentage}%`, 
                                height: '100%', 
                                bgcolor: progressPercentage >= 75 
                                    ? theme.palette.success.main 
                                    : progressPercentage >= 50 
                                    ? theme.palette.warning.main 
                                    : theme.palette.primary.main,
                                borderRadius: '3px',
                                transition: 'width 0.5s ease-in-out'
                            }} 
                        />
                    </Box>
                    
                    {project.tags && project.tags.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {project.tags.map(tag => (
                                <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small" 
                                    sx={{ 
                                        backdropFilter: 'blur(8px)',
                                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                                        border: 'none',
                                    }}
                                />
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
                            sx={{ 
                                backdropFilter: 'blur(5px)',
                                background: 'transparent',
                                '&:hover': {
                                    background: (theme) => alpha(theme.palette.success.main, 0.15),
                                    color: (theme) => theme.palette.success.main,
                                }
                            }}
                        >
                            <CompleteIcon />
                        </IconButton>
                    )}
                    
                    {project.status !== 'archived' && (
                        <IconButton 
                            size="small" 
                            onClick={() => handleArchiveProject(project.id)}
                            title="Archive Project"
                            sx={{ 
                                backdropFilter: 'blur(5px)',
                                background: 'transparent',
                                '&:hover': {
                                    background: (theme) => alpha(theme.palette.action.hover, 0.15),
                                }
                            }}
                        >
                            <ArchiveIcon />
                        </IconButton>
                    )}
                    
                    <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(project)}
                        title="Edit Project"
                        sx={{ 
                            backdropFilter: 'blur(5px)',
                            background: 'transparent',
                            '&:hover': {
                                background: (theme) => alpha(theme.palette.background.paper, 0.3),
                            }
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    
                    <IconButton 
                        size="small" 
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete Project"
                        sx={{ 
                            backdropFilter: 'blur(5px)',
                            background: 'transparent',
                            '&:hover': {
                                background: (theme) => alpha(theme.palette.error.main, 0.15),
                                color: (theme) => theme.palette.error.main,
                            }
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </CardActions>
            </GlassSurface>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Projects</Typography>
                {!isMobile ? (
                    <VisionButton
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        glow
                    >
                        New Project
                    </VisionButton>
                ) : (
                    <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                            }
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} xl={3}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: '100%', border: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Active ({activeProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {activeProjects.map(renderProjectCard)}
                        {activeProjects.length === 0 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" my={3}>
                                No active projects
                            </Typography>
                        )}
                    </GlassSurface>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: '100%', border: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>On Hold ({onHoldProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {onHoldProjects.map(renderProjectCard)}
                        {onHoldProjects.length === 0 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" my={3}>
                                No projects on hold
                            </Typography>
                        )}
                    </GlassSurface>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: '100%', border: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlagIcon color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Completed ({completedProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {completedProjects.map(renderProjectCard)}
                        {completedProjects.length === 0 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" my={3}>
                                No completed projects
                            </Typography>
                        )}
                    </GlassSurface>
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <GlassSurface depth={1} opacity={0.3} sx={{ p: 2, height: '100%', border: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ArchiveIcon sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Archived ({archivedProjects.length})</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {archivedProjects.map(renderProjectCard)}
                        {archivedProjects.length === 0 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" my={3}>
                                No archived projects
                            </Typography>
                        )}
                    </GlassSurface>
                </Grid>
            </Grid>

            {/* Project Form Dialog */}
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
                        {isEditing ? 'Edit Project' : 'New Project'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pb: 3, px: 3 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Project Name"
                        fullWidth
                        value={currentProject.name || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
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
                        value={currentProject.description || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                        sx={{ 
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                backdropFilter: 'blur(8px)',
                                background: (theme) => alpha(theme.palette.background.paper, 0.2),
                            }
                        }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Goal"
                        fullWidth
                        value={currentProject.goal || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, goal: e.target.value })}
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
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={currentProject.status || 'active'}
                                    label="Status"
                                    onChange={(e) => setCurrentProject({ 
                                        ...currentProject, 
                                        status: e.target.value as Project['status'] 
                                    })}
                                    sx={{
                                        backdropFilter: 'blur(8px)',
                                        background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                        height: '56px', // Match the height
                                    }}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="on_hold">On Hold</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="archived">Archived</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
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
                                    sx={{
                                        backdropFilter: 'blur(8px)',
                                        background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                        height: '56px', // Match the height
                                    }}
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
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, mb: 4 }}>
                        <DatePicker
                            label="Due Date"
                            value={currentProject.dueDate ? new Date(currentProject.dueDate) : null}
                            onChange={(date) => setCurrentProject({ 
                                ...currentProject, 
                                dueDate: date ? date.toISOString() : null 
                            })}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    variant: 'outlined',
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
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Tags
                        </Typography>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <TextField
                                size="small"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add tag..."
                                sx={{ 
                                    flexGrow: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backdropFilter: 'blur(8px)',
                                        background: (theme) => alpha(theme.palette.background.paper, 0.2),
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <VisionButton 
                                onClick={handleAddTag}
                                variant="contained" 
                                sx={{ 
                                    ml: 1,
                                    '&:hover': { 
                                        '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root, .MuiTypography-root': {
                                            color: (theme) => alpha(theme.palette.primary.contrastText, 0.9),
                                        },
                                    }
                                }}
                                disabled={!tagInput}
                            >
                                Add
                            </VisionButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {currentProject.tags?.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                    size="small"
                                    sx={{ 
                                        backdropFilter: 'blur(5px)',
                                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                                        border: 'none',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
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
                        onClick={handleSaveProject} 
                        variant="contained"
                        disabled={!currentProject.name}
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
        </Box>
    );
};

export default ProjectsPage; 