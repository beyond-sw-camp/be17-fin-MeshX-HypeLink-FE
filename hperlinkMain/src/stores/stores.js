import { ref } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users'; // Add this import

export const useStoreStore = defineStore('stores', () => {
  const allStores = ref([]); // Initialize as empty array

  const fetchStores = async () => {
    const response = await usersApi.getStoresList();
    if (response.success) {
      allStores.value = response.data.map(store => ({
        id: store.storeId,
        name: store.storeName,
        address: store.storeAddress,
        phone: store.storePhone,
        status: mapStoreStateToDescription(store.storeState), // Map enum to description
        // owner: store.owner // Assuming owner comes from API or will be derived
      }));
    } else {
      console.error("Failed to fetch stores:", response.message);
    }
  };

  // Helper function to map StoreState enum to description
  const mapStoreStateToDescription = (state) => {
    switch (state) {
      case 'OPEN': return '영업 중';
      case 'CLOSED': return '영업 종료';
      case 'TEMP_CLOSED': return '휴점';
      default: return state;
    }
  };

  const addStore = (store) => {
    const newId = allStores.value.length > 0 ? Math.max(...allStores.value.map(s => s.id)) + 1 : 1;
    allStores.value.push({ id: newId, ...store });
  };

  const updateStore = (updatedStore) => {
    const index = allStores.value.findIndex(s => s.id === updatedStore.id);
    if (index !== -1) {
      allStores.value[index] = { ...allStores.value[index], ...updatedStore };
    }
  };

  const deleteStore = (id) => {
    allStores.value = allStores.value.filter(s => s.id !== id);
  };

  return { allStores, addStore, updateStore, deleteStore, fetchStores };
});
