import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalPrivacy: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Политика конфиденциальности</Typography>
      <Typography variant="body1" color="text.secondary">
        Этот раздел будет содержать актуальную политику конфиденциальности. Текст предоставит сведения о целях и способах обработки персональных данных, правах пользователя и контактных данных оператора.
      </Typography>
    </Paper>
  </Container>
);

export default LegalPrivacy; 