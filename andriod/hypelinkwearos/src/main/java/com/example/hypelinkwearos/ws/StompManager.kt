package com.example.hypelinkwearos.ws

import android.util.Log
import io.reactivex.disposables.Disposable
import ua.naiksoftware.stomp.Stomp
import ua.naiksoftware.stomp.StompClient

object StompManager {
    private var stomp: StompClient? = null
    private var life: Disposable? = null

    fun connect(
        url: String,
        onConnected: () -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            stomp = Stomp.over(Stomp.ConnectionProvider.OKHTTP, url)
            stomp?.withClientHeartbeat(10000)?.withServerHeartbeat(10000)
            life = stomp?.lifecycle()?.subscribe({ e ->
                Log.d("STOMP", "life: ${e.type}")
                if (e.type.name == "OPENED") onConnected()
            }, { t -> onError(t.message ?: "error") })
            stomp?.connect()
        } catch (t: Throwable) {
            onError(t.message ?: "connect error")
        }
    }

    fun sendLocation(lat: Double, lng: Double) {
        val payload = """{"lat":$lat,"lng":$lng}"""
        stomp?.send("/app/location", payload)?.subscribe({}, { /* ignore */ })
    }

    fun sendDeliveryComplete(lat: Double, lng: Double, pointId: String) {
        val payload = """{"lat":$lat,"lng":$lng,"pointId":"$pointId"}"""
        stomp?.send("/app/delivery-complete", payload)?.subscribe({}, { /* ignore */ })
    }

    fun disconnect() {
        try { stomp?.disconnect() } catch (_: Exception) {}
        try { life?.dispose() } catch (_: Exception) {}
        stomp = null
        life = null
    }
}