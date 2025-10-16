package com.example.hypelink.ws

import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import io.reactivex.disposables.Disposable
import ua.naiksoftware.stomp.Stomp
import ua.naiksoftware.stomp.StompClient

/**
 * STOMP(WebSocket) 연결 관리 클래스
 * - 연결 / 끊김 / 전송 로직만 포함
 */
object StompManager {
    private var stompClient: StompClient? = null
    private var connectionDisposable: Disposable? = null

    fun connect(
        url: String,
        onConnected: () -> Unit,
        onDisconnected: () -> Unit
    ) {
        stompClient = Stomp.over(Stomp.ConnectionProvider.OKHTTP, url)
        stompClient?.withClientHeartbeat(10000)?.withServerHeartbeat(10000)

        connectionDisposable = stompClient?.lifecycle()?.subscribe { event ->
            Log.d("STOMP", "Event: ${event.type}")
            when (event.type.name) {
                "OPENED" -> onConnected()
                "CLOSED", "ERROR" -> onDisconnected()
            }
        }

        stompClient?.connect()
    }

    fun sendLocation(driverId: String, lat: Double, lng: Double) {
        val client = stompClient
        if (client == null || !client.isConnected) {
            Log.w("STOMP", "sendLocation skipped: stompClient is null or disconnected")
            return
        }
        val payload = """{"driverId":"$driverId","lat":$lat,"lng":$lng}"""
        stompClient?.send("/hypelink/gps", payload)?.subscribe()
    }

    fun sendDeliveryComplete(driverId: String, lat: Double, lng: Double, pointId: String) {
        val payload = """{"driverId":"$driverId","lat":$lat,"lng":$lng,"pointId":"$pointId"}"""
        stompClient?.send("/hypelink/delivery-complete", payload)?.subscribe()
    }

    fun disconnect() {
        try {
            stompClient?.let {
                if (it.isConnected) {
                    it.disconnect()
                    Log.d("STOMP", "disconnect called")
                }
            }
        } catch (e: Exception) {
            Log.e("STOMP", "disconnect error: ${e.message}")
        } finally {
            connectionDisposable?.dispose()
            connectionDisposable = null
            stompClient = null
            Log.d("STOMP", "stompClient reference cleared")
        }
    }
}
