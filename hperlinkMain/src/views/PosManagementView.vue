<script setup>
import { ref, reactive, onMounted } from 'vue';
import { usePosManagementStore } from '@/stores/store';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const posStore = usePosManagementStore();
const toastStore = useToastStore();
const modalStore = useModalStore();

const isModalOpen = ref(false);
const formSubmitted = ref(false);

// --- Data Model for New POS ---
const newPosDefaults = { email: '', password: '', posCode: '', name: '' };
const newPos = reactive({ ...newPosDefaults });

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch all data once when the component mounts
  await posStore.fetchData();
});

// --- Methods ---
const openAddPosModal = () => {
  Object.assign(newPos, newPosDefaults);
  formSubmitted.value = false;
  isModalOpen.value = true;
};

const handleAddPos = async () => {
  formSubmitted.value = true;
  if (!newPos.email || !newPos.password || !newPos.posCode || !newPos.name) {
    toastStore.showToast('이메일, 비밀번호, 이름, POS 코드를 모두 입력해주세요.', 'danger');
    return;
  }

  const payload = {
    email: newPos.email,
    password: newPos.password,
    name: newPos.name,
    posCode: newPos.posCode, // Assuming RegisterReqDto can carry posCode
    role: 'POS_MEMBER',
    storeId: posStore.selectedStoreId,
    // Region will be derived from the selected store's manager in the backend
  };

  const success = await posStore.addPosDevice(payload);

  if (success) {
    toastStore.showToast('새로운 POS 기기가 등록되었습니다.', 'success');
    isModalOpen.value = false;
  } else {
    toastStore.showToast('POS 기기 등록에 실패했습니다.', 'danger');
  }
};

const handleDeletePos = async (pos) => {
  const confirmed = await modalStore.show({
    title: 'POS 삭제 확인',
    message: `정말 \'${pos.name}\' POS 기기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    isConfirmation: true,
  });

  if (confirmed) {
    const success = await posStore.deletePosDevice(pos.id);
    if (success) {
      toastStore.showToast('POS 기기가 삭제되었습니다.', 'success');
    } else {
      toastStore.showToast('POS 기기 삭제에 실패했습니다.', 'danger');
    }
  }
};

</script>

<template>
  <div>
    <!-- Store Selector Card -->
    <BaseCard class="mb-4">
      <template #header><h5>지점 선택</h5></template>
      <div class="row align-items-center">
        <div class="col-md-4">
          <label for="storeSelector" class="form-label">관리할 지점을 선택하세요.</label>
          <select id="storeSelector" class="form-select" v-model="posStore.selectedStoreId">
            <option :value="null" disabled>-- 지점 선택 --</option>
            <option v-for="store in posStore.selectableStores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
      </div>
    </BaseCard>

    <div v-if="posStore.selectedStoreId">
      <BaseSpinner v-if="posStore.isLoading" />
      
      <!-- POS Devices Card -->
      <BaseCard v-else>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">'{{ posStore.selectedStore.name }}' POS 기기 목록</h5>
            <button class="btn btn-primary" @click="openAddPosModal">+ POS 추가</button>
          </div>
        </template>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>POS 코드</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pos in posStore.posDevices" :key="pos.id">
                <td>{{ pos.name }}</td>
                <td>{{ pos.email }}</td>
                <td>{{ pos.posCode }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="handleDeletePos(pos)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="posStore.posDevices.length === 0" class="text-center text-muted mt-3">등록된 POS 기기가 없습니다.</p>
      </BaseCard>
    </div>

    <div v-else class="text-center text-muted">
      <p>먼저 관리할 지점을 선택해주세요.</p>
    </div>

    <!-- Add POS Modal -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>새 POS 기기 등록</h5></template>
      <form @submit.prevent="handleAddPos">
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" id="posEmail" v-model="newPos.email" :class="{ 'is-invalid': formSubmitted && !newPos.email }" placeholder="예: pos01@example.com">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" id="posPassword" v-model="newPos.password" :class="{ 'is-invalid': formSubmitted && !newPos.password }" placeholder="비밀번호">
        </div>
        <div class="mb-3">
          <label class="form-label">이름 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="posName" v-model="newPos.name" :class="{ 'is-invalid': formSubmitted && !newPos.name }" placeholder="예: 카운터 POS">
        </div>
        <div class="mb-3">
          <label class="form-label">POS 코드 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="posCode" v-model="newPos.posCode" :class="{ 'is-invalid': formSubmitted && !newPos.posCode }" placeholder="예: 01, 02">
          <div class="form-text">해당 지점 내에서 사용할 고유한 코드를 입력하세요. (예: 01)</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleAddPos">추가하기</button>
      </template>
    </BaseModal>

  </div>
</template>