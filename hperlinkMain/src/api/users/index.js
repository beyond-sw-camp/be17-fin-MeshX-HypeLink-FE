import api from "@/plugins/axiosinterceptor";

export const getUsers = async () => {
    let data = {};
    await api.get('/api/member/member/list') // 백엔드 컨트롤러 엔드포인트에 맞춰 수정
        .then((response) => {
            data = response.data.data; // 성공 시 BaseResponse의 data 필드
            data.success = true; // 성공 플래그 추가
        })
        .catch((error) => {
            data = error.response?.data || {message: '네트워크 오류 또는 서버 응답 없음'};
            data.success = false;
        });
    return data;
};

export default {
    getUsers
};
