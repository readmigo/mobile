# Readmigo Mobile — 技术面试叙事文档

> 面向 Tesla China After-Sales Finance 团队 React Native / Full-Stack 岗位
> 候选人：郭宏斌 (Hongbin Guo)
> 项目角色：独立开发者（架构 + 实现 + 发布）

---

## 1. 项目概览

### 技术栈版本表

| 层次 | 技术 | 版本 |
|------|------|------|
| UI Runtime | React | 19.1.0 |
| Mobile Framework | React Native | 0.81.5 (New Architecture enabled) |
| Platform SDK | Expo | SDK 54 (expo ~54.0.30) |
| 路由 | expo-router | 6.0.21 (file-based routing) |
| 数据层 | @tanstack/react-query | 5.90.12 |
| 本地数据库 | expo-sqlite | 16.0.10 |
| ORM | drizzle-orm | 0.45.1 |
| 状态管理 | zustand | 5.0.9 + immer 11.1.0 |
| 动画 | react-native-reanimated | 4.1.1 |
| 手势 | react-native-gesture-handler | 2.28.0 |
| 列表性能 | @shopify/flash-list | 2.2.0 |
| 监控 | @sentry/react-native 8.6 + posthog-react-native 4.37 |
| OTA 热更新 | Shorebird (self-hosted) |
| CI/CD | Jenkins + fastlane |
| TypeScript | 5.9.2 |
| 包管理 | pnpm 9 |

### 关键依赖分类表

| 分类 | 依赖 |
|------|------|
| 认证 | expo-apple-authentication, expo-auth-session, expo-crypto, expo-secure-store |
| 音频 | expo-av (background playback + silent mode) |
| 国际化 | i18next 25.7 + react-i18next 16.5 + expo-localization 17 |
| 导航 | @react-navigation/native 7.1 + native-stack 7.9 + bottom-tabs 7.9 |
| UI 组件 | @gorhom/bottom-sheet 5.2, lottie-react-native 7.3, react-native-svg 15.12 |
| 订阅支付 | react-native-purchases (RevenueCat) |
| 推送通知 | expo-notifications 0.32 |
| Native Module | 自研 DeviceFingerprint TurboModule (JSI) |

### 架构观点（面试可讲的"为什么"）

1. **为什么选 Expo SDK 54 Bare Workflow 而非 Managed？** — 需要自研 TurboModule (DeviceFingerprint)、需要 Shorebird OTA (企业级 staged rollout + auto-rollback)、需要 Jenkins 控制完整 CI 流水线
2. **为什么 expo-router 而非 React Navigation 手写？** — 文件即路由消除 navigation boilerplate、支持 typed routes (experiments.typedRoutes=true)、deep link 自动映射
3. **为什么 zustand + immer 而非 Redux？** — 零 boilerplate、middleware 组合 (persist + immer)、selector 粒度精确避免不必要 re-render、与 React Query 互补（server state vs client state 分离）
4. **为什么 @tanstack/react-query 而非 SWR？** — mutation 语义更强、自带 optimistic update、queryKey factory 模式让 invalidation 精准可控
5. **为什么 Shorebird 而非 EAS Update？** — 可自托管 (self-hostable) 不依赖 Expo 服务、支持 staged rollout (10% → 50% → 100%) + 崩溃率自动回滚

---

## 2. 业务概览

### 10 秒电梯 Pitch

Readmigo 是一款面向全球英语学习者的双语阅读 App（已上架 App Store + Google Play），核心是将英文原版书阅读与 AI 辅助学习融合——支持 EPUB 阅读、有声书、AI 词义解释/翻译/简化、生词本 + SRS 间隔复习、社区分享。

### 用户画像

- 非英语母语的成年英语学习者（初级到高级）
- 主要市场：中国大陆、东南亚、拉美
- 付费模式：Freemium + Premium 订阅 (RevenueCat)

### 核心功能列表

App 共计 **28 个 feature 模块**（基于 `src/features/` 目录）：

