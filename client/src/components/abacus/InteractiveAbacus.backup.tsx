import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Типы данных
interface AbacusColumn {
  upper: boolean;  // верхняя костяшка (значение 5)
  lower: number;   // количество активных нижних костяшек (0-4)
}

interface AbacusState {
  columns: AbacusColumn[];
  showValue: boolean;
  showLabels: boolean;
  columnsCount: number;
  gameMode: boolean;
  gameRange: { min: number; max: number };
  targetNumber: number | null;
  gameResult: 'none' | 'correct' | 'incorrect';
}

// Стилизованные компоненты для реалистичного соробана
const AbacusFrame = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #654321 100%)',
  borderRadius: '12px',
  padding: '25px 20px',
  boxShadow: '0 15px 40px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.1)',
  border: '3px solid #4A4A4A',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    borderRadius: '12px',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
    pointerEvents: 'none',
  },
}));

const Crossbeam = styled(Box)({
  position: 'absolute',
  left: '15px',
  right: '15px',
  top: '45%',
  height: '8px',
  background: 'linear-gradient(to bottom, #654321, #4A4A4A, #654321)',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)',
  zIndex: 10,
});

const Rod = styled(Box)({
  width: '4px',
  height: '280px',
  background: 'linear-gradient(to right, #2C2C2C, #4A4A4A, #2C2C2C)',
  borderRadius: '2px',
  position: 'relative',
  margin: '0 auto',
  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.5)',
});

const BeadDiamond = styled(Box)<{ isActive: boolean; isUpper: boolean }>(({ isActive, isUpper }) => ({
  width: isUpper ? '32px' : '28px',
  height: isUpper ? '16px' : '14px',
  background: isActive 
    ? 'linear-gradient(45deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)'
    : 'linear-gradient(45deg, #8B7D6B 0%, #A0937D 50%, #6D6652 100%)',
  borderRadius: '50%',
  cursor: 'pointer',
  position: 'absolute',
  left: '50%',
  transform: `translateX(-50%) ${isActive ? 'scaleY(1.2)' : 'scaleY(0.8)'}`,
  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  boxShadow: isActive 
    ? '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 3px rgba(255,255,255,0.3)' 
    : '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)',
  border: `1px solid ${isActive ? '#B8860B' : '#5D5D5D'}`,
  '&:hover': {
    transform: 'translateX(-50%) scale(1.15)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  '&:active': {
    transform: 'translateX(-50%) scale(0.95)',
    transition: 'all 0.1s ease',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '25%',
    height: '25%',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
}));

const ColumnContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  minWidth: '50px',
});

const UpperSection = styled(Box)({
  height: '100px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  paddingBottom: '15px',
});

const LowerSection = styled(Box)({
  height: '140px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingTop: '25px',
});

const ColumnLabel = styled(Typography)({
  fontSize: '0.7rem',
  fontWeight: 700,
  textAlign: 'center',
  color: '#FFFFFF',
  marginBottom: '8px',
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '6px',
  padding: '2px 6px',
  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  border: '1px solid rgba(255,255,255,0.2)',
});

