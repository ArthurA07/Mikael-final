import React from 'react';
import { Box, Typography } from '@mui/material';

const StatsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4">Статистика</Typography>
      <Typography>Здесь будет отображаться ваша статистика и прогресс</Typography>
    </Box>
  );
};

export default StatsPage;
