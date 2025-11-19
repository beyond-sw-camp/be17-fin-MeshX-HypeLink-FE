import axios from "axios";
import { reissueToken } from "@/api/auth";

const api = axios.create({
    baseURL: '',
    timeout: 10000
});

/**
 * API 클라이언트의 기본 헤더에 인증 토큰을 설정합니다.
 * @param {string} token - 인증 토큰
 */
export const setAuthHeader = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * API 클라이언트의 기본 헤더에서 인증 토큰을 제거합니다.
 */
export const clearAuthHeader = () => {
  delete api.defaults.headers.common['Authorization'];
};


api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 토큰 재발급 중인지 여부를 나타내는 플래그
let isRefreshing = false;
// 재발급을 기다리는 요청들을 저장하는 배열
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        // 2xx 범위의 상태 코드
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 로그아웃, 재발급 요청은 인터셉터 로직을 적용하지 않음
        if (originalRequest.url?.includes('/api/auth/logout') ||
            originalRequest.url?.includes('/api/auth/reissue')) {
            return Promise.reject(error);
        }

        // 401 에러이고, 재시도 요청이 아닌 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // 토큰이 이미 재발급 중인 경우, 이 요청은 대기열에 추가
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const reissueResponse = await reissueToken();

                if (!reissueResponse.success) {
                    throw new Error(reissueResponse.message || '토큰 재발급 실패');
                }

                const newAccessToken = reissueResponse.accessToken;

                // 순환 참조를 피하기 위해 스토어를 동적으로 import
                const { useAuthStore } = await import('@/stores/auth');
                const authStore = useAuthStore();

                // 스토어와 헤더에 새 토큰 설정
                authStore.setNewAccessToken(newAccessToken);

                // 원래 요청의 헤더 객체가 없으면 생성
                if (!originalRequest.headers) {
                    originalRequest.headers = {};
                }

                // 새 토큰으로 Authorization 헤더 설정
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 대기열에 있던 모든 요청들을 새 토큰으로 재시도
                processQueue(null, newAccessToken);

                // 원래의 요청도 새 토큰으로 재시도
                return api(originalRequest);

            } catch (refreshError) {
                // 토큰 재발급 실패 시, 사용자 로그아웃 처리
                const { useAuthStore } = await import('@/stores/auth');
                const authStore = useAuthStore();
                authStore.logout();
                
                // 대기열에 있던 모든 요청들을 실패 처리
                processQueue(refreshError, null);

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export default api;