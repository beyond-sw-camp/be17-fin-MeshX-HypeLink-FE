import axios from "axios"
import { tokenManager } from "@/utils/tokenManager"

const api = axios.create({
    baseURL: '',
    timeout: 5000
});

// 요청 인터셉터: 모든 요청에 대해 토큰을 확인하고 헤더에 추가합니다.
api.interceptors.request.use(
    async (config) => {
        // Pinia 스토어는 setup 컨텍스트 밖에서 직접 사용할 수 없으므로 동적으로 import 합니다.
        const { useAuthStore } = await import('@/stores/auth');
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        // 토큰이 있으면 Authorization 헤더를 추가합니다.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 401 에러 발생 시 토큰 재발급을 시도합니다.
api.interceptors.response.use(
    (response) => {
        // console.log("응답을 받기 전 실행");
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // 401 에러이고, 재시도 요청이 아닌 경우 토큰 재발급 시도
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // tokenManager를 통해 토큰 재발급
                    const newAccessToken = await tokenManager.refreshAccessToken();

                    // 스토어에 새 토큰 설정 (setAuthHeader는 이제 필요 없음)
                    const { useAuthStore } = await import('@/stores/auth');
                    const authStore = useAuthStore();
                    authStore.setNewAccessToken(newAccessToken);

                    // 원래 요청의 헤더에 새 토큰 설정 후 재시도
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    // 토큰 재발급 실패 시 로그아웃 처리
                    await tokenManager.handleRefreshFailure();
                    return Promise.reject(refreshError);
                }
            }
        } else if (error.request) {
            console.log("응답을 받지 못했습니다:", error.request);
        } else {
            console.log('요청 설정 에러:', error.message);
        }

        return Promise.reject(error);
    }
);


export default api;