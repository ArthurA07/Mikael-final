import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Типы данных для настроек тренажёра
interface TrainerSettings {
  totalProblems: number;
  numbersCount: number;
  numberRange: number;
  operations: string[];
  displaySpeed: number;
  displayMode: 'digits' | 'abacus';
  soundEnabled: boolean;
  voiceInput: boolean;
  showAnswer: boolean;
  progressiveMode: boolean;
  randomPosition: boolean;
  randomColor: boolean;
  randomFont: boolean;
}

// Типы для статистики
interface UserStats {
  totalExercises: number;
  correctAnswers: number;
  totalTime: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
}

// Пэйлоад на обновление статистики: разрешаем инкременты, поддерживаем серверный контракт
type UpdateUserStatsPayload = Partial<UserStats> & {
  incTotalExercises?: number;
  incCorrectAnswers?: number;
  incTotalTime?: number;
  // Можно передавать точность отдельно, сервер обновит bestAccuracy при необходимости
  accuracy?: number;
};

// Типы для достижений
interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

// Контекст пользователя
interface UserContextType {
  trainerSettings: TrainerSettings | null;
  userStats: UserStats | null;
  achievements: Achievement[];
  isLoading: boolean;
  
  // Функции для настроек тренажёра
  updateTrainerSettings: (settings: Partial<TrainerSettings>) => Promise<boolean>;
  resetTrainerSettings: () => void;
  
  // Функции для статистики
  refreshUserStats: () => Promise<void>;
  updateUserStats: (stats: UpdateUserStatsPayload) => Promise<boolean>;
  
  // Функции для достижений
  addAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => Promise<boolean>;
  refreshAchievements: () => Promise<void>;
}

// Значения по умолчанию для настроек тренажёра
const defaultTrainerSettings: TrainerSettings = {
  totalProblems: 10,
  numbersCount: 3,
  numberRange: 10,
  operations: ['+'],
  displaySpeed: 2000,
  displayMode: 'digits',
  soundEnabled: true,
  voiceInput: false,
  showAnswer: true,
  progressiveMode: false,
  randomPosition: false,
  randomColor: false,
  randomFont: false,
};

// Создаём контекст
const UserContext = createContext<UserContextType | undefined>(undefined);

// Хук для использования контекста
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Провайдер контекста
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [trainerSettings, setTrainerSettings] = useState<TrainerSettings | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка настроек пользователя при авторизации
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Очищаем данные при выходе
      setTrainerSettings(null);
      setUserStats(null);
      setAchievements([]);
    }
  }, [isAuthenticated, user]);

  // Загрузка всех данных пользователя
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTrainerSettings(),
        loadUserStats(),
        loadAchievements(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка настроек тренажёра
  const loadTrainerSettings = async () => {
    try {
      const response = await axios.get('/user/trainer-settings');
      setTrainerSettings(response.data.data.settings);
    } catch (error) {
      console.error('Error loading trainer settings:', error);
      // Устанавливаем настройки по умолчанию
      setTrainerSettings(defaultTrainerSettings);
    }
  };

  // Загрузка статистики пользователя
  const loadUserStats = async () => {
    try {
      const response = await axios.get('/user/stats');
      setUserStats(response.data.data.profile);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Загрузка достижений
  const loadAchievements = async () => {
    try {
      const response = await axios.get('/user/stats');
      setAchievements(response.data.data.achievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  // Обновление настроек тренажёра
  const updateTrainerSettings = async (settings: Partial<TrainerSettings>): Promise<boolean> => {
    try {
      const response = await axios.put('/user/trainer-settings', settings);
      if (response.data.success) {
        setTrainerSettings(response.data.data.settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating trainer settings:', error);
      return false;
    }
  };

  // Сброс настроек тренажёра
  const resetTrainerSettings = () => {
    setTrainerSettings(defaultTrainerSettings);
  };

  // Обновление статистики пользователя
  const refreshUserStats = async () => {
    await loadUserStats();
  };

  // Обновление статистики
  const updateUserStats = async (stats: UpdateUserStatsPayload): Promise<boolean> => {
    try {
      const response = await axios.put('/user/stats', stats);
      if (response.data.success) {
        setUserStats(response.data.data.stats);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  };

  // Добавление достижения
  const addAchievement = async (achievement: Omit<Achievement, 'unlockedAt'>): Promise<boolean> => {
    try {
      const response = await axios.post('/user/achievements', {
        ...achievement,
      });
      if (response.data.success) {
        setAchievements(prev => [...prev, response.data.data.achievement]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding achievement:', error);
      return false;
    }
  };

  // Обновление достижений
  const refreshAchievements = async () => {
    await loadAchievements();
  };

  const value: UserContextType = {
    trainerSettings,
    userStats,
    achievements,
    isLoading,
    updateTrainerSettings,
    resetTrainerSettings,
    refreshUserStats,
    updateUserStats,
    addAchievement,
    refreshAchievements,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 