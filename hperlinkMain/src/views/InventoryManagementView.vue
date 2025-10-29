<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useShipmentStore } from '@/stores/shipments';
import { useToastStore } from '@/stores/toast';
import InventoryList from './inventory-management/InventoryList.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const authStore = useAuthStore();
const shipmentStore = useShipmentStore();
const toastStore = useToastStore();

const allInventory = ref([]);
const isLoading = ref(true);

const stores = ref([
  { id: 1, name: 'HypeLink 강남점' }, { id: 2, name: 'HypeLink 홍대점' }, { id: 3, name: 'HypeLink 부산점' }, { id: 4, name: 'HypeLink 제주점' },
]);
const drivers = ref([
  { id: 1, name: '김기사' }, { id: 2, name: '이기사' }, { id: 3, name: '박기사' }, { id: 4, name: '최기사' },
]);

const isModalOpen = ref(false);
const formSubmitted = ref(false);
const selectedItem = ref(null);
const shipmentForm = reactive({ qty: 1, to: '', driver: '' });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    allInventory.value = [
      { id: 1, storeName: 'HypeLink 강남점', code: 'P001', name: 'Hype-Tee', currentStock: 150, safeStock: 50, category: '상의' },
      { id: 2, storeName: 'HypeLink 강남점', code: 'P002', name: 'Link-Pants', currentStock: 45, safeStock: 50, category: '하의' },
      { id: 3, storeName: 'HypeLink 홍대점', code: 'P001', name: 'Hype-Tee', currentStock: 80, safeStock: 50, category: '상의' },
      { id: 4, storeName: 'HypeLink 부산점', code: 'P003', name: 'Hyper-Jacket', currentStock: 90, safeStock: 30, category: '아우터' },
      { id: 5, storeName: 'HypeLink 강남점', code: 'P004', name: 'Mesh-Cap', currentStock: 0, safeStock: 20, category: '악세서리' },
      { id: 6, storeName: 'HypeLink 홍대점', code: 'P004', name: 'Mesh-Cap', currentStock: 120, safeStock: 20, category: '악세서리' },
    ];
    isLoading.value = false;
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedInventory = computed(() => {
  let inventory = [...allInventory.value];

  // 역할에 따른 필터링 (점주는 자신의 매장만)
  if (authStore.isBranchManager) {
    inventory = inventory.filter(item => item.storeName === authStore.user.name);
  }

  // 검색
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    inventory = inventory.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.code.toLowerCase().includes(term) ||
      item.storeName.toLowerCase().includes(term)
    );
  }

  // 필터링 (상태별)
  if (filterStatus.value !== 'all') {
    inventory = inventory.filter(item => {
      const status = item.currentStock > item.safeStock ? '양호' : (item.currentStock > 0 ? '주의' : '품절');
      return status === filterStatus.value;
    });
  }

  // 정렬
  if (sortKey.value) {
    inventory.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return inventory;
});

// --- 페이지네이션 로직 ---
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedInventory.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedInventory.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSearchTerm = (term) => { searchTerm.value = term; currentPage.value = 1; };
const updateFilterStatus = (status) => { filterStatus.value = status; currentPage.value = 1; };
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { currentPage.value = page; };

const openShipmentModal = (item) => {
  formSubmitted.value = false;
  selectedItem.value = item;
  shipmentForm.qty = 1;
  shipmentForm.to = '';
  shipmentForm.driver = '';
  isModalOpen.value = true;
};

const availableStores = computed(() => 
  stores.value.filter(store => store.name !== selectedItem.value?.storeName)
);

const createShipment = () => {
  formSubmitted.value = true;
  if (!shipmentForm.to || !shipmentForm.driver || shipmentForm.qty <= 0) {
    toastStore.showToast('모든 배송 정보를 올바르게 입력해주세요.', 'danger');
    return;
  }

  shipmentStore.createShipment({
    driver: shipmentForm.driver,
    from: selectedItem.value.storeName,
    to: shipmentForm.to,
    item: selectedItem.value.name,
    qty: shipmentForm.qty,
  });

  // 재고 변경 (실제로는 API 호출 후 결과에 따라 처리)
  const index = allInventory.value.findIndex(i => i.id === selectedItem.value.id);
  if (index !== -1) {
    allInventory.value[index].currentStock -= shipmentForm.qty;
  }

  isModalOpen.value = false;
  toastStore.showToast('배송 요청이 생성되었습니다. 배송 추적 페이지에서 확인하세요.', 'success');
};
</script>

<template>
  <div>
    <InventoryList 
      :inventory="paginatedInventory"
      :totalInventory="filteredAndSortedInventory.length"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      :searchTerm="searchTerm"
      :filterStatus="filterStatus"
      @send-shipment="openShipmentModal"
      @update:search-term="updateSearchTerm"
      @update:filter-status="updateFilterStatus"
      @update:sort="updateSort"
      @update:page="updatePage"
    />

    <!-- 배송 생성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>재고 배송 생성</h5></template>

      <div v-if="selectedItem">
        <p><strong>{{ selectedItem.name }}</strong> 상품을 다른 매장으로 보냅니다.</p>
        <form @submit.prevent="createShipment">
          <div class="mb-3">
            <label class="form-label">보내는 매장</label>
            <input type="text" class="form-control" :value="selectedItem.storeName" disabled>
          </div>
          <div class="mb-3">
            <label for="quantity" class="form-label">수량 <span class="text-danger">*</span></label>
            <input type="number" class="form-control" id="quantity" v-model.number="shipmentForm.qty" min="1" :max="selectedItem.currentStock" :class="{ 'is-invalid': (!shipmentForm.qty || shipmentForm.qty <= 0) && formSubmitted }">
            <div class="invalid-feedback">수량은 1개 이상이어야 합니다.</div>
          </div>
          <div class="mb-3">
            <label for="toStore" class="form-label">받는 매장 <span class="text-danger">*</span></label>
            <select class="form-select" id="toStore" v-model="shipmentForm.to" :class="{ 'is-invalid': !shipmentForm.to && formSubmitted }">
              <option value="">-- 매장 선택 --</option>
              <option v-for="store in availableStores" :key="store.id" :value="store.name">{{ store.name }}</option>
            </select>
            <div class="invalid-feedback">받는 매장을 선택해주세요.</div>
          </div>
          <div class="mb-3">
            <label for="driver" class="form-label">담당 기사 <span class="text-danger">*</span></label>
            <select class="form-select" id="driver" v-model="shipmentForm.driver" :class="{ 'is-invalid': !shipmentForm.driver && formSubmitted }">
              <option value="">-- 기사 선택 --</option>
              <option v-for="driver in drivers" :key="driver.id" :value="driver.name">{{ driver.name }}</option>
            </select>
            <div class="invalid-feedback">담당 기사를 선택해주세요.</div>
          </div>
        </form>
      </div>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="createShipment">배송 시작</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
