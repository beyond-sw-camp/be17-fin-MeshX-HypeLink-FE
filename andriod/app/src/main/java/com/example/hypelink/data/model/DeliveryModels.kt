package com.example.hypelink.data.model

enum class DeliveryStatus { PENDING, DONE }

data class DeliveryPoint(
    val id: String,
    val lat: Double,
    val lng: Double,
    var status: DeliveryStatus = DeliveryStatus.PENDING
)