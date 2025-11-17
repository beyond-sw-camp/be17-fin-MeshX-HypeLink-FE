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
    try {
        const response = await api.get('/api/member/member/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoresList = async (page = 0, size = 10, sort = 'id,desc', keyWord = '', status = 'all') => {
    try {
        const response = await api.get('/api/member/store/list', {
            params: { page, size, sort, keyWord, status }
        });
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
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '매장 정보 수정에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const updateUser = async (id, payload) => {
    try {
        const response = await api.patch(`/api/member/user/update/${id}`, payload);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '사용자 정보 수정에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/api/member/user/delete/${id}`);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '사용자 삭제에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const updateStoreState = async (id, dto) => {
    try {
        const response = await api.patch(`/api/member/store/state/${id}`, dto);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '매장 상태 변경에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/api/member/user/read/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const deleteStore = async (id) => {
    try {
        const response = await api.delete(`/api/member/store/delete/${id}`);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '매장 삭제에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const deletePos = async (id) => {
    try {
        const response = await api.delete(`/api/member/pos/delete/${id}`);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || 'POS 삭제에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const deleteDriver = async (id) => {
    try {
        const response = await api.delete(`/api/member/driver/delete/${id}`);
        // 응답에 code가 있고 400이면 에러로 처리
        if (response.data.code && response.data.code !== 200) {
            return {
                success: false,
                message: response.data.message || '기사 삭제에 실패했습니다.'
            };
        }
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoreWithAddress = async () => {
    try {
        const response = await api.get(`/api/member/store/list/address`);
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
    getStoresList,
    getMyStore,
    getStoreById,
    getStoreInfoForEdit,
    updateStoreInfo,
    updateUser,
    deleteUser,
    updateStoreState,
    getUserById,
    deleteStore,
    deletePos,
    deleteDriver,
    getStoreWithAddress,
};