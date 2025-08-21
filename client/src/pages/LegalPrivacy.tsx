import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalPrivacy: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Политика конфиденциальности</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Мы уважаем вашу приватность. Настоящая Политика описывает какие данные мы собираем
        при использовании сервиса «Супер Математика», для чего они используются, как
        защищаются и как вы можете управлять ими.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>1. Какие данные обрабатываются</Typography>
      <Typography variant="body2" paragraph>
        • идентификаторы аккаунта (имя, e‑mail),
        • результаты тренировок и достижения,
        • технические данные (IP, cookie) для обеспечения безопасности и аналитики.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>2. Цели обработки</Typography>
      <Typography variant="body2" paragraph>
        Предоставление функционала тренажёра, персонализация, статистика прогресса,
        безопасность, обратная связь и поддержка.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>3. Хранение и защита</Typography>
      <Typography variant="body2" paragraph>
        Данные хранятся в защищённых системах. Доступ ограничен уполномоченными лицами.
        Мы применяем технические и организационные меры безопасности.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>4. Ваши права</Typography>
      <Typography variant="body2" paragraph>
        Вы вправе запросить доступ, исправление, удаление данных, а также отозвать согласие
        на обработку, написав на адрес поддержки.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Контакты</Typography>
      <Typography variant="body2">
        support@example.com
      </Typography>
    </Paper>
  </Container>
);

export default LegalPrivacy; 