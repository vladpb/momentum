import { useState, ReactNode } from 'react';
import {
    Box, Typography, IconButton,
    Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
    useMediaQuery, useTheme, alpha
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    CheckCircle as TasksIcon,
    CalendarMonth as CalendarIcon,
    BarChart as AnalyticsIcon,
    Settings as SettingsIcon,
    FolderSpecial as ProjectsIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import VisionBackground from '../ui/VisionBackground';

interface AppLayoutProps {
    children: ReactNode;
}

const drawerWidth = 240;

const AppLayout = ({ children }: AppLayoutProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
        { text: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
        { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
    ];

    const drawer = (
        <>
            <Box sx={{ 
                px: 2, 
                pt: 4,
                pb: 2,
                display: 'flex',
                justifyContent: 'center',
            }}>
                <Typography 
                    variant="h6" 
                    noWrap 
                    component="div"
                    sx={{
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #64D2FF 0%, #5E5CE6 100%)'
                            : 'linear-gradient(90deg, #007AFF 0%, #5E5CE6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700,
                        textTransform: 'lowercase',
                        letterSpacing: '0.05em',
                        fontSize: '1.5rem',
                        border: 'none',
                        outline: 'none',
                        textShadow: '0 2px 10px rgba(94, 92, 230, 0.2)',
                        padding: '8px 0',
                        textAlign: 'center',
                        width: '100%'
                    }}
                >
                    momentum
                </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
                <List sx={{ px: 1 }}>
                    {menuItems.map((item) => {
                        const isSelected = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={isSelected}
                                    sx={{
                                        borderRadius: '12px',
                                        mx: 1,
                                        my: 0.5,
                                        background: isSelected 
                                            ? alpha(theme.palette.primary.main, 0.1)
                                            : 'transparent',
                                        '&.Mui-selected': {
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                background: alpha(theme.palette.primary.main, 0.15),
                                            },
                                        },
                                        '&:hover': {
                                            background: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.dark,
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.primary.dark,
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon 
                                        sx={{ 
                                            color: isSelected ? theme.palette.primary.main : 'inherit',
                                            minWidth: '42px'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </>
    );

    // For mobile only - show a menu button
    const mobileMenuButton = isMobile && (
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{ 
                position: 'fixed', 
                top: 16, 
                left: 16, 
                zIndex: 1200,
                background: alpha(theme.palette.background.paper, 0.5),
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    background: alpha(theme.palette.background.paper, 0.7),
                }
            }}
        >
            <MenuIcon />
        </IconButton>
    );

    return (
        <Box sx={{ 
            display: 'flex', 
            position: 'relative', 
            width: '100vw',
            height: '100vh',
            overflow: 'hidden' 
        }}>
            {/* Background component */}
            <VisionBackground particles ambientLight />
            
            {mobileMenuButton}
            
            {/* Navigation drawer */}
            <Box
                component="nav"
                sx={{ 
                    width: { sm: drawerWidth }, 
                    flexShrink: { sm: 0 }, 
                    zIndex: 10
                }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: alpha(theme.palette.background.paper, 0.25),
                            backdropFilter: 'blur(10px)',
                            borderRight: 'none',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            
            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    height: '100vh',
                    overflow: 'auto',
                    zIndex: 5,
                    position: 'relative',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: '8px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: alpha(theme.palette.primary.main, 0.3),
                    }
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout;
