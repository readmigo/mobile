import Foundation
import CryptoKit
import DeviceCheck
import UIKit

/// TurboModule implementation for iOS — device fingerprint + attestation.
/// Registered via Codegen-generated ObjC++ bridge (NativeDeviceFingerprintSpec).
@objc(DeviceFingerprint)
class DeviceFingerprintModule: NSObject {

    @objc static func moduleName() -> String { "DeviceFingerprint" }
    @objc static func requiresMainQueueSetup() -> Bool { false }

    // MARK: - getFingerprint (synchronous via JSI)

    @objc func getFingerprint() -> String {
        let idfv = UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        let model = UIDevice.current.model
        let systemVersion = UIDevice.current.systemVersion
        let raw = "\(idfv)|\(model)|\(systemVersion)"
        let hash = SHA256.hash(data: Data(raw.utf8))
        return hash.map { String(format: "%02x", $0) }.joined()
    }

    // MARK: - attestDevice (async — DeviceCheck API)

    @objc func attestDevice(_ challenge: String,
                            resolve: @escaping RCTPromiseResolveBlock,
                            reject: @escaping RCTPromiseRejectBlock) {
        guard DCDevice.current.isSupported else {
            reject("UNSUPPORTED", "DeviceCheck not supported on this device", nil)
            return
        }
        DCDevice.current.generateToken { token, error in
            if let error {
                reject("ATTEST_FAILED", error.localizedDescription, error)
                return
            }
            guard let token else {
                reject("NO_TOKEN", "DeviceCheck returned nil token", nil)
                return
            }
            let tokenBase64 = token.base64EncodedString()
            resolve(tokenBase64)
        }
    }

    // MARK: - getRiskSignals (synchronous)

    @objc func getRiskSignals() -> [String: Bool] {
        return [
            "isJailbroken": checkJailbreak(),
            "isEmulator": checkSimulator(),
            "isDebuggerAttached": checkDebugger(),
            "isVPN": checkVPN()
        ]
    }

    // MARK: - Private risk checks

    private func checkJailbreak() -> Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        let paths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt",
            "/private/var/lib/apt/"
        ]
        return paths.contains { FileManager.default.fileExists(atPath: $0) }
        #endif
    }

    private func checkSimulator() -> Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }

    private func checkDebugger() -> Bool {
        var info = kinfo_proc()
        var size = MemoryLayout<kinfo_proc>.stride
        var mib: [Int32] = [CTL_KERN, KERN_PROC, KERN_PROC_PID, getpid()]
        sysctl(&mib, 4, &info, &size, nil, 0)
        return (info.kp_proc.p_flag & P_TRACED) != 0
    }

    private func checkVPN() -> Bool {
        guard let cfDict = CFNetworkCopySystemProxySettings()?.takeRetainedValue() as? [String: Any],
              let scoped = cfDict["__SCOPED__"] as? [String: Any] else {
            return false
        }
        return scoped.keys.contains { $0.contains("tap") || $0.contains("tun") || $0.contains("ppp") || $0.contains("ipsec") }
    }
}
