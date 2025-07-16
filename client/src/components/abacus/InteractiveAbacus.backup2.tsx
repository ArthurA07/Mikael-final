import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  useTheme,
  useMediaQuery,
  Slider,
  ButtonGroup,
  Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PlayArrow,
  Stop,
  Refresh,
  Settings,
  VolumeUp,
  VolumeOff,
  Speed,
} from '@mui/icons-material';

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
  speed: number;
  soundEnabled: boolean;
  animationEnabled: boolean;
  showHints: boolean;
}

interface GameStats {
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  currentStreak: number;
  bestStreak: number;
}

// Adaptive sizing calculator
const getAdaptiveSizes = (columnsCount: number, isMobile: boolean) => {
  const baseMultiplier = isMobile ? 0.75 : 1;
  const columnMultiplier = Math.max(0.65, Math.min(1.3, 9 / columnsCount));
  
  return {
    frameWidth: Math.min(96, Math.max(65, columnsCount * 11)) + '%',
    framePadding: isMobile ? '25px 20px' : '35px 30px',
    rodHeight: (isMobile ? 340 : 420) * baseMultiplier * columnMultiplier,
    rodWidth: Math.max(5, 8 * columnMultiplier),
    beadUpperWidth: Math.max(36, 55 * columnMultiplier * baseMultiplier),
    beadUpperHeight: Math.max(20, 30 * columnMultiplier * baseMultiplier),
    beadLowerWidth: Math.max(32, 48 * columnMultiplier * baseMultiplier),
    beadLowerHeight: Math.max(18, 26 * columnMultiplier * baseMultiplier),
    columnGap: Math.max(10, 20 * columnMultiplier),
    upperSectionHeight: (isMobile ? 120 : 140) * baseMultiplier * columnMultiplier,
    lowerSectionHeight: (isMobile ? 160 : 200) * baseMultiplier * columnMultiplier,
    crossbeamHeight: Math.max(10, 16 * columnMultiplier),
    fontSize: Math.max(0.8, 1.1 * columnMultiplier * baseMultiplier),
  };
};

// Стилизованные компоненты
const AbacusFrame = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  background: `
    linear-gradient(135deg, 
      #8B4513 0%, 
      #A0522D 15%, 
      #CD853F 30%, 
      #8B4513 45%, 
      #654321 60%, 
      #4A4A4A 85%, 
      #2F2F2F 100%
    )
  `,
  borderRadius: '20px',
  padding: adaptiveSizes.framePadding,
  width: adaptiveSizes.frameWidth,
  margin: '0 auto',
  boxShadow: `
    0 25px 80px rgba(0,0,0,0.6),
    inset 0 3px 15px rgba(255,255,255,0.2),
    inset 0 -3px 15px rgba(0,0,0,0.4),
    0 0 0 3px rgba(139, 69, 19, 0.3)
  `,
  border: '5px solid #1a1a1a',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '5px',
    left: '5px',
    right: '5px',
    bottom: '5px',
    borderRadius: '15px',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '20px',
    borderRadius: '10px',
    border: '2px solid rgba(205, 133, 63, 0.4)',
    pointerEvents: 'none',
    zIndex: 1,
  },
}));

const Crossbeam = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  position: 'absolute',
  left: '25px',
  right: '25px',
  top: '48%',
  height: `${adaptiveSizes.crossbeamHeight}px`,
  background: `
    linear-gradient(to bottom, 
      #8B4513, 
      #654321, 
      #4A4A4A, 
      #2F2F2F, 
      #4A4A4A, 
      #654321, 
      #8B4513
    )
  `,
  borderRadius: `${adaptiveSizes.crossbeamHeight / 2}px`,
  boxShadow: `
    0 4px 20px rgba(0,0,0,0.5),
    inset 0 3px 6px rgba(255,255,255,0.2),
    inset 0 -3px 6px rgba(0,0,0,0.4),
    0 0 0 2px rgba(139, 69, 19, 0.3)
  `,
  border: '2px solid #1a1a1a',
  zIndex: 20,
}));

