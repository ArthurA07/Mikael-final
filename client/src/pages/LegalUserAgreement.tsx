import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalUserAgreement: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Пользовательское соглашение</Typography>
      <Typography variant="body1" color="text.secondary">
        В этом документе описываются условия использования сервиса, права и обязанности сторон, порядок разрешения споров и иные важные положения.
      </Typography>
    </Paper>
  </Container>
);

export default LegalUserAgreement; 