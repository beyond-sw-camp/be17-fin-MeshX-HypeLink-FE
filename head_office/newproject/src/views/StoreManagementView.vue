<template>
  <div>
    <StoreList :stores="stores" @add-store="openAddStoreModal" />

    <BaseModal v-model="isModalOpen">
      <template #header><h5>신규 매장 등록</h5></template>
      
      <form @submit.prevent="addNewStore">
        <div class="mb-3">
          <label for="newStoreName" class="form-label">매장명</label>
          <input type="text" class="form-control" id="newStoreName" v-model="newStore.name">
        </div>
        <div class="mb-3">
          <label for="newStoreAddress" class="form-label">주소</label>
          <input type="text" class="form-control" id="newStoreAddress" v-model="newStore.address">
        </div>
        <div class="mb-3">
          <label for="newStoreOwner" class="form-label">점주</label>
          <input type="text" class="form-control" id="newStoreOwner" v-model="newStore.owner">
        </div>
        <div class="mb-3">
          <label for="newStorePhone" class="form-label">연락처</label>
          <input type="text" class="form-control" id="newStorePhone" v-model="newStore.phone">
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addNewStore">등록하기</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import StoreList from './store-management/StoreList.vue';
import BaseModal from '@/components/BaseModal.vue';

const stores = ref([
  { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', owner: '최민성', phone: '010-1234-5678', status: '운영중' },
  { id: 2, name: 'HypeLink 홍대점', address: '서울시 마포구 양화로', owner: '강병욱', phone: '010-2345-6789', status: '운영중' },
  { id: 3, name: 'HypeLink 부산점', address: '부산시 해운대구', owner: '김성인', phone: '010-3456-7890', status: '휴점' },
  { id: 4, name: 'HypeLink 제주점', address: '제주시 첨단로', owner: '이시욱', phone: '010-4567-8901', status: '운영중' },
]);

const isModalOpen = ref(false);
const newStore = reactive({
  name: '',
  address: '',
  owner: '',
  phone: ''
});

const openAddStoreModal = () => {
  isModalOpen.value = true;
};

const addNewStore = () => {
  if (!newStore.name || !newStore.address) {
    alert('매장명과 주소는 필수입니다.');
    return;
  }
  stores.value.push({
    id: stores.value.length + 5, // 임시 ID
    ...newStore,
    status: '운영중'
  });
  isModalOpen.value = false;
  // 폼 초기화
  Object.assign(newStore, { name: '', address: '', owner: '', phone: '' });
};

const downloadPdf = () => {
  const doc = new jsPDF();

  // 한글 폰트 추가
  doc.addFileToVFS('NanumGothic.ttf', nanumGothic);
  doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
  doc.setFont('NanumGothic');

  doc.text("전체 매장 목록", 14, 16);

  const tableColumn = ["ID", "매장명", "주소", "점주", "연락처", "상태"];
  const tableRows = [];

  stores.value.forEach(store => {
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