| # | 模块 | 功能 |
|---|------|------|
| 1 | agora | 社区动态 Feed（读书笔记分享、关注） |
| 2 | ai | AI 解释 / 翻译 / 文本简化 |
| 3 | analytics | 阅读统计（日/周/月数据） |
| 4 | annual-report | 年度阅读报告 |
| 5 | audiobook | 有声书播放器 (background audio, chapter nav, sleep timer) |
| 6 | auth | Apple / Google / Email 认证 |
| 7 | badges | 成就徽章系统 (level tiers) |
| 8 | bookmarks | 书签管理 |
| 9 | books | 图书目录、分类、搜索 |
| 10 | bookshelf | 个人书架 (shelf/list 双视图, manual sort) |
| 11 | devices | 设备管理（多端同步） |
| 12 | help | 帮助/FAQ |
| 13 | import | 外部 EPUB 导入 |
| 14 | library | 用户图书馆（收藏、进度） |
| 15 | messaging | 站内信/客服聊天 |
| 16 | notifications | 推送通知列表 |
| 17 | offline | 离线下载管理（30 天 TTL） |
| 18 | postcards | 读书明信片（分享图片生成） |
| 19 | quotes | 名句收藏 |
| 20 | reader | EPUB 阅读器 (WebView + epub.js) |
| 21 | series | 系列丛书 |
| 22 | settings | 设置（主题/语言/阅读器偏好） |
| 23 | sharecard | 分享卡片生成（多主题） |
| 24 | social | 社交分享 (share sheet) |
| 25 | subscriptions | Premium 订阅 (RevenueCat + Paywall) |
| 26 | vocabulary | 生词本 + Flashcard SRS 复习 |
| 27 | reader/highlights | 高亮 + 笔记 (6 色 + 4 种样式) |
| 28 | reader/tts | 文本转语音（边读边听） |

---

## 3. 技术能力矩阵

### 3.1 expo-router 文件路由架构

**架构图：**

```
app/
├── _layout.tsx          ← Root Stack (providers 嵌套层)
├── index.tsx            ← 启动入口（redirect 逻辑）
├── (auth)/              ← Auth Group (未登录可见)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── email-login.tsx
│   ├── email-register.tsx
│   ├── forgot-password.tsx
│   └── onboarding.tsx
├── (tabs)/              ← Tab Navigator
│   ├── _layout.tsx      ← 4-tab layout
│   ├── bookshelf.tsx
│   ├── discover.tsx
│   ├── audiobook.tsx
│   └── me.tsx
├── book/[id].tsx        ← Dynamic route (书籍详情)
├── book/reader.tsx      ← Full-screen modal (EPUB 阅读器)
├── audiobook-player.tsx ← Full-screen modal (有声书播放)
├── category/[id].tsx    ← 分类详情
├── author/[id].tsx      ← 作者详情
├── series/[id].tsx      ← 系列详情
├── book-list/[id].tsx   ← 书单详情
├── chat.tsx             ← 聊天
├── messages.tsx         ← 消息列表
├── notifications.tsx    ← 通知列表
├── offline-manager.tsx  ← 离线管理
├── reading-stats.tsx    ← 阅读统计
├── badges.tsx           ← 徽章列表
└── ...（30+ 路由文件）
```

**设计细节：**

Root `_layout.tsx` 采用 **Provider 分层嵌套**，从外到内：
`ErrorBoundary → SafeAreaProvider → QueryClientProvider → GestureHandlerRootView → ThemeProvider → BottomSheetModalProvider → Stack`

```typescript
// app/_layout.tsx — provider 嵌套顺序
function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutInner />
    </ErrorBoundary>
  );
}
export default Sentry.wrap(RootLayout);
```

关键设计决策：
- `newArchEnabled: true` — 启用 New Architecture (Fabric + TurboModules)
- `experiments.typedRoutes: true` — 编译时路由类型安全
- Reader 页面用 `presentation: 'fullScreenModal'` + `animation: 'fade'` 实现沉浸式阅读
- Tab layout 中 badge 数量通过 `useUnreadCount()` hook 实时更新

**面试话术：** "Readmigo 用 expo-router v6 做文件路由，30 多个路由文件完全自动注册。Root layout 做了 provider 分层——ErrorBoundary 包 Sentry.wrap 做全局崩溃捕获，然后依次是 QueryClientProvider、GestureHandlerRootView、ThemeProvider。我开启了 typedRoutes 实验特性让 router.push() 有编译时类型检查，避免了传统 React Navigation 手写 ParamList 的维护成本。"

**已知改进点：** 目前 deep link 处理在 notifications service 中硬编码 `router.push(deepLink as any)`，可以引入 route schema validation。

---

### 3.2 TanStack React Query 数据层

**架构图：**

```
┌──────────────────────────────────────────────┐
│                  UI Layer                     │
│  useBooks() / useAudiobook() / useNotifications()  │
└───────────────────┬──────────────────────────┘
                    │ useQuery / useMutation
┌───────────────────▼──────────────────────────┐
│           React Query Cache                   │
│  staleTime: 5min / gcTime: 24h / retry: 2    │
└───────────────────┬──────────────────────────┘
                    │ queryFn → api call
┌───────────────────▼──────────────────────────┐
│           API Client (axios)                  │
│  interceptor: auth token injection            │
│  interceptor: 401 → token refresh → retry     │
└──────────────────────────────────────────────┘
```

**设计细节：**

QueryClient 全局配置：

