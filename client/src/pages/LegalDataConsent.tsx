import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalDataConsent: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Согласие на обработку данных</Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь размещается форма и условия согласия на обработку персональных данных. Укажите основания обработки, срок и способы отзыва согласия.
      </Typography>
    </Paper>
  </Container>
);

export default LegalDataConsent; 