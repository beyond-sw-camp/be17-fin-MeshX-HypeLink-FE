package com.example.hypelink

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.Location
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.example.hypelink.databinding.ActivityMainBinding
import com.example.hypelink.location.TrackingService
import com.example.hypelink.ui.MainViewModel
import com.example.hypelink.ws.StompManager
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Header

/**
 * MainActivity
 * - 버튼 제어 (웹소켓 연결 상태에 따라 활성/비활성)
 * - TrackingService가 LocalBroadcast로 보내는 이벤트 수신
 */
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    // STOMP 연결 상태 수신용 Receiver
    private val stompReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val connected = intent?.getBooleanExtra("connected", false) ?: false
            if (connected) {
                binding.btnStart.isEnabled = false
                binding.btnComplete.isEnabled = true
                binding.btnFinish.isEnabled = true
                binding.tvStatus.text = "웹소켓 연결됨"
            } else {
                binding.btnStart.isEnabled = true
                binding.btnComplete.isEnabled = false
                binding.btnFinish.isEnabled = false
                binding.tvStatus.text = "연결 끊김"
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnStart.setOnClickListener { startDelivery() }
        binding.btnComplete.setOnClickListener { completeOne() }
        binding.btnFinish.setOnClickListener { finishAll() }
    }

    /** 배송 시작 버튼 */
    private fun startDelivery() {
        if (!hasLocationPermission()) {
            requestLocationPermissions()
            return
        }

        startForegroundService(Intent(this, TrackingService::class.java).apply {
            action = TrackingService.ACTION_START
            putExtra(TrackingService.EXTRA_DRIVER_ID, "DRIVER_01")
            putExtra(TrackingService.EXTRA_WS_URL, "ws://192.0.190.24:8080/ws")
        })
    }

    /** 배송 완료 버튼 */
    private fun completeOne() {
        if (!hasLocationPermission()) {
            toast("위치 권한이 필요합니다.")
            requestLocationPermissions()
            return
        }

        val fused = LocationServices.getFusedLocationProviderClient(this)

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            toast("위치 권한이 없어 위치를 가져올 수 없습니다.")
            return
        }

        fused.lastLocation.addOnSuccessListener { loc ->
            if (loc != null) {
                val nearestPointId = "DELIV_0001"
                StompManager.sendDeliveryComplete("DRIVER_01", loc.latitude, loc.longitude, nearestPointId)
                toast("배송 완료 전송 (${loc.latitude}, ${loc.longitude})")
                binding.tvStatus.text = "배송 완료 전송 (${loc.latitude}, ${loc.longitude})"
            } else {
                toast("현재 위치를 가져올 수 없습니다.")
            }
        }.addOnFailureListener {
            toast("위치 조회 실패: ${it.message}")
        }
    }

    /** 배송 종료 버튼 */
    private fun finishAll() {
        stopService(Intent(this, TrackingService::class.java).apply {
            action = TrackingService.ACTION_STOP
        })
        toast("배송 종료")

        // ✅ UI 상태 초기화
        binding.btnStart.isEnabled = true
        binding.btnComplete.isEnabled = false
        binding.btnFinish.isEnabled = false
        binding.tvStatus.text = "대기 중"
    }

    /** 위치 권한 확인 */
    private fun hasLocationPermission(): Boolean {
        val fine = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val bg = if (Build.VERSION.SDK_INT >= 29) {
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
        } else true
        return fine && coarse && bg
    }

    private fun requestLocationPermissions() {
        if (Build.VERSION.SDK_INT >= 29) {
            requestBackground.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                100
            )
        }
    }

    private val requestBackground = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (!granted) {
            goToAppSettingsForBackgroundLocation()
        }
    }

    private fun goToAppSettingsForBackgroundLocation() {
        val intent = Intent(
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.fromParts("package", packageName, null)
        )
        startActivity(intent)
        toast("설정 > 권한 > 위치 > '항상 허용'으로 변경해주세요.")
    }

    override fun onResume() {
        super.onResume()
        LocalBroadcastManager.getInstance(this)
            .registerReceiver(stompReceiver, IntentFilter(TrackingService.ACTION_STOMP_EVENT))
    }

    override fun onPause() {
        super.onPause()
        LocalBroadcastManager.getInstance(this).unregisterReceiver(stompReceiver)
    }
}

// 공용 토스트 함수
private fun ComponentActivity.toast(msg: String) =
    Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
