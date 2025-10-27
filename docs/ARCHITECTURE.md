## Архитектура проекта

Ниже — визуальные схемы основных блоков системы. Формат — Mermaid (рендерится в GitHub/Markdown-плагинах).

### 1) Общая схема (Container level)

```mermaid
flowchart LR
  subgraph Client[Client (React + MUI)]
    A1[Маршруты: /, /trainer, /stats, /profile]
    A2[Контексты: AuthContext, UserContext]
    A3[Страницы: TrainerPage, StatsPage, HistoryPage, ProfilePage]
    A4[Компоненты: Abacus, TrainerAbacus]
    A5[Utils: problemGenerator]
  end

  subgraph Server[Server (Node.js/Express)]
    B1[/auth/*: login, register, me, profile, change-password]
    B2[/user/*: trainer-settings, stats, progress, training-history, export]
    B3[/training/*: complete, problem, start]
    B4[/public/free-access]
    B5[Middleware: auth(protect, authorize)]
  end

  subgraph DB[(MongoDB)]
    C1[(User)]
    C2[(Training)]
    C3[(FreeAccess)]
  end

  Client <--> |JWT в headers| Server
  Server <--> DB
```

### 2) Модель данных

```mermaid
classDiagram
  class User {
    +String _id
    +String name
    +String email
    +String phone
    +trainerSettings
    +stats
    +achievements[]
  }

  class Training {
    +ObjectId userId
    +settings
    +results
    +problems[]
    +completed
    +createdAt
  }

  class FreeAccess {
    +String ip
    +Date startedAt
    +Date expiresAt
    +Boolean blocked
  }

  User "1" -- "*" Training : completedBy
```

### 3) Поток тренировки (digits/abacus)

```mermaid
sequenceDiagram
  participant U as User (Client)
  participant TR as TrainerPage/InteractiveAbacus
  participant API as Express
  participant DB as MongoDB

  U->>TR: Start session
  TR->>TR: Локальная генерация примеров
  Note right of TR: показ, ввод ответов
  TR->>API: POST /training/complete {problems, settings, metrics}
  API->>DB: save Training (pre-save: рассчёт результатов)
  API-->>TR: {trainingId}
  TR->>API: PUT /user/stats (инкременты, accuracy)
  API->>DB: update User.stats (atomic $inc/$set)
  API-->>TR: {stats}
```

### 4) Статистика и история

```mermaid
flowchart TB
  subgraph Stats
    S1[/user/stats/] -->|getUserStats(aggregate)| T[(Training)]
    S1 --> U[(User.stats)]
    S2[HistoryPage] --> H1[/user/training-history/]
  end

  T -.индексы.-> T
```

### 5) Авторизация

```mermaid
sequenceDiagram
  participant C as Client
  participant A as /auth/login
  participant M as Middleware protect

  C->>A: email/password
  A-->>C: JWT + user
  C->>M: Authorization: Bearer <JWT>
  M-->>C: req.user установлен
```

Примечания
- JWT хранится на клиенте, добавляется в `axios` заголовки.
- История тренировок хранится в `Training`, агрегаты профиля — в `User.stats`.
- Для гостей доступ к абакусу контролируется через `FreeAccess` и `/public/free-access`.

---

### 6) Диаграмма деплоя/инфраструктуры

```mermaid
flowchart LR
  subgraph UserDevice[Пользовательские устройства]
    U1[Браузер: Chrome/Safari]
  end

  subgraph Render[Render.com]
    FE[Static Site: client/build]
    BE[Web Service: Node/Express]
  end

  subgraph Atlas[MongoDB Atlas]
    MDB[(Cluster: MongoDB)]
  end

  U1 <-->|HTTPS| FE
  FE <-->|HTTPS /api| BE
  BE <-->|TLS| MDB
```

---

### 7) Component-level (Client)

```mermaid
flowchart TB
  subgraph App[React App]
    Router[React Router]
    AuthCtx[AuthContext]
    UserCtx[UserContext]
    Pages[Pages]
    Components[UI Components]
  end

  Router --> Pages
  AuthCtx --> Pages
  UserCtx --> Pages
  Pages --> Components
  Components -->|axios| API[(API Client)]
```

---

### 8) Component-level (Server)

```mermaid
flowchart TB
  subgraph Express[Express App]
    MW[Middleware: cors, json, auth]
    Rauth[/routes/auth.js/]
    Ruser[/routes/user.js/]
    Rtraining[/routes/training.js/]
    Rpublic[/routes/public.js/]
  end

  subgraph Models[Mongoose Models]
    MUser[(User)]
    MTraining[(Training)]
    MFree[(FreeAccess)]
  end

  MW --> Rauth --> MUser
  MW --> Ruser --> MUser
  MW --> Rtraining --> MTraining
  MW --> Rpublic --> MFree
```

---

### 9) Поток: Логин и bootstrap клиента

```mermaid
sequenceDiagram
  participant UI as LoginPage
  participant AX as axios
  participant AUTH as /auth/login
  participant ME as /auth/me

  UI->>AX: POST /auth/login {email, password}
  AX-->>UI: {token, user}
  UI->>UI: save token to localStorage
  UI->>AX: set Authorization: Bearer <token>
  UI->>AX: GET /auth/me
  AX-->>UI: {user}
  UI->>UI: hydrate AuthContext
```

---

### 10) Поток: История и экспорт

```mermaid
sequenceDiagram
  participant HP as HistoryPage
  participant API as /user/training-history
  participant EXP as /user/export/my-history
  participant DB as Training

  HP->>API: GET /user/training-history?page=1&mode=...
  API->>DB: find(filter, options)
  API-->>HP: {trainings, pagination}
  HP->>EXP: GET /user/export/my-history?mode=...
  EXP->>DB: find(filter).sort(createdAt)
  EXP-->>HP: CSV
```

---

### 11) Поток: Агрегации статистики

```mermaid
sequenceDiagram
  participant ST as StatsPage
  participant US as /user/stats
  participant AGG as Training.getUserStats(aggregate)
  participant DB as MongoDB

  ST->>US: GET /user/stats?period=all
  US->>AGG: aggregate([$match,$group])
  AGG->>DB: pipeline
  DB-->>AGG: result
  US-->>ST: {profile, training, lastSession}
```



