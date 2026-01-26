# Readmigo Mobile

Cross-platform mobile application built with React Native and Expo.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS)

## Features

- Cross-platform iOS and Android support
- Shared codebase with platform-specific optimizations
- Expo managed workflow for easier development
- OTA updates support

## Project Structure

```
├── app/                 # Expo Router pages
├── components/          # React Native components
├── lib/                 # Utilities and helpers
├── stores/              # Zustand stores
└── assets/              # Images and fonts
```

## Development

```bash
# Install dependencies
pnpm install

# Start Expo development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

## Bundle IDs

- iOS: `rn.readmigo.app`
- Android: `com.readmigo.app`

## Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```