```typescript
// src/services/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: 1 },
  },
});
```

**Query Key Factory 模式** — 类型安全 + 精准 invalidation：

```typescript
export const queryKeys = {
  books: {
    all: ['books'] as const,
    list: (params?) => ['books', 'list', params] as const,
    detail: (id: string) => ['books', 'detail', id] as const,
    search: (query: string) => ['books', 'search', query] as const,
    categories: ['books', 'categories'] as const,
  },
  library: {
    all: ['library'] as const,
    books: ['library', 'books'] as const,
    progress: (bookId: string) => ['library', 'progress', bookId] as const,
  },
};
```

每个 feature 模块遵循同一 pattern：

```typescript
// src/features/audiobook/hooks/useAudiobook.ts
export const audiobookKeys = {
  all: ['audiobooks'] as const,
  lists: () => [...audiobookKeys.all, 'list'] as const,
  list: (params) => [...audiobookKeys.lists(), params] as const,
  detail: (id: string) => [...audiobookKeys.details(), id] as const,
};

export function useAudiobook(id: string) {
  return useQuery({
    queryKey: audiobookKeys.detail(id),
    queryFn: async () => {
      const response = await audiobookApi.getAudiobook(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}
```

**面试话术：** "我用 @tanstack/react-query v5 做 server state 管理，所有查询遵循 queryKey factory pattern——层级嵌套 key 让 invalidation 可以按粒度控制，比如改了某本书的进度只 invalidate `['library', 'progress', bookId]`，不影响其他缓存。默认 staleTime 5 分钟减少不必要请求，gcTime 24 小时让离线时还有缓存可用。配合 axios interceptor 做了透明 token refresh——401 时自动用 refreshToken 换新 accessToken 再重试原请求。"

**已知改进点：** 消息列表用了 polling (`refetchInterval: 10_000`)，可以升级为 WebSocket 实现实时推送。

---

### 3.3 expo-sqlite 本地优先架构

**设计细节：**

项目依赖 `expo-sqlite 16.0.10` + `drizzle-orm 0.45.1`。本地数据库用于：
- 离线阅读进度缓存
- 生词本本地存储
- 高亮/书签持久化
- 有声书播放位置
- 设置持久化

结合 zustand persist middleware 实现 local-first：

```typescript
// 各 store 的 persist 配置
persist(
  immer((set, get) => ({ ... })),
  {
    name: 'offline-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
)
```

**面试话术：** "Readmigo 是 local-first 架构——用 expo-sqlite + drizzle-orm 在本地存储阅读进度、高亮、生词本等核心数据，zustand 的 persist middleware 做序列化层。好处是用户无网络也能正常阅读和做笔记，恢复网络后 sync 到服务端。"

**已知改进点：** 当前 conflict resolution 依赖 last-write-wins，可以引入 CRDT 或 vector clock 做更精确的多端合并。

---

### 3.4 认证系统（Apple Auth + Supabase）

**架构图：**

```
用户 → Apple Sign In → identityToken + nonce
                           │
                           ▼
               Backend /auth/apple 验证
                           │
                           ▼
              返回 accessToken + refreshToken
                           │
                           ▼
           zustand authStore (SecureStore 持久化)
```

**设计细节：**

Apple 认证流程 (`src/features/auth/services/appleAuth.ts`)：

```typescript
export async function signInWithApple(): Promise<AppleAuthResult> {
  // 1. 生成随机 nonce (32 bytes → SHA256 hash)
  const nonce = await generateNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256, nonce
  );

  // 2. 调用 Apple Sign In
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [FULL_NAME, EMAIL],
    nonce: hashedNonce,
  });

  // 3. 返回 idToken + raw nonce 供后端验证
  return { idToken: credential.identityToken, nonce, user: {...} };
}
```

Auth state 使用 **SecureStore** 持久化（而非 AsyncStorage）：

```typescript
// src/stores/secureStorage.ts
export const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name),
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};
```

`useAuthStore` 用 zustand + persist + immer：
- 持久化到 SecureStore (iOS Keychain / Android Keystore，硬件加密)
- rehydration 带 3 秒 safety timeout 防止 splash 永远不消失
- Guest Mode 允许免登录浏览

**面试话术：** "认证用 Apple Sign In + 自建后端 JWT 双 token 方案。关键安全设计：nonce 防 replay attack，token 存在 expo-secure-store (iOS Keychain 硬件加密) 而非 AsyncStorage 明文 SQLite。axios interceptor 做了透明 refresh——401 时自动换 token 不打断用户操作。zustand 的 rehydration 有 3 秒 safety timeout 防止 SecureStore 读取卡住导致白屏。"

**已知改进点：** 可以增加 biometric authentication (FaceID/TouchID) 作为二次验证；考虑 token rotation 更短的 accessToken TTL。

