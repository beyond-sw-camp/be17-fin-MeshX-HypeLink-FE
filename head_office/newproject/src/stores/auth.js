import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 'auth' 스토어 정의
export const useAuthStore = defineStore('auth', () => {
  // State: 현재 사용자 정보 (null이면 로그아웃 상태)
  const user = ref(null);

  // Getters: 상태를 기반으로 계산되는 값들
  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isStoreOwner = computed(() => user.value?.role === 'store_owner');

  // Actions: 상태를 변경하는 함수들
  function login(role) {
    if (role === 'admin') {
      user.value = { name: '관리자', role: 'admin' };
    } else if (role === 'store_owner') {
      user.value = { name: '최민성 (강남점)', role: 'store_owner' };
    }
  }

  function logout() {
    user.value = null;
  }

  // 스토어에서 사용할 state, getters, actions를 반환
  return { user, isLoggedIn, isAdmin, isStoreOwner, login, logout };
});