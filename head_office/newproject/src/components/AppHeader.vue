<template>
  <header class="app-header d-flex justify-content-between align-items-center">
    <!-- 왼쪽: 햄버거 버튼 + 페이지 제목 -->
    <div class="d-flex align-items-center">
      <button @click="uiStore.toggleSidebar" class="btn btn-light me-3 d-flex align-items-center justify-content-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
      <h5 class="mb-0">{{ pageTitle }}</h5>
    </div>

    <!-- 오른쪽 사용자 메뉴 -->
    <div class="d-flex align-items-center">
      <!-- 홈 버튼 -->
      <router-link to="/" class="me-3 text-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
          <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
        </svg>
      </router-link>

      <!-- 알림 버튼 -->
      <div class="me-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
        </svg>
      </div>

      <!-- 드롭다운 메뉴 -->
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-decoration-none text-dark" data-bs-toggle="dropdown" aria-expanded="false">
          <svg width="36" height="36" viewBox="0 0 36 36" class="rounded-circle me-2">
            <rect width="100%" height="100%" :fill="authStore.isLoggedIn ? '#0d6efd' : '#6c757d'"></rect>
            <text x="50%" y="50%" fill="white" font-size="16" font-weight="bold" text-anchor="middle" dy=".3em">{{ authStore.user?.name?.charAt(0) || 'L' }}</text>
          </svg>
          <span>{{ authStore.isLoggedIn ? authStore.user.name : '로그인' }}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <template v-if="authStore.isLoggedIn">
            <li v-if="authStore.isStoreOwner"><router-link to="/my-store" class="dropdown-item">내 점포 보기</router-link></li>
            <li><a class="dropdown-item" href="#">계정 설정</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" @click="authStore.logout()">로그아웃</a></li>
          </template>
          <template v-else>
            <li><a class="dropdown-item" @click="authStore.login('admin')">관리자로 로그인</a></li>
            <li><a class="dropdown-item" @click="authStore.login('store_owner')">점주로 로그인</a></li>
          </template>
        </ul>
      </div>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  const name = route.name || 'dashboard';
  if (name === 'my-store') return '내 점포';
  if (name === 'customer-analytics') return '고객 분석';
  if (name === 'tracking') return '배송 추적';
  if (name === 'communication') return '공지/소통';
  if (name === 'stores') return '매장 관리';
  if (name === 'inventory') return '재고 관리';
  if (name === 'sales') return '매출 관리';
  if (name === 'users') return '사용자 관리';
  return name.charAt(0).toUpperCase() + name.slice(1);
});
</script>

<style scoped lang="scss">
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  height: 70px; // 헤더 높이 고정
}

.btn-light {
  width: 40px;
  height: 40px;
}

.dropdown-item {
  cursor: pointer;
}
</style>