---

### 3.5 i18n 国际化

**设计细节：**

支持 **15 种语言**：en, zh-Hans, zh-Hant, de, es, fr, ja, ko, ar, pt, ru, tr, id, uk, hi

```typescript
// src/i18n/index.ts
const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0]?.languageTag || 'en';
  // 精确匹配中文变体
  if (locale.startsWith('zh')) {
    if (locale.includes('Hans') || locale === 'zh-CN' || locale === 'zh-SG') return 'zh-Hans';
    if (locale.includes('Hant') || locale === 'zh-TW' || locale === 'zh-HK') return 'zh-Hant';
    return 'zh-Hans';
  }
  // 其他语言取前缀匹配
  const langPrefix = locale.split('-')[0].toLowerCase();
  return SIMPLE_LANG_CODES.find(code => code === langPrefix) || 'en';
};
```

三层语言决定逻辑：
1. 用户手动选择 (AsyncStorage 持久化)
2. 设备系统语言 (expo-localization)
3. fallback 到 English

API 请求自动带 `Accept-Language` header：

```typescript
// src/services/api/client.ts interceptor
config.headers['Accept-Language'] = language;
```

**面试话术：** "App 支持 15 种语言，用 react-i18next + expo-localization 实现。语言检测逻辑是三层 fallback：用户手动选择 > 设备系统语言 > English。中文做了细粒度区分——zh-CN/zh-SG 映射到简体，zh-TW/zh-HK 映射到繁体。API 层 axios interceptor 自动注入 Accept-Language header 让后端返回对应语言内容。"

**已知改进点：** 缺少 RTL layout 支持（ar 语言只翻译了文案但 UI 没有镜像），需要加 `I18nManager.forceRTL()`。

---

### 3.6 音频播放系统

**架构图：**

```
┌───────────────────────────────────────────────────┐
│                  UI Layer                          │
│  AudioPlayer.tsx / MiniPlayer.tsx / VoiceSelector  │
└───────────────────────┬───────────────────────────┘
                        │ zustand actions
┌───────────────────────▼───────────────────────────┐
│          audioPlayerStore (zustand + immer)        │
│  State: audiobook, chapter, time, speed, timer    │
│  Actions: play/pause/seek/nextChapter/syncProgress│
└───────────────────────┬───────────────────────────┘
                        │ getAudioService()
┌───────────────────────▼───────────────────────────┐
│           AudioService (singleton class)           │
│  expo-av Audio.Sound instance                     │
│  Event emitter pattern (on/off/emit)              │
│  Background audio + silent mode                   │
└───────────────────────────────────────────────────┘
```

**设计细节：**

AudioService 初始化：

```typescript
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,  // 后台播放
  interruptionModeIOS: InterruptionModeIOS.DoNotMix,
  playsInSilentModeIOS: true,     // 静音模式下仍播放
  shouldDuckAndroid: true,
  interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
});
```

核心功能：
- **Chapter navigation** — 播完自动 nextChapter，如果 sleepTimer='end_of_chapter' 则暂停
- **Progress sync** — debounced 5 秒同步一次到后端
- **Sleep timer** — 支持定时分钟数或 "end_of_chapter"
- **Playback speed** — 0.5x ~ 3x (expo-av `setRateAsync` with pitch correction)
- **Previous chapter 智能逻辑** — 超过 3 秒则重播当前章，否则回上一章

```typescript
previousChapter: async () => {
  if (currentTime > 3) { get().seek(0); return; }
  // else go to previous chapter
}
```

**面试话术：** "有声书播放器用 expo-av 做音频引擎，支持后台播放和静音模式播放。架构是 Singleton AudioService + zustand store + React Query mutation 三层分离。播放进度每 5 秒 debounce sync 到后端，还有 App 进入后台时立即 flush。Sleep timer 支持倒计时和'播完本章停'两种模式。上一章按钮有智能逻辑——如果当前超过 3 秒就重播本章，否则才真正跳上一章，和 Spotify/Apple Music 一样的 UX 模式。"

**已知改进点：** 缺少 lock screen / notification center 的 media controls (MediaSession API)；可以用 react-native-track-player 替代 expo-av 获得更完整的后台控制。

---

### 3.7 AI 功能模块

**架构图：**

```
用户选中文本 → HighlightToolbar → "Explain" / "Translate" button
                                         │
                                         ▼
                              useAIExplain / useAITranslate (mutation)
                                         │
                                         ▼
                              POST /api/v1/ai/explain
                              POST /api/v1/ai/translate
                              POST /api/v1/ai/simplify
                                         │
                                         ▼
                              AIExplanationPanel / TranslationSheet
```

**设计细节：**

三种 AI 能力：

