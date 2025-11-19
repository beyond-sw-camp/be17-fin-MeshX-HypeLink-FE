<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AdminDashboard from './dashboard/AdminDashboard.vue';
import StoreOwnerDashboard from './dashboard/StoreOwnerDashboard.vue';
import BaseCard from '@/components/BaseCard.vue';
import { loadSlim } from "tsparticles-slim";

const authStore = useAuthStore();

const particlesInit = async engine => {
  await loadSlim(engine);
};

const particlesOptions = ref({
  background: {
    color: {
      value: 'transparent' // 배경색을 투명으로 변경
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
      value: '#6c757d' // Darker gray for particles
    },
    links: {
      color: '#adb5bd', // Darker gray for links
      distance: 150,
      enable: true,
      opacity: 0.6, // Increased opacity
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
  <div>
    <!-- Logged-in user dashboards -->
    <AdminDashboard v-if="authStore.isAdmin || authStore.isManager" />
    <StoreOwnerDashboard v-else-if="authStore.isBranchManager" />

    <!-- Logged-out User View: Network Particles Background -->
    <div v-else class="logged-out-container">
      <Particles
          id="tsparticles"
          class="particles-canvas"
          :particlesInit="particlesInit"
          :options="particlesOptions"
      />
      <div class="login-box text-center">
        <BaseCard class="login-card">
          <div class="card-body p-4 p-sm-5 text-start">
            <!-- SVG Logo -->
            <svg class="mb-3" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="32" r="14" stroke="#0D6EFD" stroke-width="4"/>
              <circle cx="40" cy="32" r="14" stroke="#0D6EFD" stroke-width="4"/>
            </svg>

            <h2 class="fw-normal mb-2">HypeLink</h2>
            <p class="text-muted mb-4">통합 매장 관리 시스템</p>

            <p>업무를 시작하려면 로그인하세요.</p>
            <router-link to="/login" class="btn btn-primary w-100 mt-4">
              로그인
            </router-link>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logged-out-container {
  position: relative;
  min-height: 100vh; /* Ensure it takes full height */
  overflow: hidden;
}

.particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Send to background */
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