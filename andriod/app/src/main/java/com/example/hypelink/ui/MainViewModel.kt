package com.example.hypelink.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.hypelink.data.model.DeliveryPoint
import com.example.hypelink.data.model.DeliveryStatus
import com.example.hypelink.data.reomote.ApiClient
import com.example.hypelink.util.Geo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {

    private val _deliveries = MutableStateFlow<List<DeliveryPoint>>(emptyList())
    val deliveries: StateFlow<List<DeliveryPoint>> = _deliveries

    fun loadDeliveries(driverId: String) {
        viewModelScope.launch {
            runCatching {
                ApiClient.api.fetchTodayDeliveries(driverId)
            }.onSuccess { list ->
                _deliveries.value = list
            }.onFailure {
                // TODO: 에러 처리
            }
        }
    }

    fun markNearestAsDone(currentLat: Double, currentLng: Double): DeliveryPoint? {
        val pending = _deliveries.value.filter { it.status == DeliveryStatus.PENDING }
        val target = pending.minByOrNull { Geo.distanceMeters(currentLat, currentLng, it.lat, it.lng) }
        target?.let {
            it.status = DeliveryStatus.DONE
            _deliveries.value = _deliveries.value.toList() // 갱신 트리거
        }
        return target
    }

    fun allDone(): Boolean = _deliveries.value.all { it.status == DeliveryStatus.DONE }
}