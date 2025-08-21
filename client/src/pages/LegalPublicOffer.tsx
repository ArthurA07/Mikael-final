import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const LegalPublicOffer: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Публичная оферта</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Данный документ является предложением заключить договор оказания услуг по
        предоставлению доступа к функционалу «Супер Математика» на условиях, изложенных
        ниже.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Услуги и стоимость</Typography>
      <Typography variant="body2" paragraph>
        Перечень услуг, тарифы и сроки предоставления указываются на сайте. Оплата
        осуществляется безналичным способом через платёжный сервис. Возвраты — согласно
        политике возвратов и требованиям закона.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Порядок заключения</Typography>
      <Typography variant="body2" paragraph>
        Принятием оферты считается оплата услуг или фактическое использование платных
        функций. Договор считается заключённым с момента активации доступа.
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>Реквизиты и контакты</Typography>
      <Typography variant="body2">support@example.com</Typography>
    </Paper>
  </Container>
);

export default LegalPublicOffer; 