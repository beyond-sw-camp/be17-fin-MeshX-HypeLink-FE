<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import StoreList from './store-management/StoreList.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useStoreStore } from '@/stores/stores';
import authApi from '@/api/auth'; 
import usersApi from '@/api/users'; // usersApi import 추가
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
  email: '',
  password: '',
  member_name: '',
  phone: '',
  region: 'SEOUL_GYEONGGI',
  storeNumber: ''
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 ---
onMounted(async () => {
  isLoading.value = true;
  try {
    await storeStore.fetchStores();
  } catch (error) {
    console.error('Failed to fetch stores on mount:', error);
    toastStore.showToast('매장 목록을 불러오는 데 실패했습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedStores = computed(() => {
  let stores = [...storeStore.allStores];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    stores = stores.filter(store => 
      store.name.toLowerCase().includes(term) || 
            store.member.address.toLowerCase().includes(term)
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

const openAddStoreModal = async (store = null) => {
  formSubmitted.value = false;
  if (store) {
    isEditing.value = true;
    // API 호출하여 최신 상세 정보 가져오기
    const response = await usersApi.getStoreInfoForEdit(store.id);
    if (response.success && response.data) {
      Object.assign(newStore, {
        id: store.id, // ID는 URL에서 가져온 store.id 사용
        name: response.data.name || '',
        address: response.data.address || '',
        email: '', // 이메일은 수정 불가이므로 비워둠
        password: '', // 비밀번호는 수정 불가이므로 비워둠
        member_name: '', // 이름은 수정 불가이므로 비워둠
        phone: response.data.phone || '',
        region: response.data.region || 'SEOUL_GYEONGGI',
        storeNumber: response.data.storeNumber || '',
      });
    } else {
      toastStore.showToast(response.message || '매장 상세 정보를 불러오는데 실패했습니다.', 'danger');
      isModalOpen.value = false; // 실패 시 모달 닫기
      return;
    }
  } else {
    isEditing.value = false;
    Object.assign(newStore, {
      id: null,
      name: '',
      address: '',
      email: '',
      password: '',
      member_name: '',
      phone: '',
      region: 'SEOUL_GYEONGGI',
      storeNumber: '',
    });
  }
  isModalOpen.value = true;
};

const saveStore = async () => {
  formSubmitted.value = true;

  if (isEditing.value) {
    // [수정 모드] 매장명, 주소, 연락처, 지역, 매장 번호만 검증
    if (!newStore.name || !newStore.address || !newStore.phone || !newStore.region || !newStore.storeNumber) {
      toastStore.showToast('매장명, 주소, 점주 연락처, 지역, 매장 번호는 필수입니다.', 'danger');
      return;
    }

    // TODO: 사용자가 백엔드에 매장 정보 수정 API를 구현해야 합니다.
    const response = await usersApi.updateStoreInfo(newStore.id, newStore);
    if (response.success) {
      toastStore.showToast('매장 정보가 성공적으로 수정되었습니다.', 'success');
      await storeStore.fetchStores(); // 목록 새로고침
    } else {
      toastStore.showToast(response.message || '매장 정보 수정에 실패했습니다.', 'danger');
    }

  } else {
    // [생성 모드] 모든 필수 필드 검증
    if (!newStore.name || !newStore.address || !newStore.email || !newStore.password || !newStore.member_name || !newStore.phone || !newStore.region || !newStore.storeNumber) {
      toastStore.showToast('모든 필수 항목을 입력해주세요.', 'danger');
      return;
    }

    const payload = {
      email: newStore.email,
      password: newStore.password,
      name: newStore.member_name, // Member's name
      phone: newStore.phone,
      address: newStore.address,
      role: 'BRANCH_MANAGER', // Hardcoded role
      region: newStore.region,
      storeNumber: newStore.storeNumber,
    };

    try {
      const response = await authApi.registerUser(payload);
      if (response.success) {
        toastStore.showToast('새 매장(지점장)이 등록되었습니다.', 'success');
        await storeStore.fetchStores(); // Refresh store list
      } else {
        toastStore.showToast(response.message || '매장 등록에 실패했습니다.', 'danger');
      }
    } catch (error) {
      toastStore.showToast('매장 등록 중 오류가 발생했습니다.', 'danger');
      console.error('Store registration error:', error);
    }
  }

  isModalOpen.value = false;
  Object.assign(newStore, newStoreDefaults);
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
  const tableColumn = ["ID", "매장명", "주소", "점주 이름", "연락처", "상태"];
  const tableRows = [];
  storeStore.allStores.forEach(store => {
    const storeData = [
      store.id,
      store.name,
      store.member.address,
      store.member_name,
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
        <div v-if="!isEditing">
          <div class="mb-3">
            <label for="newStoreEmail" class="form-label">이메일 <span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="newStoreEmail" v-model="newStore.email" :class="{ 'is-invalid': !newStore.email && formSubmitted }">
          </div>
          <div class="mb-3">
            <label for="newStorePassword" class="form-label">비밀번호 <span class="text-danger">*</span></label>
            <input type="password" class="form-control" id="newStorePassword" v-model="newStore.password" :class="{ 'is-invalid': !newStore.password && formSubmitted }">
          </div>
          <div class="mb-3">
            <label for="newStoreMemberName" class="form-label">이름 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="newStoreMemberName" v-model="newStore.member_name" :class="{ 'is-invalid': !newStore.member_name && formSubmitted }">
          </div>
        </div>
        <div class="mb-3">
          <label for="newStorePhone" class="form-label">점주 연락처 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="newStorePhone" v-model="newStore.phone" :class="{ 'is-invalid': !newStore.phone && formSubmitted }">
        </div>
        <div class="mb-3">
          <label for="newStoreRegion" class="form-label">지역 <span class="text-danger">*</span></label>
          <select class="form-select" id="newStoreRegion" v-model="newStore.region" :class="{ 'is-invalid': !newStore.region && formSubmitted }">
            <option value="SEOUL_GYEONGGI">서울/경기</option>
            <option value="GANGWON">강원</option>
            <option value="CHUNGCHEONG">충청</option>
            <option value="GYEONGSANG">경상</option>
            <option value="JEOLLA">전라</option>
            <option value="JEJU">제주</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="newStoreNumber" class="form-label">매장 번호 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="newStoreNumber" v-model="newStore.storeNumber" :class="{ 'is-invalid': !newStore.storeNumber && formSubmitted }">
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
