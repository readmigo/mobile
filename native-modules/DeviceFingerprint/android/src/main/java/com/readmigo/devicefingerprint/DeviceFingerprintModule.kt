package com.readmigo.devicefingerprint

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Debug
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest
import java.io.File
import java.security.MessageDigest

/**
 * TurboModule implementation for Android — device fingerprint + Play Integrity.
 *
 * Registered via Codegen-generated C++ bridge (NativeDeviceFingerprintSpec).
 * All synchronous methods execute on JSI thread (no bridge serialization).
 */
class DeviceFingerprintModule(
    private val reactContext: ReactApplicationContext
) : NativeDeviceFingerprintSpec(reactContext), TurboModule {

    override fun getName(): String = NAME

    // MARK: - getFingerprint (synchronous via JSI)

    @SuppressLint("HardwareIds")
    @ReactMethod(isBlockingSynchronousMethod = true)
    override fun getFingerprint(): String {
        val androidId = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ANDROID_ID
        )
        val model = Build.MODEL
        val sdk = Build.VERSION.SDK_INT.toString()
        val raw = "$androidId|$model|$sdk"
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(raw.toByteArray())
            .joinToString("") { "%02x".format(it) }
    }

    // MARK: - attestDevice (async — Play Integrity API)

    @ReactMethod
    override fun attestDevice(challenge: String, promise: Promise) {
        val integrityManager = IntegrityManagerFactory.create(reactContext)
        val request = IntegrityTokenRequest.builder()
            .setNonce(challenge)
            .build()

        integrityManager.requestIntegrityToken(request)
            .addOnSuccessListener { response ->
                promise.resolve(response.token())
            }
            .addOnFailureListener { e ->
                promise.reject("ATTEST_FAILED", e.message, e)
            }
    }

    // MARK: - getRiskSignals (synchronous)

    @ReactMethod(isBlockingSynchronousMethod = true)
    override fun getRiskSignals(): WritableNativeMap {
        val map = WritableNativeMap()
        map.putBoolean("isJailbroken", checkRoot())
        map.putBoolean("isEmulator", checkEmulator())
        map.putBoolean("isDebuggerAttached", Debug.isDebuggerConnected())
        map.putBoolean("isVPN", checkVPN())
        return map
    }

    // MARK: - Private risk checks

    private fun checkRoot(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su"
        )
        return paths.any { File(it).exists() }
    }

    private fun checkEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.BRAND.startsWith("generic")
                || Build.DEVICE.startsWith("generic")
                || "google_sdk" == Build.PRODUCT)
    }

    private fun checkVPN(): Boolean {
        val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
    }

    companion object {
        const val NAME = "DeviceFingerprint"
    }
}