const Rod = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  width: `${adaptiveSizes.rodWidth}px`,
  height: `${adaptiveSizes.rodHeight}px`,
  background: `
    linear-gradient(to right, 
      #0a0a0a, 
      #2a2a2a, 
      #4a4a4a, 
      #3a3a3a, 
      #2a2a2a, 
      #0a0a0a
    )
  `,
  borderRadius: `${adaptiveSizes.rodWidth / 2}px`,
  position: 'relative',
  margin: '0 auto',
  boxShadow: `
    inset 0 0 ${adaptiveSizes.rodWidth * 2}px rgba(0,0,0,0.9),
    0 0 ${adaptiveSizes.rodWidth * 3}px rgba(0,0,0,0.4),
    inset ${adaptiveSizes.rodWidth / 2}px 0 ${adaptiveSizes.rodWidth}px rgba(255,255,255,0.1),
    inset -${adaptiveSizes.rodWidth / 2}px 0 ${adaptiveSizes.rodWidth}px rgba(0,0,0,0.3)
  `,
  border: '1px solid #000',
  zIndex: 5,
}));

const BeadDiamond = styled(Box)<{ 
  isActive: boolean; 
  isUpper: boolean; 
  adaptiveSizes: any;
  animating?: boolean;
}>(({ isActive, isUpper, adaptiveSizes, animating }) => ({
  width: `${isUpper ? adaptiveSizes.beadUpperWidth : adaptiveSizes.beadLowerWidth}px`,
  height: `${isUpper ? adaptiveSizes.beadUpperHeight : adaptiveSizes.beadLowerHeight}px`,
  background: isActive 
    ? `
      radial-gradient(ellipse at 30% 30%, 
        #FFD700 0%, 
        #FFA500 25%, 
        #FF8C00 50%, 
        #FF6347 75%, 
        #CD853F 100%
      )
    `
    : `
      radial-gradient(ellipse at 30% 30%, 
        #A0937D 0%, 
        #8B7D6B 25%, 
        #6D6652 50%, 
        #5D5D42 75%, 
        #4A4A32 100%
      )
    `,
  borderRadius: '50%',
  cursor: 'pointer',
  position: 'absolute',
  left: '50%',
  transform: `translateX(-50%) ${isActive ? 'scaleY(1.15)' : 'scaleY(0.92)'}`,
  transition: animating 
    ? 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
    : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  boxShadow: isActive 
    ? `
      0 ${adaptiveSizes.beadUpperHeight / 2}px ${adaptiveSizes.beadUpperHeight * 1.2}px rgba(255, 215, 0, 0.5),
      inset 0 3px ${adaptiveSizes.beadUpperHeight / 3}px rgba(255,255,255,0.5),
      inset 0 -2px ${adaptiveSizes.beadUpperHeight / 4}px rgba(0,0,0,0.4),
      0 0 ${adaptiveSizes.beadUpperHeight / 2}px rgba(255, 140, 0, 0.3)
    `
    : `
      0 ${adaptiveSizes.beadUpperHeight / 3}px ${adaptiveSizes.beadUpperHeight / 1.5}px rgba(0,0,0,0.5),
      inset 0 2px ${adaptiveSizes.beadUpperHeight / 4}px rgba(255,255,255,0.3),
      inset 0 -2px ${adaptiveSizes.beadUpperHeight / 5}px rgba(0,0,0,0.5)
    `,
  border: `3px solid ${isActive ? '#CD853F' : '#2F2F2F'}`,
  '&:hover': {
    transform: 'translateX(-50%) scale(1.25)',
    boxShadow: `
      0 ${adaptiveSizes.beadUpperHeight}px ${adaptiveSizes.beadUpperHeight * 2}px rgba(0,0,0,0.6),
      inset 0 3px ${adaptiveSizes.beadUpperHeight / 2}px rgba(255,255,255,0.6),
      0 0 ${adaptiveSizes.beadUpperHeight}px rgba(255, 215, 0, 0.4)
    `,
    zIndex: 25,
    filter: 'brightness(1.2) saturate(1.3)',
  },
  '&:active': {
    transform: 'translateX(-50%) scale(0.85)',
    transition: 'all 0.1s ease',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '12%',
    left: '18%',
    width: '40%',
    height: '40%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(2px)',
    transform: 'rotate(-15deg)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '8%',
    right: '12%',
    width: '25%',
    height: '25%',
    background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
}));

// Остальные стилизованные компоненты...
const ColumnContainer = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  minWidth: `${Math.max(adaptiveSizes.beadUpperWidth + 25, 70)}px`,
  gap: `${adaptiveSizes.columnGap / 3}px`,
  zIndex: 10,
}));

