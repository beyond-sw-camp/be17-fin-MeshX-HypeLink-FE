import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import storeApi from '@/api/store'; // Import the new store API
import posApi from '@/api/pos';

// For Admins/Managers
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
    const response = await storeApi.getStoresWithPos();
    if (response.success) {
      allData.value = response.data;
    } else {
      console.error("Failed to fetch store and POS data:", response.message);
      allData.value = []; // Clear data on failure
    }
    isLoading.value = false;
  };

  const addPosDevice = async (newPosData) => {
    if (!selectedStoreId.value) return false;
    
    // When connected to a real API, we would call a register API
    // and then refresh the data for the selected store.
    // For now, we just add it locally to the mock data for UI testing.
    await new Promise(resolve => setTimeout(resolve, 300));

    if (selectedStore.value) {
        const newDevice = {
          ...newPosData,
          id: `p${Date.now()}`,
          name: newPosData.name || `${selectedStore.value.name}-POS${selectedStore.value.posDevices.length + 1}`
        };
        selectedStore.value.posDevices.push(newDevice);
    }
    return true; // Simulate success
  };

  const deletePosDevice = async (posId) => {
    const response = await posApi.deletePos(posId);
    if (response.success && selectedStore.value) {
      // Remove from the local array
      const index = selectedStore.value.posDevices.findIndex(p => p.id === posId);
      if (index > -1) {
        selectedStore.value.posDevices.splice(index, 1);
      }
      return true;
    }
    return false;
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

// For Branch Managers
export const useMyStore = defineStore('my-store-view', () => {
  const storeDetails = ref(null);
  const posDevices = ref([]);
  const isLoading = ref(false);

  const mockData = {
    storeDetails: { id: 101, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로 123', storeNumber: '123-45-67890', region: 'SEOUL_GYEONGGI' },
    posDevices: [
      { id: 'p01', name: '강남점-POS1', email: 'pos1@gangnam.com', phone: '02-111-1111', posCode: 'S101P01' },
      { id: 'p02', name: '강남점-POS2', email: 'pos2@gangnam.com', phone: '02-111-1112', posCode: 'S101P02' },
    ]
  };

  const fetchMyStoreData = async () => {
    isLoading.value = true;
    // Simulate API call to GET /api/store/mystore
    await new Promise(resolve => setTimeout(resolve, 500));
    storeDetails.value = mockData.storeDetails;
    posDevices.value = mockData.posDevices;
    isLoading.value = false;
  };

  return {
    storeDetails,
    posDevices,
    isLoading,
    fetchMyStoreData
  };
});
