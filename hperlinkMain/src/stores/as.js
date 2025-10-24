import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import {
    getHeadOfficeAsList,
    getHeadOfficeAsDetail,
    updateHeadOfficeAsStatus,
    addHeadOfficeAsComment,
    getStoreAsList,
    getStoreAsDetail,
    createStoreAsRequest,
    updateStoreAsRequest,
    deleteStoreAsRequest
} from '@/api/as';
import router from "@/router";

export const useAsStore = defineStore('as', () => {
    // State
    const asRequests = ref([]);
    const selectedAsRequest = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Stores
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    // Getters - No longer need local role checks, can use authStore directly
    // e.g., authStore.isAdmin, authStore.isManager, authStore.isBranchManager

    // Actions
    const fetchAsRequests = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            let response;
            if (authStore.isAdmin || authStore.isManager) {
                response = await getHeadOfficeAsList();
            } else if (authStore.isBranchManager) {
                response = await getStoreAsList();
            } else {
                throw new Error("AS 요청을 조회할 권한이 없습니다.");
            }

            if (response.success) {
                asRequests.value = response.data;
            } else {
                throw new Error(response.message || 'AS 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            toastStore.showToast(err.message, 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const fetchAsRequestDetail = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            let response;
            if (authStore.isAdmin || authStore.isManager) {
                response = await getHeadOfficeAsDetail(id);
            } else if (authStore.isBranchManager) {
                response = await getStoreAsDetail(id);
            } else {
                throw new Error("AS 상세 정보를 조회할 권한이 없습니다.");
            }

            if (response.success) {
                selectedAsRequest.value = response.data;
            } else {
                throw new Error(response.message || 'AS 상세 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            toastStore.showToast(err.message, 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const createAsRequest = async (asData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await createStoreAsRequest(asData);
            if (response.success) {
                await router.push({ name: 'asList' });
                return response; // Return success response
            } else {
                throw new Error(response.message || 'AS 요청 등록에 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            return { success: false, message: err.message }; // Return error response
        } finally {
            isLoading.value = false;
        }
    };

    const updateAsRequest = async (id, asData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await updateStoreAsRequest(id, asData);
            if (response.success) {
                await fetchAsRequestDetail(id); // Refresh data
                return response;
            } else {
                throw new Error(response.message || 'AS 요청 수정에 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteAsRequest = async (id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await deleteStoreAsRequest(id);
            if (response.success) {
                await router.push({ name: 'asList' });
                return response;
            } else {
                throw new Error(response.message || 'AS 요청 삭제에 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateAsStatus = async (id, statusData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await updateHeadOfficeAsStatus(id, statusData);
            if (response.success) {
                await fetchAsRequestDetail(id); // Refresh data
                return response;
            } else {
                throw new Error(response.message || '상태 변경에 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    const addAsComment = async (id, commentData) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await addHeadOfficeAsComment(id, commentData);
            if (response.success) {
                await fetchAsRequestDetail(id); // Refresh data
                return response;
            } else {
                throw new Error(response.message || '코멘트 추가에 실패했습니다.');
            }
        } catch (err) {
            error.value = err.message;
            return { success: false, message: err.message };
        } finally {
            isLoading.value = false;
        }
    };

    return {
        asRequests,
        selectedAsRequest,
        isLoading,
        error,
        fetchAsRequests,
        fetchAsRequestDetail,
        createAsRequest,
        updateAsRequest,
        deleteAsRequest,
        updateAsStatus,
        addAsComment,
    };
});