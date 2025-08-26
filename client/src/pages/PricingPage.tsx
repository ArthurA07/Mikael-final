import React from 'react';
import { useSeo } from '../utils/seo';
import { Box, Container, Typography, Paper, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  useSeo({
    title: 'Тарифы — Супер Математика',
    description: 'Выберите подходящий тариф тренажёра ментальной арифметики. Доступ к тренажёрам и абакусу.',
  });
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Тарифы</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Здесь появятся тарифы и описание подписки. Пока вы можете оформить аккаунт и получить доступ к тренажёру и абакусу без ограничений.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" onClick={() => navigate('/register')}>Зарегистрироваться</Button>
          <Button variant="outlined" onClick={() => navigate('/login')}>Войти</Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PricingPage; 