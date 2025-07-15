import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4">Личный кабинет</Typography>
      <Typography>Добро пожаловать в ваш личный кабинет!</Typography>
    </Box>
  );
};

export default Dashboard;
