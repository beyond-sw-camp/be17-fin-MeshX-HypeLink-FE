import api from "@/plugins/axiosinterceptor";

// Deletes a POS device by its ID
export const deletePos = async (id) => {
    try {
        // When the backend is ready, this will be the actual API call
        // const response = await api.delete(`/api/pos/${id}`);
        
        // For now, simulate a successful deletion
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[API Mock] Deleted POS with id: ${id}`);
        return { success: true };

    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export default {
    deletePos,
};
