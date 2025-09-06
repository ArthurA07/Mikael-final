import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/user/stats');
        setData(res.data?.data);
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || 'Не удалось получить статистику');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2 }}>Статистика</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}>
            <Box>
              <Typography color="text.secondary">Всего упражнений</Typography>
              <Typography variant="h5">{data?.profile?.totalExercises ?? 0}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Правильных ответов</Typography>
              <Typography variant="h5">{data?.profile?.correctAnswers ?? 0}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Лучшая точность</Typography>
              <Typography variant="h5">{data?.profile?.bestAccuracy ?? 0}%</Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default StatsPage;
