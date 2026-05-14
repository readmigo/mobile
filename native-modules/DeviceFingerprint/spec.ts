import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * DeviceFingerprint TurboModule — generates a unique device identifier
 * for enterprise B2B risk assessment (anti-fraud / device binding).
 *
 * Why a native module (not JS):
 * - Access to hardware identifiers (IDFV on iOS, Android ID)
 * - Secure enclave attestation (DeviceCheck / Play Integrity)
 * - Cannot be spoofed from JS layer
 *
 * This is the Codegen spec — `npx react-native codegen` generates
 * the C++ JSI interface from this TypeScript definition.
 */
export interface Spec extends TurboModule {
  /**
   * Returns a stable device fingerprint hash (SHA-256).
   * Combines: platform ID + app install ID + hardware signals.
   * Synchronous via JSI — no bridge round-trip.
   */
  getFingerprint(): string;

  /**
   * Performs device attestation with platform security service.
   * iOS: DeviceCheck API (Apple server validates device integrity)
   * Android: Play Integrity API (Google server validates device)
   * Returns attestation token for backend verification.
   */
  attestDevice(challenge: string): Promise<string>;

  /**
   * Returns device risk signals for fraud scoring.
   * Checks: jailbreak/root, debugger attached, emulator, VPN, proxy.
   */
  getRiskSignals(): {
    isJailbroken: boolean;
    isEmulator: boolean;
    isDebuggerAttached: boolean;
    isVPN: boolean;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceFingerprint');
