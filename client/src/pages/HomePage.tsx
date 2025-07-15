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
} from '@mui/material';
import {
  Calculate,
  ViewModule,
  EmojiEvents,
  Speed,
  Psychology,
  TrendingUp,
  CheckCircle,
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
      icon: <Calculate color="primary" sx={{ fontSize: 40 }} />,
      title: 'Числовой тренажёр',
      description: 'Интерактивные упражнения для развития навыков устного счёта с настраиваемой сложностью',
    },
    {
      icon: <ViewModule color="primary" sx={{ fontSize: 40 }} />,
      title: 'Виртуальный абакус',
      description: 'Интерактивные счёты (соробан) для изучения основ ментальной арифметики',
    },
    {
      icon: <EmojiEvents color="primary" sx={{ fontSize: 40 }} />,
      title: 'Система достижений',
      description: 'Мотивирующие награды и прогресс для поддержания интереса к обучению',
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 40 }} />,
      title: 'Прогрессивная сложность',
      description: 'Автоматическое увеличение сложности заданий по мере улучшения навыков',
    },
    {
      icon: <Psychology color="primary" sx={{ fontSize: 40 }} />,
      title: 'Развитие памяти',
      description: 'Упражнения для улучшения концентрации внимания и фотографической памяти',
    },
    {
      icon: <TrendingUp color="primary" sx={{ fontSize: 40 }} />,
      title: 'Отслеживание прогресса',
      description: 'Детальная статистика и графики для мониторинга улучшения результатов',
    },
  ];

  const benefits = [
    'Быстрый устный счёт без калькулятора',
    'Улучшение концентрации внимания',
    'Развитие фотографической памяти',
    'Повышение успеваемости по математике',
    'Увеличение уверенности в себе',
    'Подготовка к олимпиадам и экзаменам',
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
      {/* Главный баннер */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
            }}
          >
            🧮 Тренажёр Ментальной Арифметики
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              mb: 4,
              opacity: 0.9,
            }}
          >
            Развивайте навыки быстрого устного счёта и улучшайте концентрацию внимания
            с помощью интерактивных упражнений и виртуального абакуса
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              fontSize: '1.2rem',
              py: 2,
              px: 4,
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            {isAuthenticated ? 'Перейти к тренировкам' : 'Начать обучение'}
          </Button>
        </Container>
      </Box>

      {/* Преимущества */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Почему выбирают нас?
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
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Что вы получите?
          </Typography>
          
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>

      {/* Призыв к действию */}
      <Box
        sx={{
          py: 8,
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            Готовы начать путь к успеху?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Присоединитесь к тысячам учеников, которые уже улучшили свои математические навыки
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isAuthenticated && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Зарегистрироваться
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Войти
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/trainer')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Начать тренировку
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 