# Readmigo Mobile Project Guidelines

## Project Overview

React Native / Expo cross-platform mobile app.

## Project Structure

```
├── src/
│   ├── app/             # Expo Router pages
│   ├── components/      # React Native components
│   ├── hooks/           # Custom hooks
│   ├── stores/          # State management
│   └── utils/           # Utilities
└── app.json             # Expo config
```

## Development Rules

### Key Information

- iOS Bundle ID: `rn.readmigo.app` (与原生 iOS 区分)
- Android Package: `com.readmigo.app`
- 这是 RN/Expo 项目，需特别说明 "RN" 才使用

### Tech Stack

- Framework: React Native with Expo
- Navigation: Expo Router
- Styling: NativeWind (Tailwind for RN)

### Development Commands

```bash
# Start development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

## Investigation & Problem Analysis

When investigating problems, output using this template:
```
问题的原因：xxx
解决的思路：xxx
修复的方案：xxx
```

## Readmigo Team Knowledge Base

所有 Readmigo 项目文档集中存储在：`/Users/HONGBGU/Documents/readmigo-repos/docs/`
当需要跨项目上下文（产品需求、架构决策、设计规范等）时，主动到 docs 目录读取相关文档。
