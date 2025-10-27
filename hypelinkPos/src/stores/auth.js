import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '@/api/auth'
import { setAuthHeader, clearAuthHeader } from '@/plugins/axiosinterceptors'
import router from '@/router'
import { getEmailFromToken, getRoleFromToken } from '@/utils/jwtUtils'

export const useAuthStore = defineStore('auth', () => {
  // State - Access token은 메모리에 저장. Refresh token은 secure HttpOnly cookie에 저장.
  const user = ref(null)
  const accessToken = ref(null)
  const storeInfo = ref(null)

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
    setAuthHeader(newAccessToken);
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

      // 응답에서 accessToken과 사용자 정보 추출
      // refreshToken은 HttpOnly 쿠키로 자동 설정됨
      const { accessToken: newAccessToken, id, name, role } = data;

      accessToken.value = newAccessToken;
      user.value = { id, name, role };
      setAuthHeader(newAccessToken);

      // Store 정보 조회
      await fetchStoreInfo();

      return true;
    } else {
      const errorMessage = data.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Store 정보 조회 및 user 정보 설정
   */
  async function fetchStoreInfo() {
    try {
      const response = await authApi.getMyStore();
      if (response.success) {
        storeInfo.value = response.data;
        console.log('[Store Info] Loaded:', storeInfo.value);

        // accessToken에서 email 추출
        if (accessToken.value) {
          const email = getEmailFromToken(accessToken.value);
          const role = getRoleFromToken(accessToken.value);

          // posDevices에서 현재 로그인한 사용자의 POS 찾기
          const myPos = storeInfo.value.posDevices?.find(pos => pos.email === email);

          if (myPos) {
            // user 정보 설정
            user.value = {
              id: myPos.id,
              name: myPos.name,
              email: myPos.email,
              role: role
            };
            console.log('[User Info] Restored from Store:', user.value);
          }
        }
      }
    } catch (error) {
      console.error('[Store Info] Failed to load:', error);
    }
  }

  /**
   * 로그아웃
   */
  async function logout() {
    try {
      const response = await authApi.logoutUser();
      if (!response.success) {
        console.error("Logout API call failed:", response.message);
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // 로컬 상태 초기화
      accessToken.value = null;
      user.value = null;
      storeInfo.value = null;
      clearAuthHeader();

      // 로그인 페이지로 이동
      await router.push('/login');
    }
  }

  /**
   * 인증 확인 (앱 시작 시 자동 세션 복원용)
   */
  async function checkAuth() {
    // accessToken이 이미 있으면 인증됨
    if (accessToken.value) {
      return true;
    }

    // accessToken이 없으면 refreshToken으로 재발급 시도
    try {
      const response = await authApi.reissueToken();
      if (response.success) {
        setNewAccessToken(response.accessToken);
        // 사용자 정보는 토큰에서 추출할 수 없으므로 Store 정보 조회로 확인
        await fetchStoreInfo();
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
    storeInfo,

    // Getters
    isAuthenticated,
    currentUser,
    isPOSMember,

    // Actions
    login,
    logout,
    checkAuth,
    setNewAccessToken,
    fetchStoreInfo
  }
})
