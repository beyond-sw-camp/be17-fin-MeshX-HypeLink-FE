import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToastStore } from '@/stores/toast';
import authApi from '@/api/auth';
import { setAuthHeader, clearAuthHeader } from '@/plugins/axiosinterceptor';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State - Access token is stored in memory. Refresh token is in a secure HttpOnly cookie.
  const user = ref(null);
  const accessToken = ref(null);

  const toastStore = useToastStore();

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isManager = computed(() => user.value?.role === 'MANAGER');
  const isBranchManager = computed(() => user.value?.role === 'BRANCH_MANAGER');
  const isStoreOwner = computed(() => user.value?.role === 'MANAGER' || user.value?.role === 'BRANCH_MANAGER');

  // Actions

  /**
   * Sets a new access token.
   * @param {string} newAccessToken - The new access token.
   */
  function setNewAccessToken(newAccessToken) {
    accessToken.value = newAccessToken;
    setAuthHeader(newAccessToken);
  }

  /**
   * Logs in the user, stores the access token.
   * @param {object} credentials - User credentials { email, password }.
   */
  async function login(credentials) {
    const data = await authApi.loginUser(credentials);

    if (data.success) {
      if (data.role === 'POS_MEMBER' || data.role === 'DRIVER') {
        toastStore.showToast('이 시스템에 접근할 권한이 없습니다.', 'error');
        throw new Error('접근 권한이 없는 역할입니다.');
      }

      // The response body contains the access token and user info.
      // The refresh token is handled by a secure cookie.
      const { accessToken: newAccessToken, id, name, role } = data; // Extract id
      
      accessToken.value = newAccessToken;
      user.value = { id, name, role }; // Store id
      setAuthHeader(newAccessToken);
      
      toastStore.showToast('로그인에 성공했습니다.', 'success');
    } else {
      const errorMessage = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      toastStore.showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  }

  /**
   * Logs out the user by calling the API, clearing local state, and redirecting to home.
   */
  async function logout() {
    const currentToken = accessToken.value; // 로그아웃 전에 현재 토큰 저장

    try {
      const response = await authApi.logoutUser(currentToken);
      if (!response.success) {
        // Log an error if the API call fails, but still proceed with local logout
        console.error("Logout API call failed:", response.message);
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // Ensure local state is always cleared
      accessToken.value = null;
      user.value = null;
      clearAuthHeader();

      toastStore.showToast('로그아웃 되었습니다.', 'info');

      // Redirect to the login page
      await router.push('/');
    }
  }

  return { 
    user, 
    accessToken, 
    isLoggedIn, 
    isAdmin, 
    isManager, 
    isBranchManager, 
    isStoreOwner,
    login, 
    logout, 
    setNewAccessToken 
  };
});