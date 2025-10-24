import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users';
import authApi from '@/api/auth';

// For Admins/Managers (Restored)
export const usePosManagementStore = defineStore('pos-management', () => {
  // --- STATE ---
  const allData = ref([]); // Holds the entire list of stores with nested POS devices
  const selectedStoreId = ref(null);
  const isLoading = ref(false);

  // --- COMPUTED PROPERTIES ---

  // The list of stores for the dropdown selector
  const selectableStores = computed(() => {
    return allData.value.map(store => ({ id: store.id, name: store.name }));
  });

  // The currently selected store object
  const selectedStore = computed(() => {
    return allData.value.find(s => s.id === selectedStoreId.value) || null;
  });

  // The list of POS devices for the currently selected store
  const posDevices = computed(() => {
    return selectedStore.value ? selectedStore.value.posDevices : [];
  });

  // --- ACTIONS ---

  const fetchData = async () => {
    isLoading.value = true;
    try {
      const response = await usersApi.getStoresWithPos();
      if (response.success) {
        allData.value = response.data;
      } else {
        console.error("Failed to fetch store and POS data:", response.message);
        allData.value = []; // Clear data on failure
      }
    } catch (error) {
      console.error("Error fetching store and POS data:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addPosDevice = async (newPosData) => {
    if (!selectedStoreId.value) {
      console.error("No store selected for POS registration.");
      return false;
    }

    const response = await authApi.registerUser(newPosData);

    if (response.success) {
      await fetchData(); // Refresh data after successful registration
      return true;
    } else {
      console.error("POS registration failed:", response.message);
      return false;
    }
  };

  const deletePosDevice = async (posId) => {
    try {
      const response = await usersApi.deletePos(posId);
      if (response.success) {
        await fetchData(); // Refresh data after successful deletion
        return true;
      } else {
        throw new Error(response.message || 'POS 기기 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error deleting POS device:", error);
      return false;
    }
  };

  return {
    selectedStoreId,
    isLoading,
    selectableStores,
    selectedStore,
    posDevices,
    fetchData,
    addPosDevice,
    deletePosDevice,
  };
});

// For Branch Managers & Admin Store Detail View
export const useMyStore = defineStore('my-store-view', () => {
  const storeDetails = ref(null);
  const posDevices = ref([]);
  const isLoading = ref(false);

  const fetchMyStoreData = async (storeId = null) => {
    isLoading.value = true;
    storeDetails.value = null; // 데이터 초기화
    posDevices.value = [];

    try {
      // storeId가 있으면 관리자용 API, 없으면 점주용 API 호출
      const response = storeId
        ? await usersApi.getStoreById(storeId)
        : await usersApi.getMyStore();

      if (response.success && response.data) { // response.data가 null이 아닌지 확인
        storeDetails.value = response.data;
        posDevices.value = response.data.posDevices || [];
      } else {
        console.error("Failed to fetch store data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addPosDevice = async (newPosData) => {
    if (!storeDetails.value?.id) {
      console.error("Store ID not available for POS registration.");
      return false;
    }

    const response = await authApi.registerUser(newPosData);

    if (response.success) {
      await fetchMyStoreData(storeDetails.value.id); // Refresh data
      return true;
    } else {
      console.error("POS registration failed:", response.message);
      return false;
    }
  };

  const deletePosDevice = async (posId) => {
    try {
      const response = await usersApi.deletePos(posId);
      if (response.success) {
        await fetchMyStoreData(storeDetails.value.id); // Refresh data
        return true;
      } else {
        throw new Error(response.message || 'POS 기기 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error deleting POS device:", error);
      return false;
    }
  };

  return {
    storeDetails,
    posDevices,
    isLoading,
    fetchMyStoreData,
    addPosDevice,
    deletePosDevice
  };
});