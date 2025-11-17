import { ref } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users';
import authApi from '@/api/auth'; // Import authApi
import { fetchUnassignedParcels, fetchAssignedParcels, assignShipment } from '@/api/shipment'; // 배송 API 임포트

export const useDriverStore = defineStore('drivers', () => {
  // State
  const drivers = ref([]);
  const unassignedParcels = ref([]); // 미배정 택배 상태 추가
  const isLoading = ref(false);

  // Actions
  const fetchDrivers = async () => {
    isLoading.value = true;
    try {
      const response = await usersApi.getDrivers();
      if (response.success && response.data) {
        // The API returns a list of drivers, assuming each has an empty assignedParcels array for the UI
        drivers.value = response.data.map(driver => ({ ...driver, assignedParcels: [] }));
      } else {
        console.error('Failed to fetch drivers:', response.message);
        drivers.value = [];
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      drivers.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUnassignedParcelsAction = async () => {
    try {
      const response = await fetchUnassignedParcels();
      if (response.success && response.data) { // 응답 형식 일관성 유지
        unassignedParcels.value = response.data;
      } else {
        console.error('Failed to fetch unassigned parcels:', response.message);
        unassignedParcels.value = [];
      }
    } catch (error) {
      console.error('Error fetching unassigned parcels:', error);
      unassignedParcels.value = [];
    }
  };

  const fetchAssignedParcelsAction = async () => {
    try {
      const response = await fetchAssignedParcels();
      if (response.success && response.data) { // 응답 형식 일관성 유지
        // 기존 할당된 택배 목록 초기화
        drivers.value.forEach(driver => driver.assignedParcels = []);
        
        // 가져온 택배를 순회하며 적절한 드라이버에게 할당
        response.data.forEach(parcel => {
          const driver = drivers.value.find(d => d.id === parcel.driverId);
          if (driver) {
            driver.assignedParcels.push(parcel);
          }
        });
      } else {
        console.error('Failed to fetch assigned parcels:', response.message);
      }
    } catch (error) {
      console.error('Error fetching assigned parcels:', error);
    }
  };

  const addDriver = async (driverData) => {
    try {
      const response = await authApi.registerUser(driverData);
      if (response.success) {
        await fetchDrivers(); // Refresh the list
        await fetchUnassignedParcelsAction(); // Refresh unassigned parcels
        await fetchAssignedParcelsAction(); // Refresh assigned parcels
        return true;
      } else {
        throw new Error(response.message || '기사 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  };

  const deleteDriver = async (driverId) => {
    try {
      const response = await usersApi.deleteDriver(driverId);
      if (response.success) {
        await fetchDrivers(); // Refresh the list
        await fetchUnassignedParcelsAction(); // Refresh unassigned parcels
        await fetchAssignedParcelsAction(); // Refresh assigned parcels
        return true;
      } else {
        throw new Error(response.message || '기사 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  };

  const assignShipmentToDriver = async (shipmentId, driverId) => {
    try {
      const response = await assignShipment(shipmentId, driverId);
      if (response.success) {
        // Update state: move parcel from unassigned to assigned
        const assignedParcel = unassignedParcels.value.find(p => p.shipmentId === shipmentId);
        if (assignedParcel) {
          // Remove from unassigned
          unassignedParcels.value = unassignedParcels.value.filter(p => p.shipmentId !== shipmentId);

          // Add to driver's assigned parcels
          const driver = drivers.value.find(d => d.id === driverId);
          if (driver) {
            // Update status if needed (backend should handle this, but for UI consistency)
            assignedParcel.shipmentStatus = 'ASSIGNED'; // Or whatever the new status is
            driver.assignedParcels.push(assignedParcel);
          }
        }
        return { success: true };
      } else {
        throw new Error(response.message || '택배 배정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error assigning shipment:', error);
      throw error;
    }
  };

  return { 
    drivers, 
    unassignedParcels, 
    isLoading, 
    fetchDrivers, 
    addDriver, 
    deleteDriver,
    fetchUnassignedParcelsAction,
    fetchAssignedParcelsAction,
    assignShipmentToDriver
  };
});