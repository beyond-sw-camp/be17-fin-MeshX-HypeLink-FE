<script setup>
import { reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const loginForm = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    // authStore가 이미 토스트 메시지를 처리합니다.
    console.warn('Email and password are required');
    return;
  }

  try {
    await authStore.login(loginForm);
    // Vue의 반응형 상태가 업데이트될 때까지 기다린 후 페이지 이동
    await nextTick();
    if (authStore.isLoggedIn) {
      router.push('/');
    }
  } catch (error) {
    // authStore에서 이미 에러 토스트를 표시하므로, 여기서는 콘솔에만 기록합니다.
    console.error('Login failed from component:', error.message);
  }
};
</script>

<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <BaseCard style="width: 400px;">
      <template #header><h5>HypeLink 통합 관리 시스템</h5></template>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">이메일</label>
          <input type="email" class="form-control" id="email" v-model="loginForm.email">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">비밀번호</label>
          <input type="password" class="form-control" id="password" v-model="loginForm.password">
        </div>
        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary">로그인</button>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.vh-100 {
  height: 100vh;
}
</style>