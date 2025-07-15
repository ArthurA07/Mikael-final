import React from 'react';
import { Box, Typography } from '@mui/material';

const TrainerPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4">Числовой тренажёр</Typography>
      <Typography>Здесь будет интерактивный тренажёр ментальной арифметики</Typography>
    </Box>
  );
};

export default TrainerPage;
