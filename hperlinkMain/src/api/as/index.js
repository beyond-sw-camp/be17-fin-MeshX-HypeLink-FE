import api from '@/plugins/axiosinterceptor';

// --- Store AS APIs (for Branch Manager) ---
export const createStoreAsRequest = async (asData) => {
    try {
        const response = await api.post('/api/store/as/create', asData);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoreAsList = async () => {
    try {
        const response = await api.get('/api/store/as/list');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getStoreAsDetail = async (id) => {
    try {
        const response = await api.get(`/api/store/as/read/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const updateStoreAsRequest = async (id, asData) => {
    try {
        const response = await api.patch(`/api/store/as/update/${id}`, asData);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const deleteStoreAsRequest = async (id) => {
    try {
        const response = await api.delete(`/api/store/as/delete/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

// --- Head Office AS APIs (for Admin/Manager) ---
export const getHeadOfficeAsList = async (page = 0, size = 15) => {
    try {
        const response = await api.get(`/api/as/list/paging?page=${page}&size=${size}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const getHeadOfficeAsDetail = async (id) => {
    try {
        const response = await api.get(`/api/as/read/${id}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const updateHeadOfficeAsStatus = async (id, statusData) => {
    try {
        const response = await api.patch(`/api/as/update/status/${id}`, statusData);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const addHeadOfficeAsComment = async (id, commentData) => {
    try {
        const response = await api.post(`/api/as/create/comment/${id}`, commentData);
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

