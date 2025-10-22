import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth'; // To get user role

// For Admins/Managers
export const usePosManagementStore = defineStore('pos-management', () => {
  // --- STATE ---
  const selectableStores = ref([]);
  const selectedStoreId = ref(null);
  const posDevices = ref([]);
  const isLoading = ref(false);

  const selectedStore = computed(() => {
    return selectableStores.value.find(s => s.id === selectedStoreId.value) || null;
  });

  // --- MOCK DATA ---
  const mockAllStores = [
    { id: 101, name: 'HypeLink 강남점', region: 'SEOUL_GYEONGGI' },
    { id: 102, name: 'HypeLink 홍대점', region: 'SEOUL_GYEONGGI' },
    { id: 103, name: 'HypeLink 부산점', region: 'GYEONGSANG' },
  ];

  const mockPosDataByStore = {
    101: [
      { id: 'p01', name: '강남점-POS1', posCode: 'S101P01' },
      { id: 'p02', name: '강남점-POS2', posCode: 'S101P02' },
    ],
    102: [
      { id: 'p03', name: '홍대점-POS1', posCode: 'S102P01' },
    ],
    103: [],
  };

  // --- ACTIONS ---

  const fetchSelectableStores = async () => {
    isLoading.value = true;
    const authStore = useAuthStore();
    console.log('Fetching selectable stores for role:', authStore.user?.role);

    // Simulate API call based on role
    await new Promise(resolve => setTimeout(resolve, 300));

    if (authStore.isBranchManager) {
      // Branch Manager sees only their own store
      selectableStores.value = mockAllStores.slice(0, 1); 
    } else {
      // Admin/Manager sees all stores
      selectableStores.value = mockAllStores;
    }
    isLoading.value = false;
  };

  const fetchPosDevices = async (storeId) => {
    if (!storeId) return;
    isLoading.value = true;
    console.log(`Fetching POS devices for storeId: ${storeId}`);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    posDevices.value = mockPosDataByStore[storeId] || [];
    isLoading.value = false;
  };

  const addPosDevice = async (newPosData) => {
    if (!selectedStoreId.value) return false;
    console.log(`Adding new POS device to store ${selectedStoreId.value}:`, newPosData);
    
    // This will call the actual API: POST /api/auth/register
    // For now, just add to the mock data array
    await new Promise(resolve => setTimeout(resolve, 300));

    const newDevice = {
      ...newPosData,
      id: `p${Date.now()}`,
      name: `${selectedStore.value.name}-POS${posDevices.value.length + 1}`
    };
    posDevices.value.push(newDevice);
    return true; // Simulate success
  };

  return {
    selectableStores,
    selectedStoreId,
    posDevices,
    isLoading,
    selectedStore,
    fetchSelectableStores,
    fetchPosDevices,
    addPosDevice,
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
