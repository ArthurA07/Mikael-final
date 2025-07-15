import React from 'react';
import { Box, Typography } from '@mui/material';

const AbacusPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4">Виртуальный абакус</Typography>
      <Typography>Здесь будет интерактивный абакус (соробан)</Typography>
    </Box>
  );
};

export default AbacusPage;
