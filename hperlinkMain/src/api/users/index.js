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

// Fetches the list of all stores, each with their nested POS devices
export const getStoresWithPos = async () => {
    try {
        const response = await api.get('/api/member/storepos/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

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

export const getMessageUsers = async () => {
    try {
        const response = await api.get('/api/member/messageuser/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoresList = async () => {
    try {
        const response = await api.get('/api/member/store/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getMyStore = async () => {
    try {
        const response = await api.get('/api/member/mystore/read');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoreById = async (id) => {
    try {
        const response = await api.get(`/api/member/otherstore/read/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoreInfoForEdit = async (id) => {
    try {
        const response = await api.get(`/api/member/storeinfo/read/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const updateStoreInfo = async (id, dto) => {
    try {
        const response = await api.patch(`/api/member/store/${id}`, dto);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export default {
    getDrivers,
    getStoresWithPos,
    getUsers,
    getMessageUsers,
    getStoresList,
    getMyStore,
    getStoreById,
    getStoreInfoForEdit,
    updateStoreInfo,
};