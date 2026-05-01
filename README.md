# Mobile — React Native 跨平台应用

Readmigo Mobile 是一款基于 React Native 和 Expo 的跨平台应用，为 iOS 和 Android 提供统一代码库。为英文学习者提供阅读、词汇学习和音频体验。

## 角色定位

Mobile 是原生平台（iOS、Android）的跨平台备选方案。共享 API 和业务逻辑，使用 Expo 托管工作流加速开发迭代。与 iOS（Swift）和 Android（Kotlin）形成平台三角。

## 技术栈

- **框架**: React Native 0.81+
- **管理器**: Expo ~54.0.30
- **路由**: Expo Router ~6.0
- **语言**: TypeScript
- **状态管理**: Zustand
- **样式**: NativeWind（React Native Tailwind）
- **网络**: Axios + React Query
- **离线存储**: Drizzle ORM + Expo SQLite
- **音频**: Expo AV（音乐播放）
- **推送**: Expo Notifications

## 架构

```mermaid
graph LR
    A[Expo Router] --> B[App Directory]
    B --> B1[Pages & Screens]
    B1 --> C[Components]
    C --> C1[UI Components]
    C1 --> D[Hooks & Utils]
    D --> D1[Stores/API]
    D1 --> E[Backend API]
    style A fill:#314A54
    style E fill:#FFB84D
```

| 层级 | 职责 |
|------|------|
| Expo Router | 基于文件系统的路由 |
| App / Components | 页面与 UI 组件库 |
| Hooks | 自定义逻辑钩子（数据获取、本地化） |
| Stores | Zustand 全局状态 |
| API | Axios HTTP 客户端 |

## 目录结构

```
mobile/
├── app/                            # Expo Router 页面（文件即路由）
│   ├── (auth)/                     # 认证堆栈
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (main)/                     # 主应用堆栈
│   │   ├── library.tsx             # 书库
│   │   ├── reader/[bookId].tsx     # 阅读器
│   │   └── profile.tsx             # 个人资料
│   ├── _layout.tsx                 # 根布局
│   └── +html.tsx                   # Web 支持
├── src/
│   ├── components/                 # React Native 组件
│   │   ├── ui/                     # 基础 UI（按钮、输入框等）
│   │   ├── reader/                 # 阅读器特定组件
│   │   └── ...
│   ├── hooks/                      # 自定义逻辑钩子
│   │   ├── useBook.ts
│   │   ├── useAuth.ts
│   │   └── useReading.ts
│   ├── stores/                     # Zustand 状态管理
│   │   ├── authStore.ts
│   │   ├── libraryStore.ts
│   │   └── userStore.ts
│   ├── lib/                        # 工具函数
│   │   ├── api.ts                  # Axios 客户端
│   │   ├── db.ts                   # SQLite 数据库
│   │   └── logger.ts               # 日志
│   └── types/                      # TypeScript 类型定义
├── assets/                         # 图片、字体、本地化
│   ├── images/
│   ├── fonts/
│   └── locales/
├── ios/                            # Expo managed iOS
├── android/                        # Expo managed Android
├── app.json                        # Expo 配置
├── eas.json                        # EAS Build 配置
├── package.json                    # 依赖管理
└── tsconfig.json                   # TypeScript 配置
```

## 本地开发

### 环境要求

- **Node.js**: 18+
- **pnpm**: 8+
- **Expo CLI**: 最新版本（`pnpm install -g expo-cli`）
- **iOS**: Xcode 15.0+（测试 iOS 功能）
- **Android**: Android Studio 2024.1+（测试 Android）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动 Expo 开发服务器
pnpm start

# 在 iOS 模拟器运行
pnpm ios

# 在 Android 模拟器运行
pnpm android

# Web 支持（限定功能）
pnpm web

# 代码检查与类型检查
pnpm lint
pnpm typecheck
```

按照 Expo 提示扫描 QR 码，在物理设备上使用 Expo Go 应用测试。

## 部署

使用 EAS（Expo Application Services）构建和发布：

```bash
# 为 iOS 构建
eas build --platform ios

# 为 Android 构建
eas build --platform android

# 同时为两个平台构建
eas build --platform all

# 提交到 App Store 和 Google Play
eas submit --platform ios
eas submit --platform android
```

配置位于 `eas.json`，包括 iOS 签名和 Android 签名信息。

## 环境变量

核心环境变量（`.env` 或 GitHub Secrets）：

- `API_BASE_URL` — 后端 API 端点
- `SENTRY_DSN` — 错误跟踪
- `POSTHOG_API_KEY` — 分析
- `HMAC_SECRET` — API 请求签名

## 相关仓库

- **ios** — 原生 iOS 应用（Swift + SwiftUI）
- **android** — 原生 Android 应用（Kotlin + Compose）
- **api** — NestJS 后端 API
- **web** — Next.js Web 应用

## 文档

- 📚 在线文档：https://docs.readmigo.app
- Expo 官方文档：https://docs.expo.dev
- iOS Bundle ID：`rn.readmigo.app`
- Android Package：`com.readmigo.app`
