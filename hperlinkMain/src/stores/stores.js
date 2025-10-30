import { ref } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users'; // Add this import

export const useStoreStore = defineStore('stores', () => {
  const allStores = ref([]); // Initialize as empty array
  const totalElements = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(0);

  const fetchStores = async (page = 0, size = 10, sort = 'id,desc', keyWord = '', status = 'all') => {
    const response = await usersApi.getStoresList(page, size, sort, keyWord, status);
    if (response.success) {
      allStores.value = response.data.content.map(store => ({
        id: store.storeId,
        name: store.storeName,
        address: store.storeAddress,
        phone: store.storePhone,
        status: mapStoreStateToDescription(store.storeState),
      }));
      totalElements.value = response.data.totalElements;
      totalPages.value = response.data.totalPages;
      currentPage.value = response.data.number;
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

  const deleteStore = async (id) => {
    const response = await usersApi.deleteStore(id);
    if (response.success) {
      // 삭제 성공 후, 전체 매장 목록을 다시 불러옵니다.
      await fetchStores();
      return true;
    } else {
      // API 호출 실패 시 에러를 발생시켜 컴포넌트에서 처리할 수 있도록 합니다.
      throw new Error(response.message || '매장 삭제에 실패했습니다.');
    }
  };

  return { allStores, totalElements, totalPages, currentPage, addStore, updateStore, deleteStore, fetchStores };
});
