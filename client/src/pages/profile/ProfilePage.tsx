import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Alert, Avatar, Divider, Collapse } from '@mui/material';
// используем CSS grid вместо MUI Grid, чтобы избежать типовых несовместимостей
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Статичный аватар со счётами (inline SVG)
  const DEFAULT_AVATAR =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffd5dc"/>
            <stop offset="100%" stop-color="#d1d4f9"/>
          </linearGradient>
        </defs>
        <rect width="128" height="128" rx="16" fill="url(#bg)"/>
        <rect x="20" y="16" width="88" height="96" rx="8" fill="#8B5E3C"/>
        <rect x="26" y="24" width="76" height="80" rx="4" fill="#C08A5C"/>
        <!-- перекладины -->
        <g stroke="#6D3F24" stroke-width="4">
          <line x1="34" y1="40" x2="94" y2="40"/>
          <line x1="34" y1="60" x2="94" y2="60"/>
          <line x1="34" y1="80" x2="94" y2="80"/>
        </g>
        <!-- косточки -->
        <g>
          <circle cx="46" cy="40" r="7" fill="#FF7F50"/>
          <circle cx="66" cy="40" r="7" fill="#FF7F50"/>
          <circle cx="86" cy="40" r="7" fill="#FF7F50"/>
          <circle cx="46" cy="60" r="7" fill="#4ECDC4"/>
          <circle cx="66" cy="60" r="7" fill="#4ECDC4"/>
          <circle cx="86" cy="60" r="7" fill="#4ECDC4"/>
          <circle cx="46" cy="80" r="7" fill="#FFD93D"/>
          <circle cx="66" cy="80" r="7" fill="#FFD93D"/>
          <circle cx="86" cy="80" r="7" fill="#FFD93D"/>
        </g>
      </svg>
    `);
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
      setEmail(user.email || '');
      // аватар теперь статичный для всех
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
      // аватар не редактируется — статичный
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
            {/* Статичный аватар для всех пользователей */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={DEFAULT_AVATAR} sx={{ width: 64, height: 64 }} />
            </Stack>
          {/* Email (только для чтения) */}
          <TextField 
            label="Email" 
            value={email}
            InputProps={{ readOnly: true }}
          />
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

        {/* Блок выбора аватаров скрыт по запросу */}

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
