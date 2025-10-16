<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import StoreList from './store-management/StoreList.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useStoreStore } from '@/stores/stores';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { nanumGothic } from '@/utils/NanumGothic-normal.js';

const toastStore = useToastStore();
const modalStore = useModalStore();
const storeStore = useStoreStore();

const isLoading = ref(true);

const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const newStore = reactive({
  id: null,
  name: '',
  address: '',
  owner: '',
  phone: '',
  status: '운영중'
});

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
    isLoading.value = false;
  }, 500); // 데이터가 store에 이미 있으므로 로딩 시간을 줄임
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedStores = computed(() => {
  let stores = [...storeStore.allStores];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    stores = stores.filter(store => 
      store.name.toLowerCase().includes(term) || 
      store.address.toLowerCase().includes(term)
    );
  }

  if (filterStatus.value !== 'all') {
    stores = stores.filter(store => store.status === filterStatus.value);
  }

  if (sortKey.value) {
    stores.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return stores;
});

// --- 페이지네이션 로직 ---
const paginatedStores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedStores.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedStores.value.length / itemsPerPage.value));

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

const openAddStoreModal = (store = null) => {
  formSubmitted.value = false;
  if (store) {
    isEditing.value = true;
    Object.assign(newStore, store);
  } else {
    isEditing.value = false;
    Object.assign(newStore, { id: null, name: '', address: '', owner: '', phone: '', status: '운영중' });
  }
  isModalOpen.value = true;
};

const saveStore = () => {
  formSubmitted.value = true;
  if (!newStore.name || !newStore.address) {
    toastStore.showToast('매장명과 주소는 필수입니다.', 'danger');
    return;
  }

  if (isEditing.value) {
    storeStore.updateStore(newStore);
    toastStore.showToast('매장 정보가 수정되었습니다.', 'success');
  } else {
    storeStore.addStore(newStore);
    toastStore.showToast('새 매장이 등록되었습니다.', 'success');
  }
  isModalOpen.value = false;
  Object.assign(newStore, { id: null, name: '', address: '', owner: '', phone: '', status: '운영중' });
};

const deleteStore = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 매장을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    storeStore.deleteStore(id);
    toastStore.showToast('매장이 삭제되었습니다.', 'success');
  }
};

const downloadPdf = () => {
  const doc = new jsPDF();
  doc.addFileToVFS('NanumGothic.ttf', nanumGothic);
  doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
  doc.setFont('NanumGothic');
  doc.text("전체 매장 목록", 14, 16);
  const tableColumn = ["ID", "매장명", "주소", "점주", "연락처", "상태"];
  const tableRows = [];
  storeStore.allStores.forEach(store => {
    const storeData = [
      store.id,
      store.name,
      store.address,
      store.owner,
      store.phone,
      store.status
    ];
    tableRows.push(storeData);
  });
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { font: 'NanumGothic', fontStyle: 'normal' },
  });
  doc.save('store-report.pdf');
};
</script>

<template>
  <div>
    <StoreList 
      :stores="paginatedStores" 
      :totalStores="filteredAndSortedStores.length"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      :searchTerm="searchTerm"
      :filterStatus="filterStatus"
      @add-store="openAddStoreModal"
      @download-pdf="downloadPdf"
      @update:search-term="updateSearchTerm"
      @update:filter-status="updateFilterStatus"
      @update:sort="updateSort"
      @update:page="updatePage"
      @delete-store="deleteStore"
    />

    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '매장 수정' : '신규 매장 등록' }}</h5></template>
      
      <form @submit.prevent="saveStore">
        <div class="mb-3">
          <label for="newStoreName" class="form-label">매장명 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="newStoreName" v-model="newStore.name" :class="{ 'is-invalid': !newStore.name && formSubmitted }">
          <div class="invalid-feedback">매장명은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label for="newStoreAddress" class="form-label">주소 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="newStoreAddress" v-model="newStore.address" :class="{ 'is-invalid': !newStore.address && formSubmitted }">
          <div class="invalid-feedback">주소는 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label for="newStoreOwner" class="form-label">점주</label>
          <input type="text" class="form-control" id="newStoreOwner" v-model="newStore.owner">
        </div>
        <div class="mb-3">
          <label for="newStorePhone" class="form-label">연락처</label>
          <input type="text" class="form-control" id="newStorePhone" v-model="newStore.phone">
        </div>
        <div class="mb-3" v-if="isEditing">
          <label for="newStoreStatus" class="form-label">상태</label>
          <select class="form-select" id="newStoreStatus" v-model="newStore.status">
            <option>운영중</option>
            <option>휴점</option>
          </select>
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveStore">저장</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
