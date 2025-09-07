import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, IconButton, InputAdornment, Pagination, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search, FileDownload, Refresh } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPassword2, setResetPassword2] = useState('');
  const [resetError, setResetError] = useState('');

  const load = useMemo(() => async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users', { params: { q, page, limit } });
      const data = res.data?.data;
      setUsers(data?.items || []);
      setTotalPages(data?.pagination?.total || 1);
    } finally {
      setLoading(false);
    }
  }, [q, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async (userId: string) => {
    // Запрашиваем CSV с авторизацией и скачиваем как файл
    const res = await axios.get(`/admin/users/${userId}/export`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'history.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const openResetPassword = (userId: string) => {
    setResetUserId(userId);
    setResetPassword('');
    setResetPassword2('');
    setResetError('');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let out = '';
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setResetPassword(out);
    setResetPassword2(out);
  };

  const handleResetSubmit = async () => {
    if (!resetPassword || resetPassword.length < 8) {
      setResetError('Минимум 8 символов');
      return;
    }
    if (resetPassword !== resetPassword2) {
      setResetError('Пароли не совпадают');
      return;
    }
    try {
      await axios.post(`/admin/users/${resetUserId}/reset-password`, { newPassword: resetPassword });
      alert('Пароль обновлён');
      setResetUserId(null);
    } catch (e: any) {
      setResetError(e?.response?.data?.error?.message || 'Ошибка сброса пароля');
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Админ-панель</Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по email или имени"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Button variant="contained" onClick={() => { setPage(1); load(); }}>Искать</Button>
            <IconButton onClick={() => { setQ(''); setPage(1); load(); }}><Refresh /></IconButton>
            <Chip label={`Стр. ${page} / ${totalPages}`} color="primary" />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Создан</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{dayjs(u.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport(u._id)}>Экспорт</Button>
                    <Button size="small" sx={{ ml: 1 }} variant="contained" color="warning" onClick={() => openResetPassword(u._id)}>Сброс пароля</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
          {loading && <Typography sx={{ mt: 1 }}>Загрузка...</Typography>}
        </CardContent>
      </Card>

      <Dialog open={!!resetUserId} onClose={() => setResetUserId(null)}>
        <DialogTitle>Сброс пароля</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            type="password"
            label="Новый пароль (мин. 8 символов)"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            fullWidth
            type="password"
            label="Повторите пароль"
            value={resetPassword2}
            onChange={(e) => setResetPassword2(e.target.value)}
          />
          {!!resetError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>{resetError}</Typography>
          )}
          <Button onClick={generatePassword} sx={{ mt: 1 }}>
            Сгенерировать безопасный пароль
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUserId(null)}>Отмена</Button>
          <Button variant="contained" onClick={handleResetSubmit}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;


