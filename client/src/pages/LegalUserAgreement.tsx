import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalUserAgreement: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Пользовательское соглашение</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Настоящее Соглашение регулирует отношения между пользователем и «Супер Математика»
        при использовании сайта и функционала тренажёра. Заходя на сайт, вы подтверждаете
        принятие условий Соглашения.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Основные положения</Typography>
      <Typography variant="body2" paragraph>
        • Сервис предоставляется «как есть». Мы стремимся обеспечивать доступность, но
        перерывы в работе возможны.
        • Пользователь обязуется не совершать действий, нарушающих работу сервиса и права
        третьих лиц.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Интеллектуальные права</Typography>
      <Typography variant="body2" paragraph>
        Материалы сайта защищены. Запрещено копирование, распространение и использование
        вне сервиса без разрешения правообладателя.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Ответственность</Typography>
      <Typography variant="body2" paragraph>
        Стороны несут ответственность в пределах, установленных законодательством. Сервис
        не несёт ответственности за сбои связи и действия третьих лиц.
      </Typography>
    </Paper>
  </Container>
);

export default LegalUserAgreement; 