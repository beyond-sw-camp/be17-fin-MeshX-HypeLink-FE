kotlin {
    jvmToolchain(17)  // 또는 21
}

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.hypelink"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.hypelink"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        viewBinding = true
        compose = true
    }
    buildToolsVersion = "36.1.0"
}

dependencies {
    // LocalBroadCast
    implementation(libs.androidx.localbroadcastmanager)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx.v286)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)

    // STOMP WebSocket
    implementation(libs.java.websocket)
    implementation(libs.stompprotocolandroid)
    implementation(libs.rxjava)
    implementation(libs.rxandroid)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    // 위치 (FusedLocationProvider)
    implementation(libs.play.services.location)

    // Retrofit (서버에서 배송 리스트 받기)
    implementation(libs.retrofit)
    implementation(libs.converter.moshi)

    // OkHttp WebSocket
    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp)
    implementation(libs.logging.interceptor)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}