```typescript
// src/services/api/ai.ts
export const aiApi = {
  explain: (data: ExplainRequest) => apiClient.post('/ai/explain', data),
  simplify: (data: SimplifyRequest) => apiClient.post('/ai/simplify', data),
  translate: (data: TranslateRequest) => apiClient.post('/ai/translate', data),
};
```

ExplainResponse 包含：explanation + pronunciation + examples + relatedWords
翻译支持 10 种目标语言（zh-Hans/zh-Hant/es/ja/ko/fr/de/pt/ar/tr）

生词本集成 — 用户可将 AI 解释的单词一键保存，带 SRS 间隔复习：

```typescript
interface SavedWord {
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
  context?: string; // 原文上下文
  bookId?: string;
  masteryLevel: number; // SRS level
  nextReviewAt?: string;
}
```

**面试话术：** "AI 模块是 reading copilot——用户在阅读器里选中文字，弹出 HighlightToolbar 提供 Explain/Translate/Simplify 三个 AI 功能。Explain 返回释义+发音+例句+关联词；Simplify 可以按难度等级简化原文方便初学者理解。选中的词可以一键存入生词本，后端做 SRS 间隔复习调度。"

**已知改进点：** 当前是同步 REST 请求，可以改为 streaming response (SSE) 让用户看到逐字输出体验更好。

---

### 3.8 离线模式

**设计细节：**

Offline 系统由三部分组成：
1. `offlineStore` (zustand) — 管理下载状态和元数据
2. `useOfflineBook` hook — 下载/删除逻辑
3. `expo-file-system/next` API — 文件存储

```typescript
// src/features/offline/hooks/useOfflineBook.ts
const download = useCallback(async () => {
  ensureCacheDir();
  const response = await booksApi.getBookContent(bookId);
  const localFile = new File(getCacheDir(), `${bookId}.epub`);

  setBook({ ...offlineBook, status: 'downloading', progress: 0 });
  const downloadedFile = await File.downloadFileAsync(remoteUrl, localFile);
  setBook({ ...offlineBook, fileSize: downloadedFile.size, status: 'completed', progress: 1 });
}, [...]);
```

关键设计：
- **30 天 TTL** — 每本下载的书有过期时间，`clearExpired()` 清理过期缓存
- **Download queue** — 支持批量下载队列
- **磁盘空间管理** — `getTotalCacheSize()` 计算已用缓存

**面试话术：** "离线模式用 expo-file-system 的 Next API 下载 EPUB 到本地，zustand store 管理下载状态。每本书有 30 天 TTL 自动过期清理。Store 提供 `getTotalCacheSize()` 让用户看到已用磁盘空间，支持一键清理所有/过期缓存。"

**已知改进点：** 缺少后台下载能力 (iOS Background URLSession)；下载进度目前是 0 或 1 (完成)，没有中间百分比追踪。

---

### 3.9 推送通知

**设计细节：**

