import api from "@/plugins/axiosinterceptor";

export const getDrivers = async () => {
    try {
        const response = await api.get('/api/member/driver/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export default {
    getDrivers,
};
