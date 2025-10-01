<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const loginForm = reactive({
  username: '',
  password: '',
});

const formSubmitted = ref(false);

const handleLogin = async (role = null) => {
  formSubmitted.value = true;
  if (!loginForm.username || !loginForm.password) {
    toastStore.showToast('아이디와 비밀번호를 입력해주세요.', 'danger');
    return;
  }

  // 실제 백엔드 연동 시에는 이 부분에서 API 호출
  // 현재는 개발용 역할 선택 로그인으로 대체
  if (role) {
    authStore.login(role);
  } else {
    // 일반 로그인 시도 (목업)
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      authStore.login('super_admin');
    } else if (loginForm.username === 'subadmin' && loginForm.password === 'subadmin123') {
      authStore.login('sub_admin');
    } else if (loginForm.username === 'gangnam' && loginForm.password === 'gangnam123') {
      authStore.login('store_manager');
    } else {
      toastStore.showToast('아이디 또는 비밀번호가 올바르지 않습니다.', 'danger');
      return;
    }
  }

  if (authStore.isLoggedIn) {
    toastStore.showToast(`${authStore.user.name}님 환영합니다!`, 'success');
    router.push('/'); // 로그인 성공 시 대시보드로 이동
  }
};
</script>

<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <BaseCard style="width: 400px;">
      <template #header><h5>로그인</h5></template>
      <form @submit.prevent="handleLogin()">
        <div class="mb-3">
          <label for="username" class="form-label">아이디</label>
          <input type="text" class="form-control" id="username" v-model="loginForm.username" :class="{ 'is-invalid': !loginForm.username && formSubmitted }">
          <div class="invalid-feedback">아이디를 입력해주세요.</div>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">비밀번호</label>
          <input type="password" class="form-control" id="password" v-model="loginForm.password" :class="{ 'is-invalid': !loginForm.password && formSubmitted }">
          <div class="invalid-feedback">비밀번호를 입력해주세요.</div>
        </div>
        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary">로그인</button>
        </div>
      </form>
      <hr class="my-4">
      <div class="d-grid gap-2">
        <button class="btn btn-outline-secondary" @click="handleLogin('super_admin')">총괄 관리자로 로그인 (개발용)</button>
        <button class="btn btn-outline-secondary" @click="handleLogin('sub_admin')">부관리자로 로그인 (개발용)</button>
        <button class="btn btn-outline-secondary" @click="handleLogin('store_manager')">지점장으로 로그인 (개발용)</button>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.vh-100 {
  height: 100vh;
}
</style>