const InteractiveAbacus: React.FC = () => {
  const [state, setState] = useState<AbacusState>({
    columns: Array(5).fill(null).map(() => ({ upper: false, lower: 0 })),
    showValue: true,
    showLabels: true,
    columnsCount: 5,
    gameMode: false,
    gameRange: { min: 1, max: 99999 },
    targetNumber: null,
    gameResult: 'none',
  });

  const [inputValue, setInputValue] = useState('0');
  const [showGameDialog, setShowGameDialog] = useState(false);

  // Вычисление текущего значения абакуса
  const calculateValue = useCallback((columns: AbacusColumn[]): number => {
    return columns.reduce((total, column, index) => {
      const position = columns.length - 1 - index;
      const multiplier = Math.pow(10, position);
      const columnValue = (column.upper ? 5 : 0) + column.lower;
      return total + (columnValue * multiplier);
    }, 0);
  }, []);

  // Обновление значения при изменении абакуса
  useEffect(() => {
    const value = calculateValue(state.columns);
    setInputValue(value.toString());
  }, [state.columns, calculateValue]);

  // Установка числа на абакусе
  const setAbacusValue = useCallback((value: number) => {
    const newColumns = [...state.columns];
    const valueStr = value.toString().padStart(newColumns.length, '0');
    
    for (let i = 0; i < newColumns.length; i++) {
      const digit = parseInt(valueStr[i]);
      newColumns[i] = {
        upper: digit >= 5,
        lower: digit >= 5 ? digit - 5 : digit,
      };
    }
    
    setState(prev => ({ ...prev, columns: newColumns }));
  }, [state.columns.length]);

  // Обработка клика по костяшке
  const handleBeadClick = (columnIndex: number, beadType: 'upper' | 'lower', beadIndex?: number) => {
    if (state.gameMode) return; // В игровом режиме только проверка
    
    const newColumns = [...state.columns];
    
    if (beadType === 'upper') {
      newColumns[columnIndex].upper = !newColumns[columnIndex].upper;
    } else if (beadIndex !== undefined) {
      const currentLower = newColumns[columnIndex].lower;
      newColumns[columnIndex].lower = beadIndex < currentLower ? beadIndex : beadIndex + 1;
    }
    
    setState(prev => ({ ...prev, columns: newColumns }));
  };

  // Обнуление абакуса
  const resetAbacus = () => {
    const newColumns = state.columns.map(() => ({ upper: false, lower: 0 }));
    setState(prev => ({ ...prev, columns: newColumns }));
  };

  // Изменение количества разрядов
  const changeColumnsCount = (count: number) => {
    const newColumns = Array(count).fill(null).map(() => ({ upper: false, lower: 0 }));
    setState(prev => ({ ...prev, columns: newColumns, columnsCount: count }));
  };

  // Обработка ввода числа
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    const maxValue = Math.pow(10, state.columns.length) - 1;
    
    if (value <= maxValue) {
      setInputValue(event.target.value);
      setAbacusValue(value);
    }
  };

  // Запуск игры
  const startGame = () => {
    const min = Math.max(state.gameRange.min, 0);
    const max = Math.min(state.gameRange.max, Math.pow(10, state.columns.length) - 1);
    const targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    setState(prev => ({
      ...prev,
      gameMode: true,
      targetNumber,
      gameResult: 'none',
    }));
    
    resetAbacus();
    setShowGameDialog(true);
  };

  // Проверка ответа в игре
  const checkAnswer = () => {
    const currentValue = calculateValue(state.columns);
    const isCorrect = currentValue === state.targetNumber;
    
    setState(prev => ({
      ...prev,
      gameResult: isCorrect ? 'correct' : 'incorrect',
    }));
  };

  // Завершение игры
  const endGame = () => {
    setState(prev => ({
      ...prev,
      gameMode: false,
      targetNumber: null,
      gameResult: 'none',
    }));
    setShowGameDialog(false);
  };



  // Рендер одной колонки абакуса
  const renderColumn = (column: AbacusColumn, columnIndex: number) => {
    const position = state.columns.length - columnIndex;
    
    return (
      <ColumnContainer key={columnIndex}>
        {state.showLabels && (
          <ColumnLabel>
            {position === 1 ? '1' : 
             position === 2 ? '10' :
             position === 3 ? '100' :
             position === 4 ? '1K' :
             position === 5 ? '10K' :
             position === 6 ? '100K' :
             position === 7 ? '1M' :
             `10^${position-1}`}
          </ColumnLabel>
        )}
        
        <ColumnContainer>
          <Rod>
            {/* Верхняя секция - одна костяшка (значение 5) */}
            <UpperSection>
              <BeadDiamond
                isActive={column.upper}
                isUpper={true}
                onClick={() => handleBeadClick(columnIndex, 'upper')}
                style={{
                  top: column.upper ? '60px' : '20px',
                }}
              />
            </UpperSection>
            
            {/* Нижняя секция - четыре костяшки (значения 1) */}
            <LowerSection>
              {[0, 1, 2, 3].map((beadIndex) => (
                <BeadDiamond
                  key={beadIndex}
                  isActive={beadIndex < column.lower}
                  isUpper={false}
                  onClick={() => handleBeadClick(columnIndex, 'lower', beadIndex)}
                  style={{
                    top: beadIndex < column.lower 
                      ? `${10 + beadIndex * 20}px`
                      : `${90 + beadIndex * 20}px`,
                  }}
                />
              ))}
            </LowerSection>
          </Rod>
        </ColumnContainer>
        
        {state.showValue && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              fontWeight: 600,
              color: '#FFFFFF',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              padding: '2px 4px',
            }}
          >
            {((column.upper ? 5 : 0) + column.lower) || '0'}
          </Typography>
        )}
      </ColumnContainer>
    );
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          background: 'linear-gradient(45deg, #8B4513, #D2691E)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          mb: 4,
        }}
      >
        🧮 Интерактивный Абакус (Соробан)
      </Typography>

      {/* Настройки */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '15px' }}>
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(4, 1fr)'
            },
            gap: 3,
            alignItems: 'center'
          }}
        >
          <Box>
            <TextField
              label="Количество разрядов"
              type="number"
              value={state.columnsCount}
              onChange={(e) => changeColumnsCount(Math.min(13, Math.max(1, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 13 }}
              size="small"
              fullWidth
            />
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={state.showLabels}
                  onChange={(e) => setState(prev => ({ ...prev, showLabels: e.target.checked }))}
                />
              }
              label="Показывать разряды"
            />
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={state.showValue}
                  onChange={(e) => setState(prev => ({ ...prev, showValue: e.target.checked }))}
                />
              }
              label="Показывать значение"
            />
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              onClick={resetAbacus}
              disabled={state.gameMode}
              sx={{ borderRadius: '20px' }}
              fullWidth
            >
              🔄 Обнулить
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Абакус */}
              <AbacusFrame sx={{ mb: 3 }}>
          <Crossbeam />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'flex-start',
            gap: '8px',
            position: 'relative'
          }}>
            {state.columns.map((column, columnIndex) => renderColumn(column, columnIndex))}
          </Box>
        </AbacusFrame>

      {/* Значение и игровой режим */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr'
          },
          gap: 3
        }}
      >
        <Box>
          {state.showValue && (
            <TextField
              label="💬 Значение на абакусе"
              value={inputValue}
              onChange={handleInputChange}
              disabled={state.gameMode}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  borderRadius: '15px',
                },
              }}
            />
          )}
        </Box>
        
        <Box>
          <Paper elevation={2} sx={{ p: 2, borderRadius: '15px', background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>
            <Typography variant="h6" gutterBottom>🎮 Игровой режим</Typography>
            
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                mb: 2
              }}
            >
              <Box>
                <TextField
                  label="От"
                  type="number"
                  value={state.gameRange.min}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    gameRange: { ...prev.gameRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'white' } }}
                />
              </Box>
              <Box>
                <TextField
                  label="До"
                  type="number"
                  value={state.gameRange.max}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    gameRange: { ...prev.gameRange, max: parseInt(e.target.value) || 99999 }
                  }))}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'white' } }}
                />
              </Box>
            </Box>
            
            {!state.gameMode ? (
              <Button
                variant="contained"
                onClick={startGame}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  borderRadius: '20px',
                  fontWeight: 600,
                }}
                fullWidth
              >
                🎯 Начать игру
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  onClick={checkAnswer}
                  sx={{
                    background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
                    borderRadius: '20px',
                    fontWeight: 600,
                    mb: 1,
                  }}
                  fullWidth
                >
                  ✅ Проверить
                </Button>
                <Button
                  variant="outlined"
                  onClick={endGame}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    borderRadius: '20px',
                  }}
                  fullWidth
                >
                  🚪 Завершить игру
                </Button>
                             </Box>
             )}
           </Paper>
         </Box>
       </Box>

      {/* Результат игры */}
      {state.gameResult !== 'none' && (
        <Alert 
          severity={state.gameResult === 'correct' ? 'success' : 'error'}
          sx={{ mt: 3, borderRadius: '15px', fontSize: '1.1rem' }}
        >
          {state.gameResult === 'correct' 
            ? '🎉 Правильно! Отличная работа!' 
            : `❌ Неправильно. Правильный ответ: ${state.targetNumber}`}
        </Alert>
      )}

      {/* Диалог игры */}
      <Dialog 
        open={showGameDialog} 
        onClose={() => setShowGameDialog(false)}
        PaperProps={{
          sx: { borderRadius: '20px', p: 2 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
          🎯 Игровое задание
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
            {state.targetNumber}
          </Typography>
          <Typography variant="body1">
            Установите это число на абакусе, перемещая костяшки
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowGameDialog(false)}
            variant="contained"
            sx={{ borderRadius: '20px' }}
          >
            ✅ Понятно
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractiveAbacus; 