const UpperSection = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  height: `${adaptiveSizes.upperSectionHeight}px`,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  paddingBottom: `${adaptiveSizes.crossbeamHeight + 5}px`,
  zIndex: 15,
}));

const LowerSection = styled(Box)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  height: `${adaptiveSizes.lowerSectionHeight}px`,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingTop: `${adaptiveSizes.crossbeamHeight + 15}px`,
  zIndex: 15,
}));

const ColumnLabel = styled(Typography)<{ adaptiveSizes: any }>(({ adaptiveSizes }) => ({
  fontSize: `${Math.max(0.75, adaptiveSizes.fontSize * 0.9)}rem`,
  fontWeight: 800,
  textAlign: 'center',
  color: '#FFFFFF',
  marginBottom: '10px',
  background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(139,69,19,0.4))',
  borderRadius: '10px',
  padding: '6px 12px',
  textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
  border: '2px solid rgba(255,255,255,0.4)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
}));

const GameControls = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: '20px',
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  fontWeight: 600,
  fontSize: '0.9rem',
}));

const InteractiveAbacus: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [state, setState] = useState<AbacusState>({
    columns: Array(5).fill(null).map(() => ({ upper: false, lower: 0 })),
    showValue: true,
    showLabels: true,
    columnsCount: 5,
    gameMode: false,
    gameRange: { min: 1, max: 99999 },
    targetNumber: null,
    gameResult: 'none',
    speed: 1,
    soundEnabled: true,
    animationEnabled: true,
    showHints: true,
  });

  const [inputValue, setInputValue] = useState('0');
  const [showSettings, setShowSettings] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    correctAnswers: 0,
    totalAnswers: 0,
    averageTime: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [animatingBeads, setAnimatingBeads] = useState<Set<string>>(new Set());

  // Адаптивные размеры на основе количества колонок и размера экрана
  const adaptiveSizes = useMemo(() => 
    getAdaptiveSizes(state.columnsCount, isMobile), 
    [state.columnsCount, isMobile]
  );

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

  // Установка числа на абакусе с анимацией
  const setAbacusValue = useCallback((value: number, animate: boolean = false) => {
    const newColumns = [...state.columns];
    const valueStr = value.toString().padStart(newColumns.length, '0');
    
    if (animate && state.animationEnabled) {
      setAnimatingBeads(new Set());
      // Анимация поочередного установления костяшек
      valueStr.split('').forEach((digitStr, index) => {
        setTimeout(() => {
          const digit = parseInt(digitStr);
          newColumns[index] = {
            upper: digit >= 5,
            lower: digit >= 5 ? digit - 5 : digit,
          };
          setState(prev => ({ ...prev, columns: [...newColumns] }));
          setAnimatingBeads(prev => { const newSet = new Set(prev); newSet.add(`${index}`); return newSet; });
        }, index * (1000 / state.speed));
      });
    } else {
      for (let i = 0; i < newColumns.length; i++) {
        const digit = parseInt(valueStr[i]);
        newColumns[i] = {
          upper: digit >= 5,
          lower: digit >= 5 ? digit - 5 : digit,
        };
      }
      setState(prev => ({ ...prev, columns: newColumns }));
    }
  }, [state.columns.length, state.animationEnabled, state.speed]);

  // Звуковые эффекты
  const playSound = useCallback((type: 'click' | 'correct' | 'wrong' | 'complete') => {
    if (!state.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'correct':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [state.soundEnabled]);

  // Обработка клика по костяшке
  const handleBeadClick = useCallback((columnIndex: number, beadType: 'upper' | 'lower', beadIndex?: number) => {
    
    playSound('click');
    
    const newColumns = [...state.columns];
    
    if (beadType === 'upper') {
      newColumns[columnIndex].upper = !newColumns[columnIndex].upper;
    } else if (beadIndex !== undefined) {
      const currentLower = newColumns[columnIndex].lower;
      newColumns[columnIndex].lower = beadIndex < currentLower ? beadIndex : beadIndex + 1;
    }
    
    setState(prev => ({ ...prev, columns: newColumns }));
  }, [state.gameMode, playSound]);

  // Игровые функции
  const startGame = useCallback(() => {
    const min = Math.max(state.gameRange.min, 0);
    const max = Math.min(state.gameRange.max, Math.pow(10, state.columns.length) - 1);
    const targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    resetAbacus();
    setStartTime(Date.now());
    setState(prev => ({
      ...prev,
      gameMode: true,
      targetNumber,
      gameResult: 'none',
    }));
  }, [state.gameRange, state.columns.length]);

  const checkAnswer = useCallback(() => {
    if (!state.targetNumber || !startTime) return;
    
    const currentValue = calculateValue(state.columns);
    const isCorrect = currentValue === state.targetNumber;
    const timeTaken = Date.now() - startTime;
    
    setState(prev => ({
      ...prev,
      gameResult: isCorrect ? 'correct' : 'incorrect',
      gameMode: false,
    }));
    
    setGameStats(prev => {
      const newStats = {
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalAnswers: prev.totalAnswers + 1,
        averageTime: (prev.averageTime * prev.totalAnswers + timeTaken) / (prev.totalAnswers + 1),
        currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
        bestStreak: Math.max(prev.bestStreak, isCorrect ? prev.currentStreak + 1 : 0),
      };
      return newStats;
    });
    
    playSound(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect && state.showHints) {
      setTimeout(() => {
        playSound('complete');
      }, 500);
    }
  }, [state.targetNumber, state.columns, startTime, calculateValue, playSound, state.showHints]);

  const resetAbacus = useCallback(() => {
    const newColumns = state.columns.map(() => ({ upper: false, lower: 0 }));
    setState(prev => ({ ...prev, columns: newColumns }));
  }, [state.columns.length]);

  const changeColumnsCount = useCallback((count: number) => {
    const newColumns = Array(count).fill(null).map(() => ({ upper: false, lower: 0 }));
    setState(prev => ({ 
      ...prev, 
      columns: newColumns, 
      columnsCount: count,
      gameMode: false,
      targetNumber: null,
      gameResult: 'none',
    }));
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    const maxValue = Math.pow(10, state.columns.length) - 1;
    
    if (value <= maxValue) {
      setInputValue(event.target.value);
      setAbacusValue(value, true);
    }
  }, [state.columns.length, setAbacusValue]);

  // Демонстрационный режим
  const runDemo = useCallback(() => {
    const demoNumbers = [12345, 67890, 11111, 55555, 99999].slice(0, state.columnsCount);
    let currentDemo = 0;
    
    const showNextNumber = () => {
      if (currentDemo < demoNumbers.length) {
        setAbacusValue(demoNumbers[currentDemo], true);
        currentDemo++;
        setTimeout(showNextNumber, 3000 / state.speed);
      } else {
        resetAbacus();
      }
    };
    
    showNextNumber();
  }, [setAbacusValue, resetAbacus, state.columnsCount, state.speed]);

  // Рендер одной колонки абакуса
  const renderColumn = useCallback((column: AbacusColumn, columnIndex: number) => {
    const position = state.columns.length - columnIndex;
    const isAnimating = animatingBeads.has(columnIndex.toString());
    
    return (
      <ColumnContainer key={columnIndex} adaptiveSizes={adaptiveSizes}>
        {state.showLabels && (
          <ColumnLabel adaptiveSizes={adaptiveSizes}>
            {position === 1 ? '1' : 
             position === 2 ? '10' :
             position === 3 ? '100' :
             position === 4 ? '1K' :
             position === 5 ? '10K' :
             position === 6 ? '100K' :
             position === 7 ? '1M' :
             position === 8 ? '10M' :
             position === 9 ? '100M' :
             position === 10 ? '1B' :
             `10^${position-1}`}
          </ColumnLabel>
        )}
        
        <Rod adaptiveSizes={adaptiveSizes}>
          {/* Верхняя секция - одна костяшка (значение 5) */}
          <UpperSection adaptiveSizes={adaptiveSizes}>
            <BeadDiamond
              isActive={column.upper}
              isUpper={true}
              adaptiveSizes={adaptiveSizes}
              animating={isAnimating}
              onClick={() => handleBeadClick(columnIndex, 'upper')}
              style={{
                top: column.upper ? 
                  `${adaptiveSizes.upperSectionHeight - adaptiveSizes.beadUpperHeight - adaptiveSizes.crossbeamHeight - 10}px` : 
                  '10px',
              }}
            />
          </UpperSection>
          
          {/* Нижняя секция - четыре костяшки (значения 1) */}
          <LowerSection adaptiveSizes={adaptiveSizes}>
            {[0, 1, 2, 3].map((beadIndex) => (
              <BeadDiamond
                key={beadIndex}
                isActive={beadIndex < column.lower}
                isUpper={false}
                adaptiveSizes={adaptiveSizes}
                animating={isAnimating}
                onClick={() => handleBeadClick(columnIndex, 'lower', beadIndex)}
                style={{
                  top: beadIndex < column.lower 
                    ? `${15 + beadIndex * (adaptiveSizes.beadLowerHeight + 8)}px`
                    : `${adaptiveSizes.lowerSectionHeight - (4 - beadIndex) * (adaptiveSizes.beadLowerHeight + 8) - 15}px`,
                }}
              />
            ))}
          </LowerSection>
        </Rod>
        
        {state.showValue && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 2, 
              fontWeight: 700,
              fontSize: `${adaptiveSizes.fontSize * 0.8}rem`,
              color: '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '8px',
              padding: '4px 8px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              minWidth: '30px',
              textAlign: 'center',
            }}
          >
            {((column.upper ? 5 : 0) + column.lower) || '0'}
          </Typography>
        )}
      </ColumnContainer>
    );
  }, [state.columns.length, state.showLabels, state.showValue, adaptiveSizes, animatingBeads, handleBeadClick]);

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: 2 }}>
      {/* Игровые контролы */}
      <GameControls elevation={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 2 }}>
            🎮 Игровая панель
          </Typography>
          
          {gameStats.totalAnswers > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <StatsChip 
                label={`✅ ${gameStats.correctAnswers}/${gameStats.totalAnswers}`}
                color="success"
                size="small"
              />
              <StatsChip 
                label={`⚡ ${gameStats.currentStreak} серия`}
                color="warning"
                size="small"
              />
              <StatsChip 
                label={`🏆 ${gameStats.bestStreak} макс`}
                color="primary"
                size="small"
              />
              <StatsChip 
                label={`⏱️ ${(gameStats.averageTime / 1000).toFixed(1)}с`}
                color="info"
                size="small"
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {!state.gameMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={startGame}
                sx={{
                  bgcolor: '#4ECDC4',
                  '&:hover': { bgcolor: '#45B7D1' },
                  fontWeight: 600,
                }}
              >
                Начать игру
              </Button>
              <Button
                variant="outlined"
                startIcon={<Speed />}
                onClick={runDemo}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Демо
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Число: {state.targetNumber}
              </Typography>
              <Button
                variant="contained"
                onClick={checkAnswer}
                sx={{
                  bgcolor: '#FFD93D',
                  color: '#2c3e50',
                  '&:hover': { bgcolor: '#FFC107' },
                  fontWeight: 600,
                }}
              >
                Проверить
              </Button>
              <Button
                variant="outlined"
                startIcon={<Stop />}
                onClick={() => setState(prev => ({ ...prev, gameMode: false }))}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Стоп
              </Button>
            </>
          )}
        </Box>

        {state.gameResult !== 'none' && (
          <Alert 
            severity={state.gameResult === 'correct' ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {state.gameResult === 'correct' 
              ? '🎉 Правильно! Отличная работа!' 
              : '❌ Неправильно. Попробуйте еще раз!'}
          </Alert>
        )}
      </GameControls>

      {/* Основной абакус */}
      <Paper elevation={6} sx={{ mb: 3, overflow: 'hidden', borderRadius: '20px' }}>
        <AbacusFrame adaptiveSizes={adaptiveSizes}>
          <Crossbeam adaptiveSizes={adaptiveSizes} />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'flex-start',
            gap: `${adaptiveSizes.columnGap}px`,
            position: 'relative',
            zIndex: 10,
          }}>
            {state.columns.map((column, columnIndex) => renderColumn(column, columnIndex))}
          </Box>
        </AbacusFrame>
      </Paper>

      {/* Контролы и настройки */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: '15px',
          background: 'linear-gradient(135deg, #F8F9FA, #E9ECEF)',
        }}
      >
        {/* Числовое поле и основные кнопки */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField
            label="Число"
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            
            sx={{ minWidth: '150px' }}
            InputProps={{
              style: { fontSize: '1.2rem', fontWeight: 600 }
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={resetAbacus}
            
            sx={{ 
              bgcolor: '#FF6B6B',
              '&:hover': { bgcolor: '#FF5252' },
            }}
          >
            Сбросить
          </Button>

          <Fab
            size="small"
            onClick={() => setShowSettings(!showSettings)}
            sx={{ 
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
            }}
          >
            <Settings />
          </Fab>
        </Box>

        {/* Настройки */}
        {showSettings && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: '10px',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              ⚙️ Настройки
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {/* Количество разрядов */}
              <Box>
                <Typography gutterBottom sx={{ fontWeight: 600 }}>
                  Разряды: {state.columnsCount}
                </Typography>
                <ButtonGroup variant="outlined" size="small">
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                    <Button
                      key={count}
                      onClick={() => changeColumnsCount(count)}
                      variant={state.columnsCount === count ? 'contained' : 'outlined'}
                    >
                      {count}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>

              {/* Скорость */}
              <Box>
                <Typography gutterBottom sx={{ fontWeight: 600 }}>
                  Скорость: {state.speed}x
                </Typography>
                <Slider
                  value={state.speed}
                  onChange={(_, value) => setState(prev => ({ ...prev, speed: value as number }))}
                  min={0.5}
                  max={3}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Диапазон игры */}
              <Box>
                <Typography gutterBottom sx={{ fontWeight: 600 }}>
                  Диапазон игры
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    type="number"
                    label="От"
                    value={state.gameRange.min}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      gameRange: { ...prev.gameRange, min: parseInt(e.target.value) || 0 }
                    }))}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="До"
                    value={state.gameRange.max}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      gameRange: { ...prev.gameRange, max: parseInt(e.target.value) || 99999 }
                    }))}
                  />
                </Box>
              </Box>

              {/* Переключатели */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.showValue}
                      onChange={(e) => setState(prev => ({ ...prev, showValue: e.target.checked }))}
                    />
                  }
                  label="Показывать значения"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.showLabels}
                      onChange={(e) => setState(prev => ({ ...prev, showLabels: e.target.checked }))}
                    />
                  }
                  label="Показывать разряды"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.soundEnabled}
                      onChange={(e) => setState(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    />
                  }
                  label="Звуковые эффекты"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.animationEnabled}
                      onChange={(e) => setState(prev => ({ ...prev, animationEnabled: e.target.checked }))}
                    />
                  }
                  label="Анимации"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.showHints}
                      onChange={(e) => setState(prev => ({ ...prev, showHints: e.target.checked }))}
                    />
                  }
                  label="Подсказки"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InteractiveAbacus;
