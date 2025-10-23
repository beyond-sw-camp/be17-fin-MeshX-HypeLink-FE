<script setup>
import { onMounted, watch, ref, computed } from 'vue';
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

      <!-- POS Devices Card (Read-only) -->
      <BaseCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">POS 기기 목록</h5>
          </div>
        </template>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>POS 코드</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pos in myStore.posDevices" :key="pos.id">
                <td>{{ pos.name }}</td>
                <td>{{ pos.email }}</td>
                <td>{{ pos.posCode }}</td>
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
  </div>
</template>

