import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalDataConsent: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Согласие на обработку данных</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Нажимая «Зарегистрироваться» или используя сервис, вы даёте согласие на обработку
        персональных данных в целях предоставления функционала, коммуникации и улучшения
        качества сервиса.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Состав данных</Typography>
      <Typography variant="body2" paragraph>
        Имя, e‑mail, результаты тренировок, технические данные (cookie, IP). Данные не
        передаются третьим лицам, за исключением случаев, предусмотренных законом.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Срок и отзыв</Typography>
      <Typography variant="body2" paragraph>
        Согласие действует до его отзыва. Вы можете отозвать согласие, написав в поддержку
        — после этого часть функций может стать недоступной.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Контакты</Typography>
      <Typography variant="body2">support@example.com</Typography>
    </Paper>
  </Container>
);

export default LegalDataConsent; 