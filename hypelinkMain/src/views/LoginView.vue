<script setup>
import { reactive, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';
import { loadSlim } from "tsparticles-slim";

const authStore = useAuthStore();
const router = useRouter();

const loginForm = reactive({
  email: '',
  password: '',
});

const showAccountModal = ref(false);
const copyMessage = ref('');

// 계정 정보
const accounts = {
  '본사': ['hq@company.com'],
  '서브 관리자': ['manager@hypelink.com'],
  '강남 가맹점': ['gangnam@hypelink.com'],
  '홍대 가맹점': ['hongdae@hypelink.com'],
  '잠실 가맹점': ['jamsil@hypelink.com'],
  '분당 가맹점': ['bundang@hypelink.com'],
  '인천 가맹점': ['incheon@hypelink.com'],
  '부산 서면 가맹점': ['busan.seomyeon@hypelink.com'],
  '대구 동성로 가맹점': ['daegu.dongseongro@hypelink.com'],
  '광주 충장로 가맹점': ['gwangju.chungjangro@hypelink.com'],
  '대전 둔산 가맹점': ['daejeon.dunsan@hypelink.com'],
  '제주 가맹점': ['jeju@hypelink.com']
};

const PASSWORD = '1234';

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    console.warn('Email and password are required');
    return;
  }

  try {
    await authStore.login(loginForm);
    await nextTick();
    if (authStore.isLoggedIn) {
      router.push('/');
    }
  } catch (error) {
    console.error('Login failed from component:', error.message);
  }
};

const toggleAccountModal = () => {
  showAccountModal.value = !showAccountModal.value;
};

const copyToClipboard = async (text, type) => {
  try {
    await navigator.clipboard.writeText(text);
    copyMessage.value = `${type} 복사 완료!`;
    setTimeout(() => {
      copyMessage.value = '';
    }, 2000);
  } catch (err) {
    console.error('복사 실패:', err);
    copyMessage.value = '복사 실패';
    setTimeout(() => {
      copyMessage.value = '';
    }, 2000);
  }
};

// Particle Animation Options
const particlesInit = async engine => {
  await loadSlim(engine);
};

const particlesOptions = ref({
  background: {
    color: {
      value: '#f8f9fa'
    }
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab'
      }
    },
    modes: {
      grab: {
        distance: 150,
        links: {
          opacity: 0.5
        }
      }
    }
  },
  particles: {
    color: {
      value: '#6c757d'
    },
    links: {
      color: '#adb5bd',
      distance: 150,
      enable: true,
      opacity: 0.6,
      width: 1
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce'
      },
      random: true,
      speed: 1,
      straight: false
    },
    number: {
      density: {
        enable: true,
        area: 800
      },
      value: 60
    },
    opacity: {
      value: 0.5
    },
    shape: {
      type: 'circle'
    },
    size: {
      value: { min: 1, max: 3 }
    }
  },
  detectRetina: true
});
</script>

<template>
  <div class="login-page-container d-flex align-items-center justify-content-center">
    <Particles
        id="tsparticles-login"
        class="particles-canvas"
        :particlesInit="particlesInit"
        :options="particlesOptions"
    />
    <div class="login-box text-center">
      <BaseCard class="login-card">
        <template #header><h5>HypeLink 통합 관리 시스템</h5></template>
        <div class="card-body p-4">
          <form @submit.prevent="handleLogin" class="text-start">
            <div class="mb-3">
              <label for="email" class="form-label">이메일</label>
              <input type="email" class="form-control" id="email" v-model="loginForm.email">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">비밀번호</label>
              <input type="password" class="form-control" id="password" v-model="loginForm.password">
            </div>
            <div class="d-grid gap-2 mt-4">
              <button type="submit" class="btn btn-primary">로그인</button>
            </div>
          </form>
        </div>
      </BaseCard>

      <!-- 테스트 계정 보기 버튼 -->
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
                v-for="(emails, section) in accounts"
                :key="section"
                class="branch-section"
              >
                <h3 class="branch-name">{{ section }}</h3>
                <div class="email-list">
                  <div
                    v-for="(email, index) in emails"
                    :key="email"
                    class="email-item"
                  >
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
.login-page-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.particles-canvas {
  position: fixed; /* Changed to fixed */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Keep z-index 0 for background */
}

.login-box {
  position: absolute; /* Changed to absolute */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center it */
  z-index: 1; /* Bring to foreground */
  width: 100%;
  max-width: 600px;
}

.login-card {
  border: none;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.075);
  background-color: #ffffff;
}

/* 테스트 계정 보기 버튼 */
.account-view-section {
  margin-top: 16px;
  text-align: center;
}

.account-view-btn {
  padding: 12px 28px;
  background: white;
  color: #0d6efd;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.account-view-btn:hover {
  background: #0d6efd;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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
  z-index: 2000;
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
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  justify-content: center;
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
  gap: 20px;
}

.branch-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.branch-name {
  font-size: 16px;
  font-weight: 700;
  color: #0d6efd;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #0d6efd;
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
}

.email-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.copy-btn {
  background: #0d6efd;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #0b5ed7;
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
