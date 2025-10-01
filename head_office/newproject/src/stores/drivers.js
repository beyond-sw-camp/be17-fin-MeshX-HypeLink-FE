import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useDriverStore = defineStore('drivers', () => {
  const allDrivers = ref([
    { id: 1, name: '김기사', phone: '010-1111-1111', region: '서울/경기' },
    { id: 2, name: '이기사', phone: '010-2222-2222', region: '서울/경기' },
    { id: 3, name: '박기사', phone: '010-3333-3333', region: '부산/경남' },
    { id: 4, name: '최기사', phone: '010-4444-4444', region: '제주' },
  ]);

  const stores = ref([
    { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', drivers: [] },
    { id: 2, name: 'HypeLink 홍대점', address: '서울시 마포구 양화로', drivers: [] },
    { id: 3, name: 'HypeLink 부산점', address: '부산시 해운대구', drivers: [] },
    { id: 4, name: 'HypeLink 제주점', address: '제주시 첨단로', drivers: [] },
  ]);

  const addDriver = (driver) => {
    allDrivers.value.push({ id: Date.now(), ...driver });
  };

  const deleteDriver = (id) => {
    allDrivers.value = allDrivers.value.filter(driver => driver.id !== id);
    stores.value.forEach(store => {
      store.drivers = store.drivers.filter(driver => driver.id !== id);
    });
  };

  const assignDriverToStore = (driver, store) => {
    // 다른 매장에서 기사 이동 시, 이전 매장에서 제거
    stores.value.forEach(s => {
      s.drivers = s.drivers.filter(d => d.id !== driver.id);
    });

    // 대상 매장에 이미 기사가 있다면, 그 기사를 전체 목록으로 이동
    if (store.drivers.length > 0) {
      const existingDriver = store.drivers[0];
      if (!allDrivers.value.some(d => d.id === existingDriver.id)) {
        allDrivers.value.push(existingDriver);
      }
    }

    // 대상 매장에 새 기사 할당
    store.drivers = [driver];
    
    // 전체 기사 목록에서 제거
    const indexInAll = allDrivers.value.findIndex(d => d.id === driver.id);
    if (indexInAll > -1) {
      allDrivers.value.splice(indexInAll, 1);
    }
  };

  const unassignDriver = (store, driver) => {
    store.drivers = [];
    if (!allDrivers.value.some(d => d.id === driver.id)) {
        allDrivers.value.push(driver);
    }
  };


  return { allDrivers, stores, addDriver, deleteDriver, assignDriverToStore, unassignDriver };
});
