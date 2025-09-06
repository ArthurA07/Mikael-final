import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSaving(true);
      const payload: any = {};
      if (name.trim()) payload.name = name.trim();
      if (phone.trim()) payload.phone = phone.trim();
      const res = await axios.put('/auth/profile', payload);
      if (res.data?.success) {
        updateUser(res.data.data.user);
        setSuccess('Профиль обновлён');
      } else {
        setError('Не удалось сохранить профиль');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 2 }}>Профиль пользователя</Typography>
      <Paper sx={{ p: 3, maxWidth: 520 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={onSave}>
          <Stack spacing={2}>
            <TextField 
              label="Имя" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              inputProps={{ minLength: 2, maxLength: 50 }}
              helperText="От 2 до 50 символов"
              required
            />
            <TextField 
              label="Телефон" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="+7 999 123-45-67"
              helperText="Формат: +7 999 123-45-67"
            />
            <Button type="submit" variant="contained" disabled={saving}>
              Сохранить
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
