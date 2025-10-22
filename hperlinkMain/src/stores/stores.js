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
        status: mapStoreStateToDescription(store.storeState),
      }));
    } else {
      // 에러를 다시 던져서 인터셉터의 에러 처리 로직이 동작하도록 함
      throw new Error(response.message || "Failed to fetch stores.");
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
