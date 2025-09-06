import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Alert, Avatar, Divider, Tooltip, Collapse } from '@mui/material';
// используем CSS grid вместо MUI Grid, чтобы избежать типовых несовместимостей
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdOpen, setPwdOpen] = useState(false);

  // Набор готовых детских аватаров (DiceBear, публичные ссылки)
  const presetAvatars: string[] = Array.from({ length: 20 }).map((_, i) =>
    `https://api.dicebear.com/7.x/big-smile/svg?seed=kid${i + 1}&radius=50&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`
  );

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar((user as any).avatar || '');
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
      if (avatar.trim()) payload.avatar = avatar.trim();
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

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr(null);
    setPwdMsg(null);
    if (newPassword.length < 6) {
      setPwdErr('Новый пароль минимум 6 символов');
      return;
    }
    try {
      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdMsg('Пароль обновлён');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setPwdErr(e?.response?.data?.error?.message || 'Не удалось изменить пароль');
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
            {/* скрытая кнопка для сброса локального статуса, если понадобится */}
            <Button variant="outlined" onClick={() => { setSuccess(null); setError(null); setSaving(false); }} sx={{ display: 'none' }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={avatar} sx={{ width: 64, height: 64 }} />
              <TextField label="Ссылка на аватар" value={avatar} onChange={e => setAvatar(e.target.value)} fullWidth />
            </Stack>
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

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Выбрать готовый аватар</Typography>
        <Box sx={{
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(4, 56px)',
            sm: 'repeat(6, 56px)',
            md: 'repeat(8, 56px)'
          },
          gap: 1
        }}>
          {presetAvatars.map((url, idx) => (
            <Box key={idx} sx={{ width: 56, height: 56 }}>
              <Tooltip title="Выбрать">
                <Avatar
                  src={url}
                  sx={{ width: 56, height: 56, cursor: 'pointer', border: avatar === url ? '2px solid #667eea' : '2px solid transparent' }}
                  onClick={() => setAvatar(url)}
                />
              </Tooltip>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Сменить пароль</Typography>
        <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={() => setPwdOpen(v => !v)}>
          {pwdOpen ? 'Скрыть' : 'Открыть'} форму
        </Button>
        <Collapse in={pwdOpen}>
          {pwdMsg && <Alert severity="success" sx={{ mb: 2 }}>{pwdMsg}</Alert>}
          {pwdErr && <Alert severity="error" sx={{ mb: 2 }}>{pwdErr}</Alert>}
          <form onSubmit={onChangePassword}>
            <Stack spacing={2}>
              <TextField
                label="Текущий пароль"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <TextField
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                inputProps={{ minLength: 6 }}
                helperText="Минимум 6 символов"
              />
              <Button type="submit" variant="outlined">Обновить пароль</Button>
            </Stack>
          </form>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
