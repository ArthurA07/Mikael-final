import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🎯',
      title: 'Числовой тренажёр',
      description: 'Интерактивные упражнения для развития навыков устного счёта с настраиваемой сложностью',
      color: '#FF6B6B', // Коралловый
    },
    {
      icon: '🧮',
      title: 'Виртуальный абакус',
      description: 'Интерактивные счёты (соробан) для изучения основ ментальной арифметики',
      color: '#4ECDC4', // Мятный
    },
    {
      icon: '🏆',
      title: 'Система достижений',
      description: 'Мотивирующие награды и прогресс для поддержания интереса к обучению',
      color: '#FFD93D', // Золотой
    },
    {
      icon: '⚡',
      title: 'Прогрессивная сложность',
      description: 'Автоматическое увеличение сложности заданий по мере улучшения навыков',
      color: '#6BCF7F', // Зеленый
    },
    {
      icon: '🧠',
      title: 'Развитие памяти',
      description: 'Упражнения для улучшения концентрации внимания и фотографической памяти',
      color: '#A8E6CF', // Светло-зеленый
    },
    {
      icon: '📈',
      title: 'Отслеживание прогресса',
      description: 'Детальная статистика и графики для мониторинга улучшения результатов',
      color: '#FFB74D', // Оранжевый
    },
  ];

  const benefits = [
    '🚀 Быстрый устный счёт без калькулятора',
    '🎯 Улучшение концентрации внимания',
    '📸 Развитие фотографической памяти',
    '📚 Повышение успеваемости по математике',
    '💪 Увеличение уверенности в себе',
    '🏅 Подготовка к олимпиадам и экзаменам',
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <Box>
      {/* Герой секция */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6347)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '40%': {
                    transform: 'translateY(-10px)',
                  },
                  '60%': {
                    transform: 'translateY(-5px)',
                  },
                },
              }}
            >
              🧮 Супер Математика! 🌟
            </Typography>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '1.25rem', md: '1.8rem' },
                mb: 4,
                opacity: 0.95,
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              Стань математическим супергероем! 🦸‍♀️<br />
              Изучай ментальную арифметику весело и легко
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/trainer')}
              endIcon={<ArrowForward />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #FF8A80, #80CBC4)',
                },
              }}
            >
              🎯 Попробовать тренажёр!
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/abacus')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '50px',
                borderColor: 'white',
                color: 'white',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                },
              }}
            >
              🧮 Попробовать абакус
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/pricing')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '50px',
                borderColor: 'white',
                color: 'white',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                },
              }}
            >
              💳 Тарифы
            </Button>

            {!isAuthenticated && (
              <>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 600 }}
                >
                  Войти
                </Button>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 600 }}
                >
                  Зарегистрироваться
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Особенности */}
      <Box sx={{ py: 10, backgroundColor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 8, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🎮 Почему это так круто?
          </Typography>
          
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: 4
            }}
          >
            {features.map((feature, index) => (
              <Box key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    border: '3px solid transparent',
                    background: 'white',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      border: `3px solid ${feature.color}`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box 
                      sx={{ 
                        mb: 3,
                        fontSize: '4rem',
                        lineHeight: 1,
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2) rotate(10deg)',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        color: feature.color,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.6,
                        fontSize: '1rem',
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Что вы получите */}
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 6, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🎁 Что ты получишь?
          </Typography>
          
          <Card 
            sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <List sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
                {benefits.map((benefit, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateX(10px)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <CheckCircle 
                        sx={{ 
                          color: '#4ECDC4',
                          fontSize: '1.5rem',
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '1.1rem',
                          }}
                        >
                          {benefit}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Призыв к действию */}
      <Box 
        sx={{ 
          py: 10, 
          background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            🚀 Готов стать математическим гением?
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              mb: 4, 
              opacity: 0.95,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            Присоединяйся к тысячам учеников, которые уже улучшили свои математические навыки!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/trainer')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '50px',
                backgroundColor: 'white',
                color: '#667eea',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#F8F9FA',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                },
              }}
            >
              🎯 Начать тренировки!
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/abacus')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '50px',
                borderColor: 'white',
                color: 'white',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                },
              }}
            >
              🧮 Изучить абакус
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 