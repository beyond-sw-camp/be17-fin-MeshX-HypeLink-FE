<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { usePosManagementStore } from '@/stores/store';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import usersApi from '@/api/users';
import authApi from '@/api/auth';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const posStore = usePosManagementStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const modalStore = useModalStore();

const isModalOpen = ref(false);
const formSubmitted = ref(false);
const isLoading = ref(false);

// Branch Manager용 state
const myStoreData = ref(null);

// --- Data Model for New POS ---
const newPosDefaults = { email: '', password: '', posCode: '', name: '' };
const newPos = reactive({ ...newPosDefaults });

// 현재 선택된/표시중인 지점과 POS 기기 목록 (role에 따라 다른 소스 사용)
const currentStore = computed(() => {
  if (authStore.isBranchManager) {
    return myStoreData.value;
  } else {
    return posStore.selectedStore;
  }
});

const currentPosDevices = computed(() => {
  if (authStore.isBranchManager) {
    return myStoreData.value?.posDevices || [];
  } else {
    return posStore.posDevices;
  }
});

const currentStoreId = computed(() => {
  if (authStore.isBranchManager) {
    return myStoreData.value?.id || null;
  } else {
    return posStore.selectedStoreId;
  }
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  if (authStore.isBranchManager) {
    // 지점장인 경우 자기 지점 정보만 가져오기
    await fetchMyStore();
  } else {
    // 총관리자/중간관리자인 경우 모든 지점 정보 가져오기
    await posStore.fetchData();
  }
});

// 지점장용: 자기 지점 정보 가져오기
const fetchMyStore = async () => {
  isLoading.value = true;
  try {
    const response = await usersApi.getMyStore();
    if (response.success && response.data) {
      myStoreData.value = response.data;
    } else {
      console.error("Failed to fetch my store data:", response.message);
      myStoreData.value = null;
    }
  } catch (error) {
    console.error("Error fetching my store data:", error);
  } finally {
    isLoading.value = false;
  }
};

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
    posCode: newPos.posCode,
    role: 'POS_MEMBER',
    storeId: currentStoreId.value,
  };

  try {
    const response = await authApi.registerUser(payload);
    if (response.success) {
      toastStore.showToast('새로운 POS 기기가 등록되었습니다.', 'success');
      isModalOpen.value = false;
      // 데이터 새로고침
      if (authStore.isBranchManager) {
        await fetchMyStore();
      } else {
        await posStore.fetchData();
      }
    } else {
      toastStore.showToast('POS 기기 등록에 실패했습니다.', 'danger');
    }
  } catch (error) {
    console.error('Error adding POS:', error);
    toastStore.showToast('POS 기기 등록 중 오류가 발생했습니다.', 'danger');
  }
};

const handleDeletePos = async (pos) => {
  const confirmed = await modalStore.show({
    title: 'POS 삭제 확인',
    message: `정말 \'${pos.name}\' POS 기기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    isConfirmation: true,
  });

  if (confirmed) {
    try {
      const response = await usersApi.deletePos(pos.id);
      if (response.success) {
        toastStore.showToast('POS 기기가 삭제되었습니다.', 'success');
        // 데이터 새로고침
        if (authStore.isBranchManager) {
          await fetchMyStore();
        } else {
          await posStore.fetchData();
        }
      } else {
        toastStore.showToast('POS 기기 삭제에 실패했습니다.', 'danger');
      }
    } catch (error) {
      console.error('Error deleting POS:', error);
      toastStore.showToast('POS 기기 삭제 중 오류가 발생했습니다.', 'danger');
    }
  }
};

</script>

<template>
  <div>
    <!-- Store Selector Card (총관리자/중간관리자만 표시) -->
    <BaseCard v-if="!authStore.isBranchManager" class="mb-4">
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

    <div v-if="currentStoreId">
      <BaseSpinner v-if="isLoading || posStore.isLoading" />

      <!-- POS Devices Card -->
      <BaseCard v-else>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">'{{ currentStore.name }}' POS 기기 목록</h5>
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
              <tr v-for="pos in currentPosDevices" :key="pos.id">
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
        <p v-if="currentPosDevices.length === 0" class="text-center text-muted mt-3">등록된 POS 기기가 없습니다.</p>
      </BaseCard>
    </div>

    <div v-else-if="!authStore.isBranchManager" class="text-center text-muted">
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