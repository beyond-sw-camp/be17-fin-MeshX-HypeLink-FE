<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  if (!loginForm.value.username) {
    alert('아이디를 입력해주세요.')
    return
  }
  if (!loginForm.value.password) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  isLoading.value = true

  // 임시 로그인 로직 (나중에 API로 교체)
  setTimeout(() => {
    const success = authStore.login(loginForm.value.username, loginForm.value.password)

    if (success) {
      router.push('/')
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.')
    }

    isLoading.value = false
  }, 500)
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1 class="logo">HypeLink POS</h1>
          <p class="subtitle">지점 관리 시스템</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label>지점 아이디</label>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="지점 아이디를 입력하세요"
              @keypress="handleKeyPress"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label>비밀번호</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              @keypress="handleKeyPress"
              :disabled="isLoading"
            />
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="login-footer">
          <p class="help-text">문의: support@hypelink.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-box {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.1);
}

.form-group input:disabled {
  background: var(--bg-gray);
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #0052CC;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 100, 255, 0.3);
}

.login-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.help-text {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>