```typescript
// src/services/notifications.ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

流程：
1. `registerForPushNotifications()` — 获取 Expo Push Token，注册到后端
2. Android 创建 'default' channel (HIGH importance)
3. `setupNotificationListeners()` — 监听通知点击，解析 deep link 跳转

```typescript
const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
  const deepLink = response.notification.request.content.data?.deepLink as string;
  if (deepLink) router.push(deepLink as any);
});
```

Deep link 格式与 expo-router 路径一致，实现通知→页面的无缝跳转。

**面试话术：** "推送用 expo-notifications，注册流程是获取 Expo Push Token → 上报后端 → 后端用 Expo Push API 下发。通知点击通过 `addNotificationResponseReceivedListener` 捕获 deep link 字段直接 `router.push()`，和 expo-router 的路由体系完全打通。"

**已知改进点：** 可以支持 rich notification (图片预览)；可以按用户阅读习惯做智能推送时机。

---

### 3.10 状态管理模式

**架构图：**

```
┌─────────────────────────────────────────────────┐
│           Server State (React Query)             │
│  books / audiobooks / notifications / messages   │
│  Query Keys factory → fine-grained invalidation  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           Client State (zustand stores)           │
│                                                   │
│  authStore ─── SecureStore persist               │
│  settingsStore ─── AsyncStorage persist          │
│  audioPlayerStore ─── AsyncStorage persist       │
│  offlineStore ─── AsyncStorage persist           │
│  bookshelfStore ─── AsyncStorage persist         │
│  highlightStore ─── AsyncStorage persist         │
│  subscriptionStore ─── in-memory                 │
└─────────────────────────────────────────────────┘
```

**设计细节：**

所有 zustand store 统一使用 `immer` middleware 实现 immutable updates：

```typescript
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      setUser: (user) => set((state) => { state.user = user; state.isAuthenticated = true; }),
      logout: () => set((state) => { state.user = null; state.accessToken = null; }),
    })),
    { name: 'auth-storage', storage: createJSONStorage(() => secureStorage) }
  )
);
```

Store 职责划分明确：
- `authStore` — 用户身份 + token (SecureStore 加密)
- `settingsStore` — 全部用户偏好 (theme/font/reader/audio)
- `audioPlayerStore` — 播放器状态 (只持久化 speed + volume)
- `offlineStore` — 离线书籍元数据
- `highlightStore` — 高亮 + 书签 (per-book keyed)
- `bookshelfStore` — 书架显示模式 + 排序

**面试话术：** "状态管理做了 server state vs client state 的清晰分离。server state 全部走 React Query（缓存 + 自动 revalidation）；client state 用 zustand + immer middleware。6 个 store 各自职责明确，persist 策略按安全等级分——auth token 用 SecureStore (硬件加密)，其他用 AsyncStorage。zustand 的 selector 机制保证组件只订阅需要的 slice，避免多余 re-render。"

**已知改进点：** 可以抽象一个 `createPersistedStore` factory 减少 boilerplate。

---

### 3.11 主题系统

**设计细节：**

双主题 (light/dark) + 系统跟随 + 阅读器独立主题 (light/dark/sepia)：

```typescript
// src/theme/colors.ts — 26 个 semantic token
export interface ThemeColors {
  background, backgroundSecondary, surface, surfaceSecondary,
  text, textSecondary, textTertiary, textInverse,
  border, borderLight,
  primary, primaryLight, onPrimary,
  brandGradientStart, brandGradientMiddle, brandGradientEnd,
  accentPurple, accentPink, accentBlue, achievementGold,
  success, warning, error, info,
  overlay, scrim,
}
```

Typography 遵循 **iOS HIG Type Scale**（display → caption2，10 级）。

`useTheme()` hook 集成 React Navigation 主题：

```typescript
export function useTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  // 同时返回 colors + navigationTheme 保证全局一致
}
```

Reader 有独立的 3 色主题系统（不受 App 主题影响）：

```typescript
export const READER_THEME_COLORS = {
  light: { background: '#FFFFFF', text: '#1A1A1A' },
  sepia: { background: '#FAF2E3', text: '#4D3319' },
  dark: { background: '#1F1F1F', text: '#D9D9D9' },
};
```

**面试话术：** "主题系统有 26 个 semantic color token + 10 级 iOS HIG typography scale。通过 `useTheme()` hook 自动响应系统深色模式切换，同时同步到 React Navigation 的 theme 保证 header/tab bar 一致。阅读器有独立的 3 色主题（含 sepia 护眼），不受全局主题影响——因为用户可能 App 用深色但阅读时偏好 sepia。"

---

### 3.12 社交/消息功能

**设计细节：**

消息系统是 **客服对话型**（非 P2P IM）：

```typescript
// ChatScreen 核心逻辑
const { data: messages } = useQuery({
  queryKey: ['messaging', 'messages', convId],
  queryFn: () => messagingApi.getMessages(convId),
  refetchInterval: 10_000, // 10s polling
});

const { mutate: send } = useMutation({
  mutationFn: async (content) => {
    if (!convId) {
      // 首次发消息自动创建会话
      return messagingApi.createConversation(subject, content);
    }
    return messagingApi.sendMessage(convId, content);
  },
});
```

社区 (Agora) 是 Feed 流——AgoraFeed → AgoraPostCard → BookReference，支持书评分享。

**面试话术：** "消息功能是客服/支持对话模型，用 React Query 的 refetchInterval 做 10 秒轮询实现准实时。首次发消息自动创建会话，mutation onSuccess 后 invalidate 消息列表触发 UI 刷新。"

---

### 3.13 监控（Sentry + PostHog）

**设计细节：**

**Sentry 配置：**

```typescript
Sentry.init({
  tracesSampleRate: 0.2,      // 20% 性能追踪
  profilesSampleRate: 0.1,    // 10% 性能 profiling
  enableAutoSessionTracking: true,
  maxBreadcrumbs: 100,
  beforeSend(event) {
    // PII filtering: 删除 email
    if (event.user?.email) delete event.user.email;
    return event;
  },
});
```

带上下文的 breadcrumb 追踪：

```typescript
export function setReadingContext(bookId?: string, bookTitle?: string) {
  Sentry.setTag('reading.bookId', bookId ?? '');
  Sentry.setTag('reading.bookTitle', bookTitle ?? '');
}
```

**PostHog 配置：**

```typescript
posthogClient = new PostHog(POSTHOG_API_KEY, {
  host: 'https://us.i.posthog.com',
  flushAt: 20,           // 批量 20 事件发送
  flushInterval: 30000,  // 或 30 秒
});
```

预定义的产品事件 (aligned with iOS app)：
- `audiobook_session_ended` / `audiobook_chapter_changed` / `audiobook_speed_changed`
- `tts_started` / `tts_session_ended` / `tts_voice_selected`
- `reader_setting_changed`
- `onboarding_step_completed` / `onboarding_completed`

**面试话术：** "双监控系统：Sentry 负责崩溃和性能（20% traces + 10% profiling），有 PII filtering 和 reading context tag；PostHog 负责产品分析，预定义了 audiobook/reader/onboarding 等事件。两者都在 Root Layout 初始化，用户登录后 identify 关联 userId。ErrorBoundary 组件捕获 React 树未处理异常自动上报 Sentry。"

**已知改进点：** 可以用 Sentry Performance 做 screen load time 追踪；PostHog 可以接入 feature flags 做 A/B 测试。

---

### 3.14 动画与手势

**设计细节：**

动画组件库 (`src/components/ui/AnimatedPressable.tsx`)：

```typescript
// ScalePressable — 按下缩放 + 弹簧回弹
const handlePressIn = (event) => {
  scale.value = withTiming(scaleValue, { duration: 100 });
};
const handlePressOut = (event) => {
  scale.value = withSpring(1, { damping: 15, stiffness: 150 });
};

