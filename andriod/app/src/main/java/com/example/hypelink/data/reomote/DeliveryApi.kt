package com.example.hypelink.data.reomote

import com.example.hypelink.data.model.DeliveryPoint
import retrofit2.http.GET
import retrofit2.http.Query

interface DeliveryApi {
    // 예: GET /deliveries/today?driverId=abc
    @GET("/deliveries/today")
    suspend fun fetchTodayDeliveries(
        @Query("driverId") driverId: String
    ): List<DeliveryPoint>
}