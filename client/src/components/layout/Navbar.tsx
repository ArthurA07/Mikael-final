import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Calculate,
  ViewModule,
  Person,
  EmojiEvents,
  BarChart,
  Logout,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Навигационные пункты для авторизованных пользователей
  const authenticatedMenuItems = [
    { text: 'Личный кабинет', icon: <Home />, path: '/dashboard' },
    { text: 'Тренажёр', icon: <Calculate />, path: '/trainer' },
    { text: 'Абакус', icon: <ViewModule />, path: '/abacus' },
    { text: 'Профиль', icon: <Person />, path: '/profile' },
    { text: 'Достижения', icon: <EmojiEvents />, path: '/achievements' },
    { text: 'Статистика', icon: <BarChart />, path: '/stats' },
  ];

  // Функция для определения активного пункта меню
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Мобильное меню (Drawer)
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          Ментальная Арифметика
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user.name}
          </Typography>
        )}
      </Box>
      
      <List>
        {isAuthenticated ? (
          <>
            {authenticatedMenuItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                selected={isActiveRoute(item.path)}
              >
                <ListItemIcon sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}
                />
              </ListItemButton>
            ))}
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Выйти" />
            </ListItemButton>
          </>
                  ) : (
            <>
              <ListItemButton
                onClick={() => {
                  navigate('/');
                  setDrawerOpen(false);
                }}
                selected={isActiveRoute('/')}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Главная" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  navigate('/login');
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText primary="Войти" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  navigate('/register');
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <PersonAdd />
                </ListItemIcon>
                <ListItemText primary="Регистрация" />
              </ListItemButton>
            </>
          )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {/* Мобильное меню */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="открыть меню"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Логотип */}
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: isMobile ? 1 : 0, 
              cursor: 'pointer',
              mr: isMobile ? 0 : 4
            }}
            onClick={() => navigate('/')}
          >
            🧮 Ментальная Арифметика
          </Typography>

          {/* Десктопное меню */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
              {isAuthenticated ? (
                authenticatedMenuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                      mx: 1,
                      backgroundColor: isActiveRoute(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))
              ) : (
                <Button
                  color="inherit"
                  onClick={() => navigate('/')}
                  sx={{
                    mx: 1,
                    backgroundColor: isActiveRoute('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  Главная
                </Button>
              )}
            </Box>
          )}

          {/* Правая часть навигации */}
          {!isMobile && (
            <Box>
              {isAuthenticated ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="аккаунт пользователя"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user?.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                      Профиль
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Выйти
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box>
                  <Button color="inherit" onClick={() => navigate('/login')}>
                    Войти
                  </Button>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => navigate('/register')}
                    sx={{ ml: 1, borderColor: 'white', '&:hover': { borderColor: 'white' } }}
                  >
                    Регистрация
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Мобильный Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Улучшение производительности на мобильных
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 