// BounceView — 入场弹跳动画
scale.value = withSpring(1, { damping: 12, stiffness: 200 });

// SlideInView — 方向可配的滑入动画
// 支持 left/right/up/down 四个方向
```

Reanimated 4 + Gesture Handler 配合使用场景：
- 有声书播放器进度拖拽
- Bottom Sheet 手势展开/收起
- EPUB 阅读器翻页手势
- 书架编辑模式拖拽排序

**面试话术：** "动画层用 Reanimated 4（worklet 在 UI thread 执行，不占 JS thread）。封装了 ScalePressable / FadePressable / BounceView / SlideInView 四个动画原语，spring config 统一管理保证全 App 动画手感一致。Gesture Handler 2.28 配合 BottomSheet 5.2 做手势交互——播放器进度条、阅读器翻页、书架拖拽都走 native gesture。"

---

### 3.15 企业级改造（Jenkinsfile + fastlane + Shorebird + TurboModule）

**CI/CD Pipeline (Jenkinsfile):**

```
Setup → Lint & Typecheck (parallel) → Test → Build iOS/Android → Distribute → OTA Update
```

关键设计：
- **并行 lint + typecheck** 节省 CI 时间
- **条件触发**：Build 只在 main/release/* 分支触发
- **OTA 条件**：main 分支 + 非 native 代码改动 → 走 Shorebird OTA（跳过重新打包）
- **Slack 通知**：成功/失败都通知 #mobile-ci channel

**fastlane 配置：**

```ruby
# iOS: enterprise 签名 + match 证书管理
match(type: "enterprise", app_identifier: "com.readmigo.app", readonly: true)
build_app(workspace: "ios/Readmigo.xcworkspace", export_method: "enterprise")

# iOS: TestFlight 发布
increment_build_number(build_number: latest_testflight_build_number + 1)
upload_to_testflight(api_key: api_key, skip_waiting_for_build_processing: true)

# Android: Firebase App Distribution
firebase_app_distribution(app: FIREBASE_APP_ID, groups: "internal-testers")
```

**Shorebird OTA:**

```yaml
# shorebird.yaml
channels:
  - name: production
  - name: staging
  - name: development

rollout:
  stages:
    - percentage: 10, min_duration_hours: 4
    - percentage: 50, min_duration_hours: 12
    - percentage: 100

auto_rollback:
  enabled: true
  crash_rate_threshold: 0.05  # 5% 崩溃率自动回滚
  evaluation_window_minutes: 30
