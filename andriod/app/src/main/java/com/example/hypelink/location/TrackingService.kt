package com.example.hypelink.location

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.example.hypelink.R
import com.example.hypelink.ws.StompManager

/**
 * 🚚 TrackingService
 * - ForegroundService로 실행
 * - STOMP(WebSocket) 연결 관리 + 주기적 위치 전송 담당
 * - Activity에는 LocalBroadcast로 연결 상태 알려줌
 */
class TrackingService : Service() {
    companion object {
        const val ACTION_START = "ACTION_START"   // 서비스 시작 액션
        const val ACTION_STOP  = "ACTION_STOP"    // 서비스 종료 액션

        const val EXTRA_DRIVER_ID = "driver_id"
        const val EXTRA_WS_URL    = "ws_url"

        private const val CHANNEL_ID = "tracking_channel"
        private const val NOTI_ID = 1001

        const val ACTION_STOMP_EVENT = "com.example.hypelink.STOMP_EVENT" // 연결 상태 브로드캐스트
    }

    private lateinit var fused: FusedLocationProviderClient
    private lateinit var request: LocationRequest
    private var driverId: String = ""
    private var wsUrl: String = ""

    private var lastLocation: android.location.Location? = null

    /** 현재 서비스가 동작 중인지 여부 (STOP 시 false로 변경) */
    @Volatile
    private var running = false

    /** 위치 업데이트 콜백 (Google FusedLocation) */
    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            lastLocation = result.lastLocation
        }
    }

    /** 주기적 전송 핸들러 */
    private val handler = Handler(Looper.getMainLooper())
    private val sendRunnable = object : Runnable {
        override fun run() {
            if (!running) {
                Log.d("TrackingService", "⛔️ sendRunnable stopped (running=false)")
                return
            }

            lastLocation?.let { loc ->
                StompManager.sendLocation(driverId, loc.latitude, loc.longitude)
                Log.d("TrackingService", "📡 위치 전송: ${loc.latitude}, ${loc.longitude}")
            }

            // 5초마다 반복 실행
            handler.postDelayed(this, 5000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d("TrackingService", "onCreate called")

        fused = LocationServices.getFusedLocationProviderClient(this)

        // 위치 요청 설정 (5초 주기, 최소 2.5초 간격, 5m 이동 시 업데이트)
        request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
            .setMinUpdateIntervalMillis(2500L)
            .setMinUpdateDistanceMeters(5f)
            .build()

        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                driverId = intent.getStringExtra(EXTRA_DRIVER_ID).orEmpty()
                wsUrl    = intent.getStringExtra(EXTRA_WS_URL).orEmpty()

                startForeground(NOTI_ID, buildNotification("배송 진행 중"))

                // ✅ 실행 중임 표시
                running = true

                // ✅ 웹소켓 연결
                StompManager.connect(wsUrl,
                    onConnected = {
                        Log.d("TrackingService", "✅ STOMP 연결 성공")
                        notifyConnectionEvent(true)
                    },
                    onDisconnected = {
                        Log.d("TrackingService", "❌ STOMP 연결 끊김")
                        notifyConnectionEvent(false)
                    }
                )

                // ✅ 위치 업데이트 시작
                try {
                    fused.requestLocationUpdates(request, callback, mainLooper)
                } catch (e: SecurityException) {
                    Log.e("TrackingService", "❌ 위치 권한 없음: ${e.message}")
                }

                // ✅ 주기적 위치 전송 시작
                handler.post(sendRunnable)
            }

            ACTION_STOP -> {
                Log.d("TrackingService", "⛔️ ACTION_STOP received")

                // 실행 중지 플래그
                running = false

                // 위치 업데이트 중단
                try {
                    fused.removeLocationUpdates(callback)
                    Log.d("TrackingService", "✅ Location updates removed")
                } catch (e: Exception) {
                    Log.e("TrackingService", "❌ Failed to remove updates: ${e.message}")
                }

                // 주기적 위치 전송 중단
                handler.removeCallbacks(sendRunnable)

                // 웹소켓 연결 해제
                StompManager.disconnect()
                Log.d("TrackingService", "✅ STOMP disconnected")

                // 서비스 종료
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("TrackingService", "onDestroy called")

        // 🔒 서비스 종료 시 반드시 정리
        running = false
        handler.removeCallbacks(sendRunnable)
        try {
            fused.removeLocationUpdates(callback)
        } catch (_: Exception) {}
        StompManager.disconnect()
    }

    /** 연결 상태를 Activity에 알려주는 LocalBroadcast */
    private fun notifyConnectionEvent(connected: Boolean) {
        val intent = Intent(ACTION_STOMP_EVENT)
        intent.putExtra("connected", connected)
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
    }

    /** Foreground 알림 생성 */
    private fun buildNotification(text: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("배송 추적")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    /** 알림 채널 생성 (Android 8.0 이상 필수) */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID,
                "Tracking",
                NotificationManager.IMPORTANCE_LOW
            )
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(ch)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}