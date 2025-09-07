import React from 'react';
import { Box, Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';

const AboutTrainer: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>О тренажёре</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Что это</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Тренажёр для отработки устного счёта и навыков ментальной арифметики. Поддерживает показ чисел и визуализацию на абакусе.
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>Как начать</Typography>
          <List dense>
            <ListItem><ListItemText primary="Выберите режим: цифры или абакус." /></ListItem>
            <ListItem><ListItemText primary="Задайте количество примеров и чисел (действий) в примере." /></ListItem>
            <ListItem><ListItemText primary="Выберите диапазон, операции и скорость показа." /></ListItem>
            <ListItem><ListItemText primary="При желании включите последовательный показ по шагам." /></ListItem>
          </List>
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Подсказки</Typography>
          <List dense>
            <ListItem><ListItemText primary="Пауза перед стартом поможет подготовиться к серии." /></ListItem>
            <ListItem><ListItemText primary="Шрифт, позиция и цвет можно рандомизировать для усложнения." /></ListItem>
            <ListItem><ListItemText primary="Историю и статистику смотрите в разделе Статистика." /></ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AboutTrainer;


