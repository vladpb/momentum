import React from 'react';
import {
  Box, Typography, CardContent, CardActions, IconButton, Chip, alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
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
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {task.title}
        </Typography>
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
              sx={{ 
                mr: 0.5,
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
            {task.dueDate && (
              <Chip
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                variant="outlined"
                sx={{ 
                  backdropFilter: 'blur(8px)',
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                  border: 'none',
                }}
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