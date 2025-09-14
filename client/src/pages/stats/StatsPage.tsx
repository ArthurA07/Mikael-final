import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { isLoading, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/user/stats', { params: { period } });
        setData(res.data?.data);
        // визуализация графиков временно отключена
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

  const resetStats = async (withHistory: boolean) => {
    try {
      setResetLoading(true);
      await axios.post('/user/stats/reset', { deleteHistory: withHistory });
      // Перезагружаем статистику
      const res = await axios.get('/user/stats', { params: { period } });
      setData(res.data?.data);
    } catch (e) {
      // no-op; можно добавить уведомление
    } finally {
      setResetLoading(false);
      setConfirmOpen(false);
    }
  };

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
            <Box sx={{ mt: 2 }}>
              <Button variant="text" color="error" onClick={() => setConfirmOpen(true)}>
                Сбросить статистику
              </Button>
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

          
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Сбросить статистику?</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                Можно сбросить только агрегаты профиля или также удалить историю тренировок.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} disabled={resetLoading}>Отмена</Button>
              <Button onClick={() => resetStats(false)} disabled={resetLoading}>Сбросить только статистику</Button>
              <Button color="error" onClick={() => resetStats(true)} disabled={resetLoading}>Сбросить и удалить историю</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default StatsPage;