```

**DeviceFingerprint TurboModule:**

这是一个自研的 JSI Native Module，用于设备风控：

```typescript
// spec.ts — Codegen 定义
export interface Spec extends TurboModule {
  getFingerprint(): string;           // 同步 JSI (SHA-256 hash)
  attestDevice(challenge: string): Promise<string>;  // DeviceCheck / Play Integrity
  getRiskSignals(): { isJailbroken, isEmulator, isDebuggerAttached, isVPN };
}
```

iOS 实现用 Swift：
- `getFingerprint()` → IDFV + model + systemVersion → SHA256
- `attestDevice()` → Apple DeviceCheck API (DCDevice)
- `getRiskSignals()` → 检测越狱路径 / Simulator / debugger (P_TRACED) / VPN (network interface)

Android 实现用 Kotlin：
- `getFingerprint()` → ANDROID_ID + model + SDK_INT → SHA256
- `attestDevice()` → Play Integrity API
- `getRiskSignals()` → root 路径检测 / 模拟器 fingerprint / VPN (TRANSPORT_VPN)

```kotlin
// Android — 同步 JSI 方法
@ReactMethod(isBlockingSynchronousMethod = true)
override fun getFingerprint(): String {
    val androidId = Settings.Secure.getString(contentResolver, ANDROID_ID)
    val raw = "$androidId|$model|$sdk"
    return MessageDigest.getInstance("SHA-256").digest(raw.toByteArray())
        .joinToString("") { "%02x".format(it) }
}
```

**面试话术：** "项目从 Expo Managed 迁移到 Bare Workflow 做了企业级改造：Jenkins Pipeline 做 CI/CD（并行 lint+typecheck、条件触发 build、OTA 旁路）；fastlane 管理 iOS enterprise 签名和 TestFlight 发布；Shorebird 做 OTA 热更新，配置了 staged rollout (10% → 50% → 100%) 和 5% 崩溃率自动回滚。最重要的是自研了 DeviceFingerprint TurboModule——这是个 JSI 同步调用的 native module，用 Swift/Kotlin 双端实现设备指纹、Apple DeviceCheck/Play Integrity 设备认证、以及 jailbreak/root/emulator/VPN 风险检测。这个模块的典型应用场景就是金融类 App 的反欺诈设备绑定——和 Tesla 售后金融的风控需求完全对口。"

**已知改进点：** DeviceFingerprint 可以增加 App Attest (iOS 14+) 替代旧的 DeviceCheck API，提供更强的 app integrity 证明。

---

## 4. 与 Tesla 售后金融 JD 的关联

### 面试钩子矩阵

| Tesla JD 要求 | Readmigo 对应能力 | 面试话术关键词 |
|---|---|---|
| React Native 开发 | RN 0.81 + New Arch + TurboModule | "我的第二个 RN 项目，用的是最新的 New Architecture + JSI" |
| 金融级安全 | SecureStore (Keychain) + DeviceFingerprint + Apple attestation | "和金融 App 一样的安全标准——token 硬件加密、设备指纹、越狱检测" |
| CI/CD 企业级 | Jenkins + fastlane + Shorebird OTA staged rollout | "完整的企业 CI/CD 流水线，支持 staged rollout + auto-rollback" |
| 全栈能力 | 前端 RN + 后端 API 设计 + DB schema + 推送 + 支付 | "独立负责从 UI 到后端 API 到数据库到支付集成的完整链路" |
| 状态管理 | zustand + React Query (server/client 分离) | "server state vs client state 分离，精准缓存控制" |
| 性能优化 | FlashList + Reanimated worklets + debounce/throttle utils | "列表用 FlashList 替代 FlatList、动画在 UI thread 跑" |
| 多语言 | 15 种语言 + RTL ready | "支持 15 种语言的国际化系统" |
| 离线能力 | local-first + expo-sqlite + offline download | "local-first 架构，断网也能用" |
| 订阅支付 | RevenueCat (Apple IAP + Google Play Billing) | "集成了 RevenueCat 做跨平台订阅管理" |
| 团队协作 | typed routes + query key factory + modular feature folders | "28 个 feature 模块清晰解耦，每个有独立的 components/hooks/services/stores" |

### 关键差异化叙事（vs ds_app）

| 维度 | ds_app (第一个 RN 项目) | Readmigo (本项目) |
|------|---|---|
| 用户类型 | B2B 经销商 SaaS | C2C 消费者 App |
| 路由 | React Navigation 手写 | expo-router 文件路由 |
| 状态 | Context API + useReducer | zustand + React Query |
| RN 版本 | 0.79 | 0.81 (New Architecture) |
| Expo SDK | 53 | 54 |
| Native Module | 无 | 自研 TurboModule (JSI) |
| OTA | EAS Update | Shorebird (自托管) |
| CI/CD | EAS Build | Jenkins + fastlane |
| 规模 | ~10 页面 | 30+ 路由、28 feature 模块 |
| 上架 | 内部分发 | App Store + Google Play |

**面试总结话术：** "Readmigo 是我独立从零搭建的第二个 React Native 项目，28 个功能模块、15 种语言、已上架双平台。和第一个 B2B 项目相比，最大的技术跃迁是：1) 从 Managed 迁移到 Bare Workflow 自研 TurboModule；2) 用 expo-router 文件路由替代手写 navigation；3) 引入 React Query + zustand 做 server/client state 分离；4) 搭建了 Jenkins+fastlane+Shorebird 的企业级 CI/CD。其中 DeviceFingerprint TurboModule 的设备风控能力和 Tesla 售后金融的反欺诈需求直接对口。"
