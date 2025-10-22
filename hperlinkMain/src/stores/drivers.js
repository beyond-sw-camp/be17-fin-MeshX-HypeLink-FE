import { ref } from 'vue';
import { defineStore } from 'pinia';
import usersApi from '@/api/users';

export const useDriverStore = defineStore('drivers', () => {
  const allDrivers = ref([]);
  const stores = ref([]); // Initialize as empty array

  // Fetches stores from the backend
  const fetchStores = async () => {
    const response = await usersApi.getStoresList();
    if (response.success) {
      stores.value = response.data.map(store => ({ 
        id: store.storeId, 
        name: store.storeName, 
        address: store.storeAddress, 
        phone: store.storePhone, 
        drivers: [] // Initialize drivers array for each store
      }));
    } else {
      console.error("Failed to fetch stores:", response.message);
    }
  };

  // Fetches drivers from the backend
  const fetchDrivers = async () => {
    const response = await usersApi.getDrivers();
    if (response.success) {
      // The backend provides macAddress which is a unique identifier. Use it for the ID.
      allDrivers.value = response.data.map(driver => ({ ...driver, id: driver.macAddress }));
    } else {
      console.error("Failed to fetch drivers:", response.message);
      // Optionally, show a toast message to the user
    }
  };

  const addDriver = (driver) => {
    allDrivers.value.push({ id: Date.now(), ...driver });
  };

  const deleteDriver = (id) => {
    allDrivers.value = allDrivers.value.filter(driver => driver.id !== id);
    stores.value.forEach(store => {
      store.drivers = store.drivers.filter(d => d.id !== id);
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


  return { allDrivers, stores, fetchDrivers, addDriver, deleteDriver, assignDriverToStore, unassignDriver, fetchStores };
});
