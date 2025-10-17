import api from "@/plugins/axiosinterceptor";

/**
 * 로그인 API 호출
 * @param {{email: string, password: string}} credentials - 사용자 이메일과 비밀번호
 * @returns {Promise<any>} API 응답 데이터
 */
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

/**
 * AccessToken 재발급 API 호출
 * @returns {Promise<any>} API 응답 데이터
 */
export const reissueToken = async () => {
  const response = await api.post('/api/auth/reissue');
  return response.data; // 재발급 시에는 BaseResponse로 감싸지 않으므로 data 직접 반환
};

export default {
    loginUser,
    reissueToken,
};
