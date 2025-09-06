import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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
        // Если статистики нет, показываем дружелюбное состояние по умолчанию
        setError('Пока нет данных — начните тренировку, чтобы увидеть статистику');
        setData({ profile: { totalExercises: 0, correctAnswers: 0, bestAccuracy: 0 } });
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
        <Paper sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>
          <Button component={RouterLink} to="/trainer" variant="contained">
            Перейти к тренировкам
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 2 }}>
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

          {data?.training && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Сводка по тренировкам</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography color="text.secondary">Всего сессий</Typography>
                  <Typography variant="h5">{data.training.totalSessions ?? 0}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Лучший счёт</Typography>
                  <Typography variant="h5">{data.training.bestScore ?? 0}</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default StatsPage;
