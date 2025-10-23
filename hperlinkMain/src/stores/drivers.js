import { ref } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users';
import authApi from '@/api/auth'; // Import authApi

export const useDriverStore = defineStore('drivers', () => {
  // State
  const drivers = ref([]);
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

  const addDriver = async (driverData) => {
    try {
      const response = await authApi.registerUser(driverData);
      if (response.success) {
        await fetchDrivers(); // Refresh the list
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
        return true;
      } else {
        throw new Error(response.message || '기사 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  };

  return { drivers, isLoading, fetchDrivers, addDriver, deleteDriver };
});