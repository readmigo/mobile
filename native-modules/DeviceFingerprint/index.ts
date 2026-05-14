import NativeDeviceFingerprint from './spec';

export interface RiskSignals {
  isJailbroken: boolean;
  isEmulator: boolean;
  isDebuggerAttached: boolean;
  isVPN: boolean;
}

/**
 * Enterprise device fingerprint module.
 *
 * Usage:
 *   import { DeviceFingerprint } from '@/native-modules/DeviceFingerprint';
 *
 *   // Synchronous (JSI, no bridge round-trip)
 *   const fp = DeviceFingerprint.getFingerprint();
 *   const risk = DeviceFingerprint.getRiskSignals();
 *
 *   // Async (platform attestation)
 *   const token = await DeviceFingerprint.attestDevice(serverChallenge);
 */
export const DeviceFingerprint = {
  getFingerprint(): string {
    return NativeDeviceFingerprint.getFingerprint();
  },

  async attestDevice(challenge: string): Promise<string> {
    return NativeDeviceFingerprint.attestDevice(challenge);
  },

  getRiskSignals(): RiskSignals {
    return NativeDeviceFingerprint.getRiskSignals();
  },
};
