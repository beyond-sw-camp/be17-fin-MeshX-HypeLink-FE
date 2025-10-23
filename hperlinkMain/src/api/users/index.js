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

export const updateUser = async (id, payload) => {
    try {
        const response = await api.patch(`/api/member/user/update/${id}`, payload);
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
    updateUser,
    deleteUser,
    updateStoreState,
    getUserById,
    deleteStore,
    deletePos,
    deleteDriver,
};