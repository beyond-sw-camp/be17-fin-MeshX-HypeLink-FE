import api from '@/plugins/axiosinterceptor';

export const fetchUnassignedParcels = async () => {
    try {
        const response = await api.get('/api/shipment/parcels/unassigned');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const fetchAssignedParcels = async () => {
    try {
        const response = await api.get('/api/shipment/parcels/assigned');
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};

export const assignShipment = async (shipmentId, driverId) => {
    try {
        const response = await api.post('/api/shipment/connecting', { shipmentId, driverId });
        return { success: true, data: response.data.data };
    } catch (error) {
        const errorData = error.response?.data || { message: '네트워크 오류 또는 서버 응답 없음' };
        errorData.success = false;
        return errorData;
    }
};
