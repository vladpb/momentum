import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button,
    Avatar, Grid
} from '@mui/material';
import { useUserStore } from '../store/userStore';

const Profile = () => {
    const { user, updateUser } = useUserStore();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        bio: user.bio || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(formData);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>User Profile</Typography>

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            sx={{ width: 120, height: 120, mb: 2 }}
                            src={user.avatar || undefined}
                        />
                        <Button variant="outlined">Change Avatar</Button>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Bio"
                                name="bio"
                                multiline
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                            >
                                Save Changes
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Profile;
