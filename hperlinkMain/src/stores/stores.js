import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useStoreStore = defineStore('stores', () => {
  const allStores = ref([
    { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', owner: '최민성', phone: '010-1234-5678', status: '운영중' },
    { id: 2, name: 'HypeLink 홍대점', address: '서울시 마포구 양화로', owner: '강병욱', phone: '010-2345-6789', status: '운영중' },
    { id: 3, name: 'HypeLink 부산점', address: '부산시 해운대구', owner: '김성인', phone: '010-3456-7890', status: '휴점' },
    { id: 4, name: 'HypeLink 제주점', address: '제주시 첨단로', owner: '이시욱', phone: '010-4567-8901', status: '운영중' },
    { id: 5, name: 'HypeLink 명동점', address: '서울시 중구 명동', owner: '박지민', phone: '010-5678-1234', status: '운영중' },
    { id: 6, name: 'HypeLink 대구점', address: '대구시 중구 동성로', owner: '정호석', phone: '010-6789-1234', status: '휴점' },
  ]);

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

  return { allStores, addStore, updateStore, deleteStore };
});
