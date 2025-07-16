import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import TrainerPage from './pages/trainer/TrainerPage';
import AbacusPage from './pages/abacus/AbacusPage';
import ProfilePage from './pages/profile/ProfilePage';
import AchievementsPage from './pages/achievements/AchievementsPage';
import StatsPage from './pages/stats/StatsPage';

// Создаём тему для приложения
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa3f0',
      dark: '#4a58a3',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#ff8a80',
      dark: '#f44336',
    },
    success: {
      main: '#4ECDC4',
      light: '#80cbc4',
      dark: '#00695c',
    },
    warning: {
      main: '#FFD93D',
      light: '#ffeb3b',
      dark: '#f57f17',
    },
    error: {
      main: '#FF6B6B',
      light: '#ffab91',
      dark: '#d32f2f',
    },
    info: {
      main: '#45B7D1',
      light: '#81c784',
      dark: '#1976d2',
    },
    background: {
      default: '#F8F9FA',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
  },
  typography: {
    fontFamily: [
      'Comic Neue',
      'Nunito',
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      color: '#2c3e50',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2c3e50',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2c3e50',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#7f8c8d',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '25px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '1rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #8fa3f0, #9575cd)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(102, 126, 234, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '15px',
            backgroundColor: '#f8f9fa',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        colorPrimary: {
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
        },
        colorSecondary: {
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          color: 'white',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          color: '#2c3e50',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 0',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UserProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Защищённые маршруты */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer" element={
                  <ProtectedRoute>
                    <TrainerPage />
                  </ProtectedRoute>
                } />
                <Route path="/abacus" element={<AbacusPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute>
                    <AchievementsPage />
                  </ProtectedRoute>
                } />
                <Route path="/stats" element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                } />
                
                {/* Перенаправление на главную для несуществующих маршрутов */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
