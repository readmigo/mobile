# Native Modules (TurboModule / JSI)

Custom native modules for enterprise B2B scenarios where Expo managed plugins
are insufficient. Built with React Native's New Architecture (Codegen + JSI).

## DeviceFingerprint

Enterprise device identification and risk assessment module.

### Capabilities

| Method | Sync/Async | Description |
|--------|-----------|-------------|
| `getFingerprint()` | Sync (JSI) | SHA-256 hash of device hardware signals |
| `attestDevice(challenge)` | Async | Platform attestation (DeviceCheck / Play Integrity) |
| `getRiskSignals()` | Sync (JSI) | Jailbreak, emulator, debugger, VPN detection |

### Why Native (not JS)

- Hardware identifiers (IDFV / Android ID) not accessible from JS
- Secure enclave attestation requires platform SDK
- Risk checks must be tamper-resistant (JS layer can be patched via OTA)

### Architecture

```
TypeScript Spec (spec.ts)
    │
    ├── npx react-native codegen
    │       ↓
    ├── Generated C++ JSI interface (build/generated/)
    │       ↓
    ├── iOS: Swift implementation → DeviceCheck API
    │       ↓
    └── Android: Kotlin implementation → Play Integrity API
```

### Integration

```typescript
import { DeviceFingerprint } from '@/native-modules/DeviceFingerprint';

// On app launch — bind device to user session
const fp = DeviceFingerprint.getFingerprint();
await api.post('/auth/bind-device', { fingerprint: fp });

// Before sensitive operation — verify device integrity
const challenge = await api.get('/auth/challenge');
const attestation = await DeviceFingerprint.attestDevice(challenge);
await api.post('/auth/verify-attestation', { token: attestation });

// Continuous risk monitoring
const risk = DeviceFingerprint.getRiskSignals();
if (risk.isJailbroken || risk.isDebuggerAttached) {
  await api.post('/security/risk-alert', { signals: risk });
}
```

### Build

```bash
# Generate Codegen interfaces
npx react-native codegen

# iOS
cd ios && pod install

# Android
cd android && ./gradlew generateCodegenArtifactsFromSchema
```
