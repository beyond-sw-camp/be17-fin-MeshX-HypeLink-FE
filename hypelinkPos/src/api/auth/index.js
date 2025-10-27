import api from "@/plugins/axiosinterceptors";
import axios from "axios";

export const loginUser = async (credentials) => {
  let data = {};
  await api.post('/api/auth/login', credentials)
    .then((response) => {
      data = response.data.data; // 성공 시 BaseResponse의 data 필드
      data.success = true; // 성공 플래그 추가
    })
    .catch((error) => {
      data = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
      data.success = false; // 실패 플래그 추가
    });
  return data;
};

export const reissueToken = async () => {
  try {
    // HttpOnly 쿠키를 보내기 위해 withCredentials: true 옵션을 사용합니다.
    const response = await axios.post('/api/auth/reissue', {}, {
      withCredentials: true
    });
    // 백엔드 응답에서 accessToken을 직접적으로 사용합니다.
    return { success: true, accessToken: response.data.accessToken };
  } catch (error) {
    console.error("Token reissue failed:", error);
    return { success: false, message: error.response?.data?.message || '토큰 재발급 실패' };
  }
};

export const logoutUser = async () => {
  let data = {};
  await api.post('/api/auth/logout')
    .then((response) => {
      data = response.data;
      data.success = true;
    })
    .catch((error) => {
      data = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
      data.success = false;
    });
  return data;
};

// Store 정보 조회 API
export const getMyStore = async () => {
  try {
    const response = await api.get('/api/member/mystore/read');
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Store info fetch failed:", error);
    return { success: false, message: error.response?.data?.message || 'Store 정보 조회 실패' };
  }
};

export default {
    loginUser,
    reissueToken,
    logoutUser,
    getMyStore,
};
