import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button, Stack, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

interface TrainingItem {
  _id: string;
  createdAt: string;
  results?: {
    totalProblems?: number;
    correctAnswers?: number;
    accuracy?: number;
    score?: number;
    totalTime?: number;
  };
  settings?: {
    numbersCount?: number;
    numberRange?: number;
    displayMode?: 'digits' | 'abacus';
    operations?: string[];
  };
}

const HistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axios.get('/user/training-history', { params: { page: p, limit: 10 } });
      setItems(res.data?.data?.trainings || []);
      setTotal(res.data?.data?.pagination?.total || 0);
      setPage(res.data?.data?.pagination?.current || p);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const hasPrev = page > 1;
  const hasNext = page * 10 < total;

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2 }}>История тренировок</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Alert severity="info">Пока нет завершённых тренировок. Пройдите тренировку, и здесь появится список.</Alert>
      ) : (
        <Stack spacing={2}>
          {items.map((t) => (
            <Paper key={t._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">
                  {new Date(t.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.settings?.displayMode === 'abacus' ? 'Абакус' : 'Цифры'} · {t.settings?.operations?.join(', ')} · {t.settings?.numbersCount} чисел · 1–{t.settings?.numberRange}
                </Typography>
              </Box>
              <Stack direction="row" spacing={3}>
                <Box textAlign="center">
                  <Typography variant="h6">{t.results?.totalProblems ?? 0}</Typography>
                  <Typography variant="caption">примеров</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{t.results?.accuracy ?? 0}%</Typography>
                  <Typography variant="caption">точность</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{t.results?.score ?? 0}</Typography>
                  <Typography variant="caption">счёт</Typography>
                </Box>
                <Button component={RouterLink} to={`/stats/history/${t._id}`} size="small" variant="outlined">Подробнее</Button>
              </Stack>
            </Paper>
          ))}
          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button variant="outlined" disabled={!hasPrev} onClick={() => load(page - 1)}>Назад</Button>
            <Button variant="outlined" disabled={!hasNext} onClick={() => load(page + 1)}>Вперёд</Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default HistoryPage;


