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
    </div>
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
</style>
