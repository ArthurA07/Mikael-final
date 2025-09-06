import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const AchievementsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/user/stats');
        setItems(res.data?.data?.achievements || []);
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || 'Не удалось загрузить достижения');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2 }}>Достижения</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        (items.length ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {items.map((a, i) => (
              <Paper key={i} sx={{ p: 2 }}>
                <Typography variant="h6">{a.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>{a.description}</Typography>
                <Chip label={new Date(a.unlockedAt).toLocaleDateString()} />
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Достижения пока не получены</Typography>
        ))
      )}
    </Box>
  );
};

export default AchievementsPage;
