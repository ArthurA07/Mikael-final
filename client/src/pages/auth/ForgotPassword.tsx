import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setSuccess('Если такой email существует, мы отправили письмо с инструкцией. Проверьте входящие и Спам.');
      } else {
        setSuccess('Если такой email существует, мы отправили письмо с инструкцией.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Не удалось отправить письмо.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 480 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Восстановление пароля</Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={onSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            Отправить ссылку
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;


