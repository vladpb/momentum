import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Paper
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useTaskStore, Task } from '../../store/taskStore';

interface TaskTimerProps {
    task: Task;
}

// Format time in minutes to HH:MM:SS
const formatTime = (timeInMinutes: number): string => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.floor(timeInMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format time in seconds to HH:MM:SS
const formatTimeInSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TaskTimer: React.FC<TaskTimerProps> = ({ task }) => {
    const { startTimeTracking, stopTimeTracking, addTimeEntry } = useTaskStore();
    const [isRunning, setIsRunning] = useState(task.timeTracking.isRunning);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [manualEntry, setManualEntry] = useState({
        hours: 0,
        minutes: 0,
        notes: ''
    });
    
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        setIsRunning(task.timeTracking.isRunning);
        
        // If the timer is running, calculate the elapsed time
        if (task.timeTracking.isRunning && task.timeTracking.startTime) {
            const startTimeMs = new Date(task.timeTracking.startTime).getTime();
            const currentMs = new Date().getTime();
            const elapsedSeconds = Math.floor((currentMs - startTimeMs) / 1000);
            setElapsedTime(elapsedSeconds);
            
            // Start the timer
            startTimeRef.current = startTimeMs;
            timerRef.current = window.setInterval(() => {
                const now = new Date().getTime();
                const elapsed = Math.floor((now - startTimeMs) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            // Reset the timer
            setElapsedTime(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            startTimeRef.current = null;
        }
        
        // Cleanup function
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [task.timeTracking.isRunning, task.timeTracking.startTime]);

    const handleStartTimer = () => {
        startTimeTracking(task.id);
        setIsRunning(true);
    };

    const handlePauseTimer = () => {
        if (isRunning) {
            stopTimeTracking(task.id, 'Paused');
            setIsRunning(false);
        } else {
            startTimeTracking(task.id);
            setIsRunning(true);
        }
    };

    const handleStopTimer = () => {
        stopTimeTracking(task.id);
        setIsRunning(false);
    };

    const handleOpenManualDialog = () => {
        setManualEntry({
            hours: 0,
            minutes: 0,
            notes: ''
        });
        setDialogOpen(true);
    };

    const handleCloseManualDialog = () => {
        setDialogOpen(false);
    };

    const handleAddManualEntry = () => {
        const totalMinutes = (manualEntry.hours * 60) + manualEntry.minutes;
        
        if (totalMinutes > 0) {
            const now = new Date();
            const startTime = new Date(now.getTime() - (totalMinutes * 60000)).toISOString();
            const endTime = now.toISOString();
            
            addTimeEntry(task.id, {
                startTime,
                endTime,
                duration: totalMinutes,
                notes: manualEntry.notes
            });
            
            handleCloseManualDialog();
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Time Tracking</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                    Total time: {formatTime(task.timeTracking.totalTime)}
                </Typography>
                
                {isRunning && (
                    <Typography variant="body2" color="primary">
                        Current: {formatTimeInSeconds(elapsedTime)}
                    </Typography>
                )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
                {!isRunning ? (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<PlayIcon />}
                        onClick={handleStartTimer}
                        size="small"
                    >
                        Start
                    </Button>
                ) : (
                    <>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<PauseIcon />}
                            onClick={handlePauseTimer}
                            size="small"
                        >
                            Pause
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<StopIcon />}
                            onClick={handleStopTimer}
                            size="small"
                        >
                            Stop
                        </Button>
                    </>
                )}
                
                <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenManualDialog}
                    size="small"
                    sx={{ ml: 'auto' }}
                >
                    Add Time
                </Button>
            </Box>
            
            {task.timeTracking.timeEntries.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Recent Time Entries
                    </Typography>
                    
                    {task.timeTracking.timeEntries.slice(-3).reverse().map((entry) => (
                        <Box 
                            key={entry.id} 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                py: 1,
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box>
                                <Typography variant="body2">
                                    {new Date(entry.startTime).toLocaleDateString()} {' '}
                                    {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                {entry.notes && (
                                    <Typography variant="caption" color="text.secondary">
                                        {entry.notes}
                                    </Typography>
                                )}
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                                {formatTime(entry.duration)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
            
            {/* Manual Time Entry Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseManualDialog}>
                <DialogTitle>Add Time Manually</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
                        <TextField
                            label="Hours"
                            type="number"
                            value={manualEntry.hours}
                            onChange={(e) => setManualEntry({ 
                                ...manualEntry, 
                                hours: Math.max(0, parseInt(e.target.value) || 0)
                            })}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                        <TextField
                            label="Minutes"
                            type="number"
                            value={manualEntry.minutes}
                            onChange={(e) => setManualEntry({ 
                                ...manualEntry, 
                                minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                            })}
                            InputProps={{ inputProps: { min: 0, max: 59 } }}
                        />
                    </Box>
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={manualEntry.notes}
                        onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseManualDialog}>Cancel</Button>
                    <Button 
                        onClick={handleAddManualEntry} 
                        variant="contained"
                        disabled={manualEntry.hours === 0 && manualEntry.minutes === 0}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TaskTimer; 