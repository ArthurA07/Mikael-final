# Local Access Notes (do not commit)

Важное: этот файл создан локально для удобства и НЕ должен попадать в репозиторий.
Если вы всё же коммитите его вручную, обязательно удалите перед пушем.

## Render
- Workspace: My Workspace
- Backend Service: Mikael-final
  - Service ID: srv-d1rbt3u3jp1c73bmj4e0
  - URL: https://mikael-final.onrender.com
- Static Site: Mikael-final-1
  - URL: https://mikael-final-1.onrender.com
- MCP: настроен в ~/.cursor/mcp.json (Authorization: Bearer <RENDER_API_KEY>)

## MongoDB Atlas
- Кластер: ClusterMikael-final
- Пользователь: artinovarthur@gmail.com
- Пароль: BRx_z%8ChYrmcnc
- База по умолчанию: mental_arithmetic
- Пример SRV URI:
  mongodb+srv://artinovarthur%40gmail.com:BRx_z%25258ChYrmcnc@clustermikael-final.0zraqkb.mongodb.net/mental_arithmetic?retryWrites=true&w=majority&appName=ClusterMikael-final

## Backend env (Render → Mikael-final → Environment)
- MONGODB_URI: <см. выше SRV URI>
- JWT_SECRET: <случайная длинная строка>
- JWT_EXPIRE: 30d
- NODE_ENV: production
- CORS_ORIGINS: https://mikael-final-1.onrender.com,https://mikael-final.onrender.com

## Примечания
- Для Atlas в Network Access должен быть разрешён доступ 0.0.0.0/0 (временно) или явно добавлены IP Render.
- При изменении окружения на Render запускается новый деплой. Дождитесь статуса live, затем проверяйте /api/health.
