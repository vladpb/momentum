import React from 'react';
import {
  Box, Typography, CardContent, CardActions, IconButton, Chip, alpha, Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as DoneIcon,
  Timelapse as InProgressIcon,
  RadioButtonUnchecked as TodoIcon,
  AccessTime as TimeIcon,
  Timer as DurationIcon
} from '@mui/icons-material';
import { Task } from '../../store/taskStore';
import GlassSurface from '../ui/GlassSurface';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onClick, dragHandleProps = {} }) => {
  // Format time for display
  const formatEstimatedTime = (minutes: number | null): string => {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Get status icon based on task status
  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <DoneIcon fontSize="small" sx={{ color: theme => theme.palette.success.main }} />;
      case 'in_progress':
        return <InProgressIcon fontSize="small" sx={{ color: theme => theme.palette.warning.main }} />;
      default:
        return <TodoIcon fontSize="small" sx={{ color: theme => theme.palette.text.secondary }} />;
    }
  };

  return (
    <GlassSurface
      sx={{ 
        mb: 1.5, 
        cursor: 'pointer', 
        overflow: 'visible',
        borderRadius: '12px',
        border: 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
      {...dragHandleProps}
      depth={1}
      opacity={0.4}
      glowBorder={task.priority === 'high' || task.priority === 'urgent'}
      gradient={
        task.priority === 'low' 
          ? 'linear-gradient(135deg, #34C759, #00BA34)' 
          : task.priority === 'medium'
          ? 'linear-gradient(135deg, #FF9500, #FF6B00)'
          : 'linear-gradient(135deg, #FF3B30, #CF2F26)'
      }
      onClick={onClick}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ mr: 1 }}>
            {getStatusIcon()}
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexGrow: 1
            }}
          >
            {task.title}
          </Typography>
        </Box>
        
        {task.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap 
            sx={{ 
              mb: 1,
              opacity: 0.85
            }}
          >
            {task.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
            <Chip
              label={task.priority}
              size="small"
              color={
                task.priority === 'low' ? 'success' :
                task.priority === 'medium' ? 'warning' :
                task.priority === 'high' ? 'error' : 'error'
              }
              sx={{ 
                backdropFilter: 'blur(8px)',
                background: (theme) => 
                  task.priority === 'low' 
                    ? alpha(theme.palette.success.main, 0.15)
                    : task.priority === 'medium'
                    ? alpha(theme.palette.warning.main, 0.15)
                    : alpha(theme.palette.error.main, 0.15),
                border: 'none',
                color: (theme) => 
                  task.priority === 'low' 
                    ? theme.palette.success.main
                    : task.priority === 'medium'
                    ? theme.palette.warning.main
                    : theme.palette.error.main,
              }}
            />
            
            {task.estimatedTime && (
              <Tooltip title="Estimated time">
                <Chip
                  icon={<DurationIcon fontSize="small" />}
                  label={formatEstimatedTime(task.estimatedTime)}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    backdropFilter: 'blur(8px)',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    border: 'none',
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {task.dueDate && (
          <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleString()}`}>
            <Chip
              icon={<TimeIcon fontSize="small" />}
              label={new Date(task.dueDate).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              size="small"
              variant="outlined"
              sx={{ 
                backdropFilter: 'blur(8px)',
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                border: 'none',
                mt: 0.5
              }}
            />
          </Tooltip>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          sx={{ 
            backdropFilter: 'blur(5px)',
            background: 'transparent',
            '&:hover': {
              background: (theme) => alpha(theme.palette.background.paper, 0.3),
            }
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
          sx={{ 
            backdropFilter: 'blur(5px)',
            background: 'transparent',
            '&:hover': {
              background: (theme) => alpha(theme.palette.error.main, 0.15),
              color: (theme) => theme.palette.error.main,
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </GlassSurface>
  );
};

export default TaskCard; 