import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Stack,
  Slider,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Settings,
  Calculate,
} from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import TrainerAbacus from '../../components/abacus/TrainerAbacus';

// Типы данных
interface Problem {
  numbers: number[];
  operation: '+' | '-' | '*' | '/';
  correctAnswer: number;
  userAnswer?: number;
  timeSpent?: number;
  isCorrect?: boolean;
}

interface TrainingSession {
  problems: Problem[];
  currentProblemIndex: number;
  startTime: number;
  endTime?: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  score: number;
}

interface TrainerState {
  isTraining: boolean;
  currentSession: TrainingSession | null;
  currentProblem: Problem | null;
  userAnswer: string;
  showProblem: boolean;
  timeLeft: number;
  problemStartTime: number;
  showSettings: boolean;
  currentStep: 'waiting' | 'showing' | 'answering' | 'result';
}

// Настройки по умолчанию (вынесены за пределы компонента для избежания пересоздания)
const DEFAULT_SETTINGS = {
  numbersCount: 3,
  numberRange: 10,
  operations: ['+'],
  displaySpeed: 2000,
  displayMode: 'digits' as 'digits' | 'abacus',
  soundEnabled: true,
};

const TrainerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const { trainerSettings, updateTrainerSettings, updateUserStats, addAchievement } = useUser();
  
  const [state, setState] = useState<TrainerState>({
    isTraining: false,
    currentSession: null,
    currentProblem: null,
    userAnswer: '',
    showProblem: false,
    timeLeft: 0,
    problemStartTime: 0,
    showSettings: false,
    currentStep: 'waiting',
  });

  // Локальное состояние для настроек
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);

  const problemTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Стабильная ссылка на текущие настройки
  const currentSettings = useMemo(() => localSettings, [localSettings]);

  // Инициализация настроек при загрузке
  useEffect(() => {
    const initSettings = () => {
      if (isAuthenticated && trainerSettings) {
        setLocalSettings(prev => ({ ...prev, ...trainerSettings }));
      } else {
        // Для неавторизованных пользователей пробуем загрузить из localStorage
        try {
          const savedSettings = localStorage.getItem('trainerSettings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setLocalSettings(prev => ({ ...prev, ...parsed }));
          }
        } catch (error) {
          console.warn('Ошибка загрузки настроек из localStorage:', error);
        }
      }
    };
    
    initSettings();
  }, [isAuthenticated, trainerSettings]);

  // Генерация случайного числа - стабильная функция
  const generateRandomNumber = useCallback((range: number): number => {
    return Math.floor(Math.random() * range) + 1;
  }, []);

  // Генерация проблемы - стабилизированная
  const generateProblem = useCallback((): Problem => {
    const numbers: number[] = [];
    for (let i = 0; i < currentSettings.numbersCount; i++) {
      numbers.push(generateRandomNumber(currentSettings.numberRange));
    }
    
    const operation = currentSettings.operations[
      Math.floor(Math.random() * currentSettings.operations.length)
    ] as '+' | '-' | '*' | '/';
    
    let correctAnswer: number;
    switch (operation) {
      case '+':
        correctAnswer = numbers.reduce((sum, num) => sum + num, 0);
        break;
      case '-':
        correctAnswer = numbers.reduce((diff, num, index) => index === 0 ? num : diff - num);
        break;
      case '*':
        correctAnswer = numbers.reduce((product, num) => product * num, 1);
        break;
      case '/':
        // Для деления генерируем целое частное и делитель, затем вычисляем делимое
        const quotient = generateRandomNumber(Math.min(currentSettings.numberRange, 100)); // Частное от 1 до 100
        const divisor = generateRandomNumber(Math.min(currentSettings.numberRange, 100));  // Делитель от 1 до 100
        const dividend = quotient * divisor; // Делимое = частное × делитель (всегда целое деление)
        correctAnswer = quotient;
        return { numbers: [dividend, divisor], operation, correctAnswer };
      default:
        correctAnswer = numbers.reduce((sum, num) => sum + num, 0);
    }
    
    return { numbers, operation, correctAnswer };
  }, [currentSettings.numbersCount, currentSettings.numberRange, currentSettings.operations, generateRandomNumber]);

  // Очистка таймера - стабильная функция
  const clearCurrentTimeout = useCallback(() => {
    if (problemTimeoutRef.current) {
      clearTimeout(problemTimeoutRef.current);
      problemTimeoutRef.current = null;
    }
  }, []);

  // Начало тренировки
  const startTraining = useCallback(() => {
    clearCurrentTimeout();
    
    const problems: Problem[] = [];
    for (let i = 0; i < 10; i++) {
      problems.push(generateProblem());
    }
    
    const session: TrainingSession = {
      problems,
      currentProblemIndex: 0,
      startTime: Date.now(),
      accuracy: 0,
      totalTime: 0,
      averageTime: 0,
      score: 0,
    };
    
    setState(prev => ({
      ...prev,
      isTraining: true,
      currentSession: session,
      currentProblem: problems[0],
      currentStep: 'showing',
      showProblem: true,
      problemStartTime: Date.now(),
      timeLeft: currentSettings.displaySpeed,
    }));
    
    problemTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        showProblem: false,
        currentStep: 'answering',
      }));
    }, currentSettings.displaySpeed);
    
  }, [generateProblem, currentSettings.displaySpeed, clearCurrentTimeout]);

  // Остановка тренировки
  const stopTraining = useCallback(() => {
    clearCurrentTimeout();
    
    setState(prev => ({
      ...prev,
      isTraining: false,
      currentSession: null,
      currentProblem: null,
      userAnswer: '',
      showProblem: false,
      currentStep: 'waiting',
    }));
  }, [clearCurrentTimeout]);

  // Отправка ответа
  const submitAnswer = useCallback(async () => {
    if (!state.currentSession || !state.currentProblem) return;
    
    clearCurrentTimeout();
    
    const userAnswer = parseInt(state.userAnswer);
    const isCorrect = userAnswer === state.currentProblem.correctAnswer;
    const timeSpent = Date.now() - state.problemStartTime;
    
    const updatedProblem = {
      ...state.currentProblem,
      userAnswer,
      isCorrect,
      timeSpent,
    };
    
    const updatedProblems = [...state.currentSession.problems];
    updatedProblems[state.currentSession.currentProblemIndex] = updatedProblem;
    
    const nextIndex = state.currentSession.currentProblemIndex + 1;
    const isLastProblem = nextIndex >= updatedProblems.length;
    
    if (isLastProblem) {
      const correctAnswers = updatedProblems.filter(p => p.isCorrect).length;
      const accuracy = (correctAnswers / updatedProblems.length) * 100;
      const totalTime = Date.now() - state.currentSession.startTime;
      const averageTime = totalTime / updatedProblems.length;
      const score = Math.round(accuracy * (1000 / averageTime) * 10);
      
      const completedSession = {
        ...state.currentSession,
        problems: updatedProblems,
        endTime: Date.now(),
        accuracy,
        totalTime,
        averageTime,
        score,
      };
      
      // Сохраняем статистику только для авторизованных пользователей
      if (isAuthenticated && user && updateUserStats && addAchievement) {
        try {
          await updateUserStats({
            totalExercises: (user.stats?.totalExercises || 0) + 1,
            correctAnswers: (user.stats?.correctAnswers || 0) + correctAnswers,
            totalTime: (user.stats?.totalTime || 0) + totalTime,
            bestAccuracy: Math.max(user.stats?.bestAccuracy || 0, accuracy),
          });
          
          if (accuracy === 100) {
            await addAchievement({
              id: 'perfect_session',
              name: 'Идеальная сессия',
              description: 'Решите все задачи в сессии без ошибок',
              icon: '🎯',
            });
          }
        } catch (error) {
          console.warn('Не удалось сохранить статистику:', error);
        }
      }
      
      setState(prev => ({
        ...prev,
        currentSession: completedSession,
        currentStep: 'result',
      }));
    } else {
      const nextProblem = updatedProblems[nextIndex];
      
      setState(prev => ({
        ...prev,
        currentSession: {
          ...prev.currentSession!,
          problems: updatedProblems,
          currentProblemIndex: nextIndex,
        },
        currentProblem: nextProblem,
        userAnswer: '',
        showProblem: true,
        currentStep: 'showing',
        problemStartTime: Date.now(),
        timeLeft: currentSettings.displaySpeed,
      }));
      
      problemTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          showProblem: false,
          currentStep: 'answering',
        }));
      }, currentSettings.displaySpeed);
    }
  }, [state, currentSettings.displaySpeed, user, updateUserStats, addAchievement, isAuthenticated, clearCurrentTimeout]);

  // Обновление настроек - стабилизированная функция
  const handleSettingsChange = useCallback(async (newSettings: Partial<typeof currentSettings>) => {
    // Обновляем локальное состояние сразу для отзывчивости UI
    const updatedSettings = { ...currentSettings, ...newSettings };
    setLocalSettings(updatedSettings);
    
    // Сохраняем настройки
    if (isAuthenticated && updateTrainerSettings) {
      try {
        await updateTrainerSettings(newSettings);
      } catch (error) {
        console.warn('Не удалось сохранить настройки на сервере, используем localStorage:', error);
        localStorage.setItem('trainerSettings', JSON.stringify(updatedSettings));
      }
    } else {
      // Для неавторизованных пользователей сохраняем в localStorage
      localStorage.setItem('trainerSettings', JSON.stringify(updatedSettings));
    }
  }, [currentSettings, isAuthenticated, updateTrainerSettings]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      clearCurrentTimeout();
    };
  }, [clearCurrentTimeout]);

  // Рендер текущей задачи
  const renderCurrentProblem = () => {
    if (!state.currentProblem) return null;

    const { numbers, operation } = state.currentProblem;
    
    return (
      <Box sx={{ 
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {state.showProblem ? (
          <Box>
            {currentSettings.displayMode === 'abacus' ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Запомните числа на абакусе:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 2, maxWidth: '1000px', mx: 'auto' }}>
                  {numbers.map((number, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{ flex: '0 1 280px', minWidth: '200px' }}>
                        <Typography variant="body1" sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                          Число {index + 1}
                        </Typography>
                        <TrainerAbacus 
                          value={number} 
                          showValue={false} 
                        />
                      </Box>
                      
                      {index < numbers.length - 1 && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          minHeight: '200px',
                          px: 2
                        }}>
                          <Typography 
                            variant="h1" 
                            sx={{ 
                              fontSize: { xs: '3rem', md: '4rem' },
                              fontWeight: 'bold',
                              color: theme.palette.primary.main,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                              userSelect: 'none'
                            }}
                          >
                            {operation}
                          </Typography>
                        </Box>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
                <Typography variant="body1" sx={{ mt: 3, textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Операция: {operation}
                </Typography>
              </Box>
            ) : (
              <Typography 
                variant="h2" 
                sx={{ 
                  mb: 3,
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                }}
              >
                {numbers.join(` ${operation} `)}
              </Typography>
            )}
            
            <LinearProgress 
              variant="determinate" 
              value={(state.timeLeft / currentSettings.displaySpeed) * 100}
              sx={{ width: '200px', mx: 'auto' }}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Сколько получилось?
            </Typography>
            
            <TextField
              value={state.userAnswer}
              onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  submitAnswer();
                }
              }}
              placeholder="Введите ответ"
              variant="outlined"
              sx={{ 
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  textAlign: 'center',
                }
              }}
              autoFocus
            />
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={submitAnswer}
                disabled={!state.userAnswer}
              >
                Ответить
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Рендер результатов сессии
  const renderResults = () => {
    if (!state.currentSession) return null;
    
    const { accuracy, totalTime, averageTime, score, problems } = state.currentSession;
    const correctCount = problems.filter(p => p.isCorrect).length;
    
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.success.main }}>
          🎉 Сессия завершена!
        </Typography>
        
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {correctCount}/{problems.length}
              </Typography>
              <Typography variant="body2">
                Правильных ответов
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                Точность
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {(averageTime / 1000).toFixed(1)}с
              </Typography>
              <Typography variant="body2">
                Среднее время
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {score}
              </Typography>
              <Typography variant="body2">
                Очки
              </Typography>
            </CardContent>
          </Card>
        </Stack>
        
        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={startTraining}
            sx={{ mr: 2 }}
          >
            Новая сессия
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={stopTraining}
          >
            Завершить
          </Button>
        </Box>
      </Box>
    );
  };

  // Рендер настроек
  const renderSettings = () => (
    <Dialog 
      open={state.showSettings} 
      onClose={() => setState(prev => ({ ...prev, showSettings: false }))}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Настройки тренажёра</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <FormLabel>Количество чисел: {currentSettings.numbersCount}</FormLabel>
            <Slider
              value={currentSettings.numbersCount}
              onChange={(_, value) => handleSettingsChange({ numbersCount: value as number })}
              min={2}
              max={6}
              marks
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
          </FormControl>
          
          <FormControl fullWidth>
            <FormLabel>Диапазон чисел</FormLabel>
            <Select
              value={currentSettings.numberRange}
              onChange={(e) => handleSettingsChange({ numberRange: e.target.value as number })}
            >
              <MenuItem value={10}>1-10</MenuItem>
              <MenuItem value={100}>1-100</MenuItem>
              <MenuItem value={1000}>1-1000</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <FormLabel>Скорость показа: {currentSettings.displaySpeed}мс</FormLabel>
            <Slider
              value={currentSettings.displaySpeed}
              onChange={(_, value) => handleSettingsChange({ displaySpeed: value as number })}
              min={500}
              max={5000}
              step={100}
              marks={[
                { value: 500, label: '0.5с' },
                { value: 2000, label: '2с' },
                { value: 5000, label: '5с' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
          </FormControl>
          
          <Box>
            <FormLabel>Операции:</FormLabel>
            <Stack direction="row" spacing={1}>
              {['+', '-', '*', '/'].map((op) => (
                <Chip
                  key={op}
                  label={op}
                  variant={currentSettings.operations.includes(op) ? 'filled' : 'outlined'}
                  onClick={() => {
                    const newOps = currentSettings.operations.includes(op)
                      ? currentSettings.operations.filter((o: string) => o !== op)
                      : [...currentSettings.operations, op];
                    if (newOps.length > 0) {
                      handleSettingsChange({ operations: newOps });
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
          
          <FormControl>
            <FormLabel>Режим отображения</FormLabel>
            <Select
              value={currentSettings.displayMode}
              onChange={(e) => handleSettingsChange({ displayMode: e.target.value as 'digits' | 'abacus' })}
            >
              <MenuItem value="digits">Цифры</MenuItem>
              <MenuItem value="abacus">Абакус</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, showSettings: false }))}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
          🧮 Числовой тренажёр
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Тренируйте ментальную арифметику с визуализацией абакуса
        </Typography>
      </Box>

      {/* Основной контент */}
      {!state.isTraining ? (
        <Box sx={{ textAlign: 'center' }}>
          <Paper sx={{ p: 4, mb: 3, maxWidth: '600px', mx: 'auto' }}>
            <Calculate sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
            
            <Typography variant="h5" sx={{ mb: 3 }}>
              Готовы начать тренировку?
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip label={`${currentSettings.numbersCount} чисел`} />
              <Chip label={`Диапазон: 1-${currentSettings.numberRange}`} />
              <Chip label={`Операции: ${currentSettings.operations.join(', ')}`} />
              <Chip label={`${currentSettings.displaySpeed}мс`} />
            </Stack>
            
            <Box>
              <Button
                variant="contained"
                size="large"
                onClick={startTraining}
                startIcon={<PlayArrow />}
                sx={{ mr: 2 }}
              >
                Начать тренировку
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => setState(prev => ({ ...prev, showSettings: true }))}
                startIcon={<Settings />}
              >
                Настройки
              </Button>
            </Box>
          </Paper>

          {/* Статистика пользователя */}
          {user?.stats && (
            <Paper sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                📊 Ваша статистика
              </Typography>
              
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h6" color="primary">
                    {user.stats.totalExercises || 0}
                  </Typography>
                  <Typography variant="body2">
                    Упражнений
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h6" color="primary">
                    {user.stats.correctAnswers || 0}
                  </Typography>
                  <Typography variant="body2">
                    Правильных
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h6" color="primary">
                    {user.stats.bestAccuracy?.toFixed(1) || '0'}%
                  </Typography>
                  <Typography variant="body2">
                    Лучшая точность
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography variant="h6" color="primary">
                    {user.stats.level || 1}
                  </Typography>
                  <Typography variant="body2">
                    Уровень
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      ) : (
        <Box>
          {/* Прогресс тренировки */}
          {state.currentSession && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Задача {state.currentSession.currentProblemIndex + 1} из {state.currentSession.problems.length}
                </Typography>
                
                <Box>
                  <IconButton onClick={stopTraining}>
                    <Stop />
                  </IconButton>
                </Box>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={(state.currentSession.currentProblemIndex / state.currentSession.problems.length) * 100}
                sx={{ mt: 1 }}
              />
            </Paper>
          )}
          
          {/* Контент тренировки */}
          <Paper sx={{ p: 4, minHeight: '400px' }}>
            {state.currentStep === 'result' ? renderResults() : renderCurrentProblem()}
          </Paper>
        </Box>
      )}

      {/* Настройки */}
      {renderSettings()}
    </Box>
  );
};

export default TrainerPage; 