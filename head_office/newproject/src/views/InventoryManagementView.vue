<template>
  <div>
    <!-- 내 매장 재고 (점주) 또는 전체 재고 (관리자) -->
    <InventoryList :inventory="filteredInventory" @send-shipment="openShipmentModal" />

    <!-- 타 매장 재고 조회 (점주 전용) -->
    <div v-if="authStore.isStoreManager" class="mt-4">
      <BaseCard>
        <template #header><h5>타 매장 재고 조회</h5></template>
        <div class="row">
          <div class="col-md-6">
            <label for="store-lookup" class="form-label">매장 선택</label>
            <select id="store-lookup" class="form-select" v-model="selectedStore">
              <option :value="null">-- 조회할 매장 선택 --</option>
              <option v-for="store in availableStores" :key="store.id" :value="store.name">
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="selectedStoreInventory.length > 0" class="mt-3">
          <hr>
          <h6>'{{ selectedStore }}' 재고 현황</h6>
          <InventoryList :inventory="selectedStoreInventory" />
        </div>
      </BaseCard>
    </div>

    <!-- 배송 생성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>재고 배송 생성</h5></template>
      <!-- ... 모달 내용 ... -->
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useShipmentStore } from '@/stores/shipments';
import InventoryList from './inventory-management/InventoryList.vue';
import BaseModal from '@/components/BaseModal.vue';

const authStore = useAuthStore();
const shipmentStore = useShipmentStore();

// --- Mock Data ---
const allInventory = ref([
  { id: 1, storeName: 'HypeLink 강남점', code: 'P001', name: 'Hype-Tee', currentStock: 150, safeStock: 50 },
  { id: 2, storeName: 'HypeLink 강남점', code: 'P002', name: 'Link-Pants', currentStock: 45, safeStock: 50 },
  { id: 3, storeName: 'HypeLink 홍대점', code: 'P001', name: 'Hype-Tee', currentStock: 80, safeStock: 50 },
  { id: 4, storeName: 'HypeLink 부산점', code: 'P003', name: 'Hyper-Jacket', currentStock: 90, safeStock: 30 },
  { id: 5, storeName: 'HypeLink 강남점', code: 'P004', name: 'Mesh-Cap', currentStock: 0, safeStock: 20 },
  { id: 6, storeName: 'HypeLink 홍대점', code: 'P004', name: 'Mesh-Cap', currentStock: 120, safeStock: 20 },
]);
const stores = ref([
  { id: 1, name: 'HypeLink 강남점' }, { id: 2, name: 'HypeLink 홍대점' }, { id: 3, name: 'HypeLink 부산점' }, { id: 4, name: 'HypeLink 제주점' },
]);
const drivers = ref([
  { id: 1, name: '김기사' }, { id: 2, name: '이기사' }, { id: 3, name: '박기사' }, { id: 4, name: '최기사' },
]);

// --- Component State & Logic ---
const isModalOpen = ref(false);
const selectedItem = ref(null);
const shipmentForm = reactive({ qty: 1, to: '', driver: '' });
const selectedStore = ref(null);
const searchProductCode = ref(''); // 품번 검색어 상태 추가

const filteredInventory = computed(() => {
  if (authStore.isStoreManager) {
    return allInventory.value.filter(item => item.storeName === authStore.user.name);
  }
  return allInventory.value;
});

const availableStores = computed(() => 
  stores.value.filter(store => store.name !== authStore.user?.name)
);

// 선택된 매장의 재고 목록 (검색어 필터링 포함)
const selectedStoreInventory = computed(() => {
  if (!selectedStore.value) return [];
  const storeInv = allInventory.value.filter(item => item.storeName === selectedStore.value);
  if (searchProductCode.value) {
    return storeInv.filter(item => 
      item.code.toLowerCase().includes(searchProductCode.value.toLowerCase())
    );
  }
  return storeInv;
});

const openShipmentModal = (item) => {
  selectedItem.value = item;
  shipmentForm.qty = 1;
  shipmentForm.to = '';
  shipmentForm.driver = '';
  isModalOpen.value = true;
};

const createShipment = () => {
  if (!shipmentForm.to || !shipmentForm.driver || shipmentForm.qty <= 0) {
    alert('모든 배송 정보를 올바르게 입력해주세요.');
    return;
  }
  shipmentStore.createShipment({
    driver: shipmentForm.driver,
    from: selectedItem.value.storeName,
    to: shipmentForm.to,
    item: selectedItem.value.name,
    qty: shipmentForm.qty,
  });
  selectedItem.value.currentStock -= shipmentForm.qty;
  isModalOpen.value = false;
  alert('배송 요청이 생성되었습니다. 배송 추적 페이지에서 확인하세요.');
};
</script>
