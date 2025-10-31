<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import BaseModal from '@/components/BaseModal.vue';

const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

// State for controlling the logout modal
const showLogoutModal = ref(false);

const pageTitle = computed(() => {
  const name = route.name || 'dashboard';
  
  // 공통 메뉴
  if (name === 'dashboard') return '대시보드';
  if (name === 'announcements') return '공지사항';
  if (name === 'announcement-detail') return '공지사항 상세';
  if (name === 'messenger') return '메신저';
  
  // B2B 관리
  if (name === 'stores') return '전체 매장 관리';
  if (name === 'store-detail') return '점포 상세 정보';
  if (name === 'my-store') return '내 점포 관리';
  if (name === 'pos-management') return 'POS 기기 관리';
  if (name === 'inventory') return '재고 관리';
  if (name === 'sales') return '매출 관리';
  if (name === 'asList') return 'AS/고장 접수';
  if (name === 'asCreate') return 'AS/고장 접수 등록';
  if (name === 'asDetail') return 'AS/고장 접수 상세';
  if (name === 'promotions') return '프로모션 관리';
  if (name === 'promotion-detail') return '프로모션 상세';
  if (name === 'products') return '상품 관리';
  if (name === 'warehouse-inventory') return '창고 재고';
  if (name === 'purchase-orders') return '발주서';
 
  
  // 시스템 관리
  if (name === 'tracking') return '전체 배송 추적';
  if (name === 'customer-analytics') return '고객 분석';
  if (name === 'pos-health') return 'POS 헬스체크';
  if (name === 'drivers') return '드라이버 관리';
  if (name === 'users') return '사용자 관리';
  if (name === 'coupons') return '쿠폰 관리';
  
  // 기타
  if (name === 'communication') return '공지/소통';
  
  return name.charAt(0).toUpperCase() + name.slice(1);
});

// Handles the actual logout process
const handleLogout = () => {
  authStore.logout();
  showLogoutModal.value = false;
};
</script>

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
      <div class="me-3 badge bg-secondary">Role: {{ authStore.user?.role || 'None' }}</div>
      <!-- 홈 버튼 -->
      <router-link to="/" class="me-3 text-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
          <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
        </svg>
      </router-link>

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
            <li><a class="dropdown-item" href="#" @click.prevent="showLogoutModal = true">로그아웃</a></li>
          </template>
          <template v-else>
            <li><router-link to="/login" class="dropdown-item">로그인</router-link></li>
          </template>
        </ul>
      </div>

    </div>
  </header>

  <!-- Logout Confirmation Modal -->
  <BaseModal v-model="showLogoutModal" size="sm">
    <template #header>
      <h5 class="modal-title">로그아웃 확인</h5>
    </template>
    <p>정말로 로그아웃 하시겠습니까?</p>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="showLogoutModal = false">취소</button>
      <button type="button" class="btn btn-primary" @click="handleLogout">로그아웃</button>
    </template>
  </BaseModal>
</template>

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
