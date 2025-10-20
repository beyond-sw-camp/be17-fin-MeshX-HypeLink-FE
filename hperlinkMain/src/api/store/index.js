import api from "@/plugins/axiosinterceptor";

// Fetches the list of all stores, each with their nested POS devices
export const getStoresWithPos = async () => {
    try {
        const response = await api.get('/api/member/store/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export default {
    getStoresWithPos,
};
