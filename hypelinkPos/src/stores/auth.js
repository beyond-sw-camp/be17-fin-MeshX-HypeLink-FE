import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '@/api/auth'
// import { setAuthHeader, clearAuthHeader } from '@/plugins/axiosinterceptors' // 더 이상 필요 없음
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State - sessionStorage에서 사용자 정보를 복원.
  const user = ref(JSON.parse(sessionStorage.getItem('user')) || null)
  const accessToken = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser = computed(() => user.value)
  const isPOSMember = computed(() => user.value?.role === 'POS_MEMBER')

  /**
   * 새로운 access token을 설정합니다.
   * @param {string} newAccessToken - 새로운 access token
   */
  function setNewAccessToken(newAccessToken) {
    console.log('[Token Refresh] New Access Token Issued.');
    accessToken.value = newAccessToken;
    // setAuthHeader(newAccessToken); // Interceptor가 처리하므로 삭제
  }


  /**
   * 로그인
   * @param {object} credentials - 사용자 인증 정보 { email, password }
   */
  async function login(credentials) {
    const data = await authApi.loginUser(credentials);

    if (data.success) {
      // POS_MEMBER만 로그인 허용
      if (data.role !== 'POS_MEMBER') {
        throw new Error('POS 시스템은 POS 직원만 접근 가능합니다.');
      }

      const { accessToken: newAccessToken, id, name, role } = data;

      accessToken.value = newAccessToken;
      user.value = { id, name, role };
      sessionStorage.setItem('user', JSON.stringify(user.value));
      // setAuthHeader(newAccessToken); // Interceptor가 처리하므로 삭제

      return true;
    } else {
      const errorMessage = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * 로그아웃
   */
  async function logout() {
    try {
      await authApi.logoutUser();
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // 로컬 상태 및 sessionStorage 초기화
      sessionStorage.removeItem('user');
      accessToken.value = null;
      user.value = null;
      // clearAuthHeader(); // Interceptor가 처리하므로 삭제

      await router.push('/login');
    }
  }

  /**
   * 인증 확인 (앱 시작 시 자동 세션 복원용)
   */
  async function checkAuth() {
    if (accessToken.value) {
      return true;
    }

    try {
      const response = await authApi.reissueToken();
      if (response.success) {
        setNewAccessToken(response.accessToken);
        return true;
      }
    } catch (error) {
      console.log('세션 복원 실패:', error);
    }

    return false;
  }

  return {
    // State
    user,
    accessToken,

    // Getters
    isAuthenticated,
    currentUser,
    isPOSMember,

    // Actions
    login,
    logout,
    checkAuth,
    setNewAccessToken
  }
})
