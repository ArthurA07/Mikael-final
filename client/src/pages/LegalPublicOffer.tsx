import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalPublicOffer: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Публичная оферта</Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь будет размещён текст публичной оферты с описанием условий оказания услуг, стоимости, порядка оплаты и возвратов.
      </Typography>
    </Paper>
  </Container>
);

export default LegalPublicOffer; 