import api from "@/plugins/axiosinterceptor";
import axios from "axios"; // axios 직접 import

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

 // 회원 가입
 export const registerUser = async (credentials) => {
    try {
        const response = await api.post('/api/auth/register', credentials);
        // On success, return a consistent success object.
        return { success: true, data: response.data.data };
    } catch (error) {
        // On failure, return a consistent error object.
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
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

export default {
    loginUser,
    reissueToken,
    registerUser,
    logoutUser,
};
