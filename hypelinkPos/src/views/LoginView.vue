<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const showAccountModal = ref(false)
const copyMessage = ref('')

// 지점별 계정 정보
const accounts = {
  '강남': [
    'pos.gangnam.01@hypelink.com',
    'pos.gangnam.02@hypelink.com',
    'pos.gangnam.03@hypelink.com'
  ],
  '홍대': [
    'pos.hongdae.01@hypelink.com',
    'pos.hongdae.02@hypelink.com',
    'pos.hongdae.03@hypelink.com'
  ],
  '잠실': [
    'pos.jamsil.01@hypelink.com',
    'pos.jamsil.02@hypelink.com',
    'pos.jamsil.03@hypelink.com',
    'pos.jamsil.04@hypelink.com',
    'pos.jamsil.05@hypelink.com'
  ],
  '분당': [
    'pos.bundang.01@hypelink.com',
    'pos.bundang.02@hypelink.com',
    'pos.bundang.03@hypelink.com'
  ],
  '인천': [
    'pos.incheon.01@hypelink.com',
    'pos.incheon.02@hypelink.com',
    'pos.incheon.03@hypelink.com'
  ],
  '부산 서면': [
    'pos.busan.seomyeon.01@hypelink.com',
    'pos.busan.seomyeon.02@hypelink.com',
    'pos.busan.seomyeon.03@hypelink.com',
    'pos.busan.seomyeon.04@hypelink.com',
    'pos.busan.seomyeon.05@hypelink.com'
  ],
  '대구 동성로': [
    'pos.daegu.dongseongro.01@hypelink.com',
    'pos.daegu.dongseongro.02@hypelink.com',
    'pos.daegu.dongseongro.03@hypelink.com',
    'pos.daegu.dongseongro.04@hypelink.com',
    'pos.daegu.dongseongro.05@hypelink.com'
  ],
  '광주 충장로': [
    'pos.gwangju.chungjangro.01@hypelink.com',
    'pos.gwangju.chungjangro.02@hypelink.com',
    'pos.gwangju.chungjangro.03@hypelink.com'
  ],
  '대전 둔산': [
    'pos.daejeon.dunsan.01@hypelink.com',
    'pos.daejeon.dunsan.02@hypelink.com',
    'pos.daejeon.dunsan.03@hypelink.com',
    'pos.daejeon.dunsan.04@hypelink.com'
  ],
  '제주': [
    'pos.jeju.01@hypelink.com',
    'pos.jeju.02@hypelink.com',
    'pos.jeju.03@hypelink.com',
    'pos.jeju.04@hypelink.com'
  ]
}

const PASSWORD = '1234'

const handleLogin = async () => {
  errorMessage.value = ''

  if (!loginForm.value.email) {
    errorMessage.value = '이메일을 입력해주세요.'
    return
  }
  if (!loginForm.value.password) {
    errorMessage.value = '비밀번호를 입력해주세요.'
    return
  }

  isLoading.value = true

  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })

    // 로그인 성공
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '로그인에 실패했습니다.'
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

const toggleAccountModal = () => {
  showAccountModal.value = !showAccountModal.value
}

const copyToClipboard = async (text, type) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = `${type} 복사 완료!`
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('복사 실패:', err)
    copyMessage.value = '복사 실패'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1 class="logo">HypeLink POS V2</h1>
          <p class="subtitle">지점 관리 시스템</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label>이메일</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="이메일을 입력하세요"
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

      <!-- 테스트 계정 보기 버튼 - 로그인 박스 아래 배치 -->
      <div class="account-view-section">
        <button
          type="button"
          class="account-view-btn"
          @click="toggleAccountModal"
        >
          테스트 계정 보기
        </button>
      </div>
    </div>

    <!-- 계정 정보 모달 -->
    <transition name="modal">
      <div v-if="showAccountModal" class="modal-overlay" @click="toggleAccountModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>테스트 계정 정보</h2>
            <button class="close-btn" @click="toggleAccountModal">×</button>
          </div>

          <div v-if="copyMessage" class="copy-message">
            {{ copyMessage }}
          </div>

          <div class="modal-body">
            <div class="password-info">
              <div class="info-row">
                <span class="info-label">비밀번호:</span>
                <span class="info-value">{{ PASSWORD }}</span>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(PASSWORD, '비밀번호')"
                  title="비밀번호 복사"
                >
                  📋
                </button>
              </div>
              <p class="password-note">모든 계정의 비밀번호는 같습니다</p>
            </div>

            <div class="accounts-list">
              <div
                v-for="(emails, branch) in accounts"
                :key="branch"
                class="branch-section"
              >
                <h3 class="branch-name">{{ branch }} 지점</h3>
                <div class="email-list">
                  <div
                    v-for="(email, index) in emails"
                    :key="email"
                    class="email-item"
                  >
                    <span class="email-number">{{ index + 1 }}.</span>
                    <span class="email-text">{{ email }}</span>
                    <button
                      class="copy-btn"
                      @click="copyToClipboard(email, '이메일')"
                      title="이메일 복사"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
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

/* 계정 보기 버튼 섹션 - 로그인 박스 아래 배치 */
.account-view-section {
  margin-top: 20px;
  text-align: center;
}

.account-view-btn {
  padding: 14px 32px;
  background: white;
  color: #667eea;
  border: 3px solid white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.account-view-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.login-form {
  margin-bottom: 24px;
}

.error-message {
  padding: 12px 16px;
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.copy-message {
  padding: 12px 24px;
  background: #d4edda;
  color: #155724;
  border-bottom: 1px solid #c3e6cb;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.password-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.password-note {
  margin: 12px 0 0 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

.info-label {
  font-size: 15px;
  font-weight: 600;
  color: #555;
}

.info-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  font-family: 'Courier New', monospace;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.branch-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.branch-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.email-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.email-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 100, 255, 0.1);
}

.email-number {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  min-width: 24px;
}

.email-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.copy-btn {
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #0052CC;
  transform: scale(1.1);
}

.copy-btn:active {
  transform: scale(0.95);
}

/* 모달 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 반응형 */
@media (max-width: 640px) {
  .modal-content {
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .email-text {
    font-size: 12px;
  }
}
</style>