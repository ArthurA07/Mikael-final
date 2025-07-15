import React from 'react';
import { Box, Typography } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4">Профиль пользователя</Typography>
      <Typography>Здесь будут настройки профиля и персональные данные</Typography>
    </Box>
  );
};

export default ProfilePage;
