package com.example.hypelink.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.hypelink.MainActivity
import com.example.hypelink.databinding.ActivityLoginBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

// 요청/응답 DTO
data class LoginRequest(val username: String, val password: String)
data class LoginResponse(val token: String)

// Retrofit API
interface AuthApi {
    @POST("/auth/login")
    suspend fun login(@Body req: LoginRequest): LoginResponse
}

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private val api: AuthApi by lazy {
        Retrofit.Builder()
            // ❌ 여기서 localhost:8080 은 안드로이드 기기에서 직접 접근 불가
            // 실제로 서버 연결하려면 PC의 IP주소나 10.0.2.2 로 바꿔야 함
            .baseUrl("http://127.0.0.1:8080/login")
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnLogin.setOnClickListener {
            // ✅ 개발 모드: API 호출 생략
            // 그냥 토큰을 더미값으로 저장하고 MainActivity로 이동
            getSharedPreferences("app", MODE_PRIVATE)
                .edit().putString("token", "DUMMY_TOKEN").apply()

            startActivity(Intent(this@LoginActivity, MainActivity::class.java))
            finish()
        }
// 로그인 구현 후 사용할 코드
//        binding.btnLogin.setOnClickListener {
//            val id = binding.etId.text.toString()
//            val pw = binding.etPw.text.toString()
//
//            CoroutineScope(Dispatchers.IO).launch {
//                runCatching {
//                    api.login(LoginRequest(id, pw))
//                }.onSuccess { res ->
//                    // 로그인 성공 → 토큰 저장 → MainActivity로 이동
//                    getSharedPreferences("app", MODE_PRIVATE)
//                        .edit().putString("token", res.token).apply()
//
//                    runOnUiThread {
//                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
//                        finish()
//                    }
//                }.onFailure {
//                    runOnUiThread {
//                        Toast.makeText(this@LoginActivity, "로그인 실패", Toast.LENGTH_SHORT).show()
//                    }
//                }
//            }
//        }
    }
}