import api from "@/plugins/axiosinterceptor";

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
  const response = await api.post('/api/auth/reissue');
  return response.data; // 재발급 시에는 BaseResponse로 감싸지 않으므로 data 직접 반환
};

export default {
    loginUser,
    reissueToken,
    registerUser,
};
