import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Legend);
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { isLoading, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [progress7, setProgress7] = useState<any[]>([]);
  const [progress30, setProgress30] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/user/stats', { params: { period } });
        setData(res.data?.data);
        const [p7, p30] = await Promise.all([
          axios.get('/user/progress', { params: { days: 7 } }),
          axios.get('/user/progress', { params: { days: 30 } }),
        ]);
        setProgress7(p7.data?.data?.progress || []);
        setProgress30(p30.data?.data?.progress || []);
      } catch (e: any) {
        // Если статистики нет, показываем дружелюбное состояние по умолчанию
        setError('Пока нет данных — начните тренировку, чтобы увидеть статистику');
        setData({ profile: { totalExercises: 0, correctAnswers: 0, bestAccuracy: 0 } });
      } finally {
        setLoading(false);
      }
    };
    if (!isLoading && isAuthenticated) {
      load();
    }
  }, [isLoading, isAuthenticated, period]);

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
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={period}
              onChange={(_, val) => { if (val) setPeriod(val); }}
            >
              <ToggleButton value="week">Неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
              <ToggleButton value="all">Всё время</ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
              <Box sx={{ mt: 2 }}>
                <Button component={RouterLink} to="/stats/history" variant="outlined">История тренировок</Button>
              </Box>
            </Paper>
          )}

          {data?.lastSession && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Последняя сессия</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography color="text.secondary">Дата</Typography>
                  <Typography variant="body1">{new Date(data.lastSession.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Режим</Typography>
                  <Typography variant="body1">{data.lastSession.settings?.displayMode === 'abacus' ? 'Абакус' : 'Цифры'}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Точность</Typography>
                  <Typography variant="body1">{data.lastSession.results?.accuracy ?? 0}%</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Счёт</Typography>
                  <Typography variant="body1">{data.lastSession.results?.score ?? 0}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => localStorage.setItem('trainerSettings', JSON.stringify(data.lastSession.settings || {}))}
                  component={RouterLink}
                  to="/trainer"
                >
                  Повторить с теми же настройками
                </Button>
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Точность и время</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>7 дней — точность (%)</Typography>
                <Line height={140} data={{
                  labels: progress7.map(p => p._id),
                  datasets: [{ label: 'Accuracy', data: progress7.map(p => Math.round(p.accuracy || 0)), borderColor: '#667eea', tension: 0.3 }]
                }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>30 дней — суммарное время (сек)</Typography>
                <Line height={140} data={{
                  labels: progress30.map(p => p._id),
                  datasets: [{ label: 'Time', data: progress30.map(p => Math.round((p.totalTime || 0) / 1000)), borderColor: '#4ECDC4', tension: 0.3 }]
                }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default StatsPage;
