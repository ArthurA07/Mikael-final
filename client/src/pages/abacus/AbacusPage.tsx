import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import InteractiveAbacus from '../../components/abacus/InteractiveAbacus';

const AbacusPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Хлебные крошки и заголовок */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          🧮 Виртуальный Абакус
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Изучайте основы ментальной арифметики с помощью интерактивного соробана. 
          Перемещайте костяшки, изучайте разряды и тренируйтесь в игровом режиме!
        </Typography>
      </Paper>

      {/* Описание функций */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '15px',
          background: '#F8F9FA',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
          📚 Как пользоваться абакусом:
        </Typography>
        
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF6B6B', mb: 1 }}>
              🖱️ Интерактивность
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Кликайте по костяшкам, чтобы перемещать их вверх и вниз. 
              Верхняя костяшка = 5, каждая нижняя = 1.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#4ECDC4', mb: 1 }}>
              🔢 Двусторонняя синхронизация
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Вводите числа в поле, и абакус покажет их автоматически. 
              Или наоборот - двигайте костяшки и смотрите результат.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFD93D', mb: 1 }}>
              🎮 Игровой режим
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Установите диапазон чисел и проверяйте свои навыки! 
              Система покажет число, а вы установите его на абакусе.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#6BCF7F', mb: 1 }}>
              ⚙️ Настройки
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Измените количество разрядов (1-13), включите/отключите 
              отображение значений и подписей разрядов.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#A8E6CF', mb: 1 }}>
              📱 Мобильная поддержка
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Полностью адаптирован для сенсорных экранов. 
              Используйте касания для перемещения костяшек.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFB74D', mb: 1 }}>
              🎯 Обучение
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Изучайте принципы ментальной арифметики, 
              понимайте, как работают разряды и развивайте навыки счета.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Основной компонент абакуса */}
      <InteractiveAbacus />
      
      {/* Дополнительная информация */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mt: 4, 
          borderRadius: '15px',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          💡 Полезные советы для изучения
        </Typography>
        
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 3,
            mt: 3
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              🎯 Начинающим
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
              • Начните с простых чисел (1-9)<br/>
              • Изучите, как работает каждая костяшка<br/>
              • Практикуйтесь с включенными подписями разрядов<br/>
              • Используйте поле ввода для проверки результатов
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              🚀 Продвинутым
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
              • Отключите отображение значений для усложнения<br/>
              • Увеличьте количество разрядов до 10-13<br/>
              • Тренируйтесь в игровом режиме с большими числами<br/>
              • Развивайте скорость установки чисел на абакусе
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AbacusPage;
