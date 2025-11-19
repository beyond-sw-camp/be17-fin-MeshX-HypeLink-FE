<script setup>
import { onMounted, watch, ref, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useMyStore } from '@/stores/store';
import { useModalStore } from '@/stores/modal';
import { useToastStore } from '@/stores/toast';
import { updateStoreState } from '@/api/users';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseModal from '@/components/BaseModal.vue';

const myStore = useMyStore();
const route = useRoute();
const modalStore = useModalStore();
const toastStore = useToastStore();

const showStateChangeModal = ref(false);
const targetState = ref(null);
const targetStateText = ref('');

const isAddPosModalOpen = ref(false);
const formSubmitted = ref(false);
const newPosDefaults = { email: '', password: '', posCode: '', name: '' };
const newPos = reactive({ ...newPosDefaults });

const storeId = computed(() => route.params.id || myStore.storeDetails?.id);

const stateMap = {
  OPEN: '영업 중',
  CLOSED: '영업 종료',
  TEMP_CLOSED: '휴점'
};

const storeStateText = computed(() => {
  const state = myStore.storeDetails?.storeState;
  return stateMap[state] || state;
});

const statusClass = (statusText) => {
  switch (statusText) {
    case '영업 중': return 'bg-success';
    case '영업 종료': return 'bg-danger';
    case '휴점': return 'bg-warning';
    default: return 'bg-secondary';
  }
};

const fetchDataForRoute = (id) => {
  myStore.fetchMyStoreData(id);
};

const promptStateChange = (state, text) => {
  targetState.value = state;
  targetStateText.value = text;
  showStateChangeModal.value = true;
};

const handleStateChange = async () => {
  if (!storeId.value || !targetState.value) return;

  showStateChangeModal.value = false;
  const result = await updateStoreState(storeId.value, { storeState: targetState.value });

  if (result.success) {
    toastStore.showToast('점포 상태가 성공적으로 변경되었습니다.', 'success');
    // 페이지를 새로고침하는 대신, 데이터를 다시 불러와 화면을 업데이트합니다.
    fetchDataForRoute(storeId.value);
  } else {
    toastStore.showToast(result.message || '상태 변경에 실패했습니다.', 'danger');
  }
};

const openAddPosModal = () => {
  Object.assign(newPos, newPosDefaults);
  formSubmitted.value = false;
  isAddPosModalOpen.value = true;
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
    posCode: newPos.posCode,
    role: 'POS_MEMBER',
    storeId: myStore.storeDetails?.id,
  };

  const success = await myStore.addPosDevice(payload);

  if (success) {
    toastStore.showToast('새로운 POS 기기가 등록되었습니다.', 'success');
    isAddPosModalOpen.value = false;
  } else {
    toastStore.showToast('POS 기기 등록에 실패했습니다.', 'danger');
  }
};

const handleDeletePos = async (pos) => {
  const confirmed = await modalStore.show({
    title: 'POS 삭제 확인',
    message: `정말 '${pos.name}' POS 기기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    isConfirmation: true,
  });

  if (confirmed) {
    const success = await myStore.deletePosDevice(pos.id);
    if (success) {
      toastStore.showToast('POS 기기가 삭제되었습니다.', 'success');
    } else {
      toastStore.showToast('POS 기기 삭제에 실패했습니다.', 'danger');
    }
  }
};

onMounted(() => {
  fetchDataForRoute(route.params.id);
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchDataForRoute(newId);
  }
});
</script>

<template>
  <div>
    <BaseSpinner v-if="myStore.isLoading" />

    <div v-else>
      <!-- Store Details Card -->
      <BaseCard v-if="myStore.storeDetails" class="mb-4">
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">점포 정보</h5>
          </div>
        </template>
        <div class="row">
          <div class="col-md-6">
            <p><strong>가게명:</strong> {{ myStore.storeDetails.name }}</p>
            <p><strong>주소:</strong> {{ myStore.storeDetails.address }}</p>
          </div>
          <div class="col-md-6">
            <p><strong>지역:</strong> {{ myStore.storeDetails.region }}</p>
            <div class="d-flex align-items-center">
              <strong class="me-2">상태:</strong>
              <span class="badge fs-6 me-3" :class="statusClass(storeStateText)">{{ storeStateText }}</span>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  상태 변경
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click.prevent="promptStateChange('OPEN', '영업 중')">영업 중</a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="promptStateChange('CLOSED', '영업 종료')">영업 종료</a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="promptStateChange('TEMP_CLOSED', '휴점')">휴점</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- POS Devices Card -->
      <BaseCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">POS 기기 목록</h5>
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
              <tr v-for="pos in myStore.posDevices" :key="pos.id">
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
        <p v-if="myStore.posDevices.length === 0" class="text-center text-muted mt-3">등록된 POS 기기가 없습니다.</p>
      </BaseCard>
    </div>

    <!-- State Change Confirmation Modal -->
    <BaseModal v-model="showStateChangeModal" size="sm">
      <template #header>
        <h5 class="modal-title">상태 변경 확인</h5>
      </template>
      <p>점포 상태를 '{{ targetStateText }}'(으)로 변경하시겠습니까?</p>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showStateChangeModal = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleStateChange">변경</button>
      </template>
    </BaseModal>

    <!-- Add POS Modal -->
    <BaseModal v-model="isAddPosModalOpen">
      <template #header><h5>새 POS 기기 등록</h5></template>
      <form @submit.prevent="handleAddPos">
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="newPos.email" :class="{ 'is-invalid': formSubmitted && !newPos.email }" placeholder="예: pos01@example.com">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newPos.password" :class="{ 'is-invalid': formSubmitted && !newPos.password }" placeholder="비밀번호">
        </div>
        <div class="mb-3">
          <label class="form-label">이름 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newPos.name" :class="{ 'is-invalid': formSubmitted && !newPos.name }" placeholder="예: 카운터 POS">
        </div>
        <div class="mb-3">
          <label class="form-label">POS 코드 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newPos.posCode" :class="{ 'is-invalid': formSubmitted && !newPos.posCode }" placeholder="POS코드 입력 예: POS123_12">
          <div class="form-text">대문자3자리+숫자3자리+언더스코어+숫자2자리 형식이어야 합니다.
            POSCode 지점에서 사용할 고유한 POS기 번호 입니다.</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddPosModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleAddPos">추가하기</button>
      </template>
    </BaseModal>
  </div>
</template>

