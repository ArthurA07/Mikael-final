import React from 'react';
import { Box, Container, Stack, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        background: 'linear-gradient(135deg, #F8F9FA, #E9ECEF)',
        borderTop: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' } as any}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' } as any}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Супер Математика
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <MuiLink component={RouterLink} to="/privacy" underline="hover" color="text.secondary">
              Политика конфиденциальности
            </MuiLink>
            <MuiLink component={RouterLink} to="/data-consent" underline="hover" color="text.secondary">
              Согласие на обработку данных
            </MuiLink>
            <MuiLink component={RouterLink} to="/user-agreement" underline="hover" color="text.secondary">
              Пользовательское соглашение
            </MuiLink>
            <MuiLink component={RouterLink} to="/public-offer" underline="hover" color="text.secondary">
              Публичная оферта
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 