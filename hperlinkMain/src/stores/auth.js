import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToastStore } from '@/stores/toast';
import authApi from '@/api/auth';
import { setAuthHeader, clearAuthHeader } from '@/plugins/axiosinterceptor';

export const useAuthStore = defineStore('auth', () => {
  // State - localStorage 사용 제거, 항상 null에서 시작
  const user = ref(null);
  const token = ref(null);

  const toastStore = useToastStore();

  // Getters
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isManager = computed(() => user.value?.role === 'MANAGER');
  const isBranchManager = computed(() => user.value?.role === 'BRANCH_MANAGER');

  // Actions
  async function login(credentials) {
    const data = await authApi.loginUser(credentials);

    if (data.success) {
      // 역할(role)에 따른 로그인 제한
      if (data.role === 'POS_MEMBER' || data.role === 'DRIVER') {
        toastStore.showToast('이 시스템에 접근할 권한이 없습니다.', 'error');
        throw new Error('접근 권한이 없는 역할입니다.');
      }

      const accessToken = data.accessToken;
      const userData = { name: data.name, role: data.role };

      // 메모리에만 토큰과 사용자 정보 저장
      token.value = accessToken;
      user.value = userData;

      // API 클라이언트 헤더에 인증 토큰 설정
      setAuthHeader(accessToken);
      
      toastStore.showToast('로그인에 성공했습니다.', 'success');
    } else {
      const errorMessage = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      toastStore.showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  }

  function logout() {
    // 메모리의 토큰과 사용자 정보만 제거
    token.value = null;
    user.value = null;
    
    // API 클라이언트 헤더에서 인증 토큰 제거
    clearAuthHeader();
    
    toastStore.showToast('로그아웃 되었습니다.', 'info');
  }

  function setNewAccessToken(newAccessToken) {
    console.log('[Token Refresh] New Access Token Issued:', newAccessToken);
    token.value = newAccessToken;
    setAuthHeader(newAccessToken);
  }

  return { user, token, isLoggedIn, isAdmin, isManager, isBranchManager, login, logout, setNewAccessToken };
});
