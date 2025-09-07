import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button, Stack, Chip, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';
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
  const [mode, setMode] = useState<'all' | 'digits' | 'abacus'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async (p = 1, m: 'all'|'digits'|'abacus' = mode, f: string = from, t: string = to) => {
    try {
      setLoading(true);
      const params: any = { page: p, limit: 10 };
      if (m !== 'all') params.mode = m;
      if (f) params.from = f;
      if (t) params.to = new Date(t).toISOString();
      const res = await axios.get('/user/training-history', { params });
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

  const setDays = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2 }}>История тренировок</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_, val) => { if (val) { setMode(val); load(1, val, from, to); } }}
        >
          <ToggleButton value="all">Все</ToggleButton>
          <ToggleButton value="digits">Цифры</ToggleButton>
          <ToggleButton value="abacus">Абакус</ToggleButton>
        </ToggleButtonGroup>
        <TextField label="С" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { height: 40 } }} />
        <TextField label="По" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { height: 40 } }} />
        <Button variant="contained" onClick={() => load(1)}>Применить</Button>
        <Button variant="text" onClick={() => { setMode('all'); setFrom(''); setTo(''); load(1); }}>Сбросить</Button>
        <Button variant="outlined" onClick={() => { setDays(7); }}>7 дней</Button>
        <Button variant="outlined" onClick={() => { setDays(30); }}>30 дней</Button>
        <Button
          variant="outlined"
          onClick={async () => {
            const params: any = {};
            if (mode !== 'all') params.mode = mode;
            if (from) params.from = from;
            if (to) params.to = new Date(to).toISOString();
            const res = await axios.get('/user/export/my-history', { responseType: 'blob', params });
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my-history.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
          }}
        >
          Экспорт выборки
        </Button>
      </Stack>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Alert severity="info">Пока нет завершённых тренировок. Пройдите тренировку, и здесь появится список.</Alert>
      ) : (
        <Stack spacing={2}>
          {items.map((t) => (
            <Paper key={t._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 1 }}>
              <Box sx={{ mb: { xs: 1, md: 0 } }}>
                <Typography variant="subtitle1">
                  {new Date(t.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.settings?.displayMode === 'abacus' ? 'Абакус' : 'Цифры'} · {t.settings?.operations?.join(', ')} · {t.settings?.numbersCount} чисел · 1–{t.settings?.numberRange}
                </Typography>
              </Box>
              <Stack direction="row" spacing={3} sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-start' } }}>
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
                  <Typography variant="caption">баллы</Typography>
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


