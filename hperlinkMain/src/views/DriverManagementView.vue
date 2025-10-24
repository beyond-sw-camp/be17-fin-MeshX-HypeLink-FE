
<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import draggable from 'vuedraggable';
import { useToastStore } from '@/stores/toast';
import { useDriverStore } from '@/stores/drivers'; // Import the new driver store
import BaseSpinner from '@/components/BaseSpinner.vue'; // Import spinner
import BaseModal from '@/components/BaseModal.vue'; // Import modal
import { useModalStore } from '@/stores/modal'; // Import modal store

const toastStore = useToastStore();
const driverStore = useDriverStore(); // Initialize the driver store
const modalStore = useModalStore(); // Initialize the modal store

const isModalOpen = ref(false);
const newDriverDefaults = {
  name: '',
  email: '',
  password: '',
  phone: '',
  carNumber: '',
  macAddress: '',
  region: 'SEOUL_GYEONGGI',
  role: 'DRIVER'
};
const newDriver = reactive({ ...newDriverDefaults });

// --- Helper Functions ---
const getRegionBadgeClass = (region) => {
  switch (region) {
    case '서울/경기': return 'bg-primary';
    case '강원': return 'bg-success';
    case '충청': return 'bg-info text-dark';
    case '경상': return 'bg-warning text-dark';
    case '전라': return 'bg-danger';
    case '제주': return 'bg-dark';
    default: return 'bg-secondary';
  }
};

// --- Mock Data for unassigned parcels (remains as is for now) ---


// --- Fetch Real Driver Data ---
onMounted(async () => {
  await driverStore.fetchDrivers();
  await driverStore.fetchUnassignedParcelsAction();
  await driverStore.fetchAssignedParcelsAction();
});

// --- Drag and Drop Logic ---
const handleParcelDrop = async (driver, event) => {
  const droppedParcel = event.added.element;
  
  try {
    const result = await driverStore.assignShipmentToDriver(droppedParcel.shipmentId, driver.id);
    if (result.success) {
      toastStore.showToast(`'${droppedParcel.content}' 배송 건이 ${driver.name}에게 할당되었습니다.`, 'success');
    } else {
      toastStore.showToast(result.message || '택배 배정에 실패했습니다.', 'danger');
    }
  } catch (error) {
    console.error('Error assigning shipment:', error);
    toastStore.showToast('택배 배정 중 오류가 발생했습니다.', 'danger');
  }
};

const openAddDriverModal = () => {
  Object.assign(newDriver, newDriverDefaults);
  isModalOpen.value = true;
};

const handleAddDriver = async () => {
  // Basic validation
  if (!newDriver.name || !newDriver.email || !newDriver.password || !newDriver.phone || !newDriver.carNumber) {
    toastStore.showToast('모든 필수 항목을 입력해주세요.', 'danger');
    return;
  }
  try {
    await driverStore.addDriver(newDriver);
    isModalOpen.value = false;
    toastStore.showToast('새로운 기사가 성공적으로 추가되었습니다.', 'success');
  } catch (error) {
    toastStore.showToast(error.message || '기사 추가 중 오류가 발생했습니다.', 'danger');
  }
};

const handleDeleteDriver = async (driver) => {
  const confirmed = await modalStore.show({
    title: '기사 삭제 확인',
    message: `정말 '${driver.name}' 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    isConfirmation: true,
  });

  if (confirmed) {
    try {
      await driverStore.deleteDriver(driver.id);
      toastStore.showToast(`'${driver.name}' 기사가 삭제되었습니다.`, 'success');
    } catch (error) {
      toastStore.showToast(error.message || '기사 삭제 중 오류가 발생했습니다.', 'danger');
    }
  }
};

</script>

<template>
  <div>
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">드래그 앤 드롭 배차 관리</h4>
      <p>왼쪽의 '미배정 택배 목록'에서 택배(송장)를 드래그하여 오른쪽의 담당 기사 카드 위로 옮겨 배송을 배정할 수 있습니다.</p>
    </div>

    <div class="row">
      <!-- Unassigned Parcels List -->
      <div class="col-md-5">
        <BaseCard>
          <template #header><h5>미배정 택배 목록</h5></template>
          <draggable 
            :list="driverStore.unassignedParcels"
            group="parcels"
            item-key="id"
            class="parcel-list"
          >
            <template #item="{element}">
              <div class="parcel-item list-group-item">
                <div class="fw-bold">{{ element.trackingNumber }}</div>
                <div class="small text-muted">{{ element.from }} -> {{ element.to }}</div>
                <div class="small">{{ element.content }} ({{ element.quantity }}개)</div>
              </div>
            </template>
          </draggable>
          <div v-if="driverStore.unassignedParcels.length === 0" class="text-center text-muted p-5">
            배정할 택배가 없습니다.
          </div>
        </BaseCard>
      </div>

      <!-- Drivers List -->
      <div class="col-md-7">
        <BaseCard>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">배송 기사 목록</h5>
              <button class="btn btn-primary btn-sm" @click="openAddDriverModal">+ 기사 추가</button>
            </div>
          </template>
          <BaseSpinner v-if="driverStore.isLoading" />
          <div v-else class="driver-grid">
            <div v-for="driver in driverStore.drivers" :key="driver.id" class="driver-card">
              <BaseCard :title="driver.name">
                <template #header>
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-0">{{ driver.name }}</h6>
                    <div>
                      <span class="badge me-2" :class="getRegionBadgeClass(driver.region)">{{ driver.region }}</span>
                      <button class="btn btn-outline-danger btn-sm py-0 px-1" @click="handleDeleteDriver(driver)">삭제</button>
                    </div>
                  </div>
                  <div class="small text-muted">{{ driver.carNumber }}</div>
                </template>
                
                <draggable
                  :list="driver.assignedParcels"
                  group="parcels"
                  item-key="id"
                  class="drop-zone border rounded p-2 mt-2"
                  @add="handleParcelDrop(driver, $event)"
                >
                  <template #header>
                    <p v-if="driver.assignedParcels.length === 0" class="text-center text-muted small mb-0 p-4">
                      이곳으로 택배를 드래그하세요
                    </p>
                  </template>
                  <template #item="{element}">
                    <div class="assigned-parcel bg-white border-start border-5 border-primary rounded p-2 mb-2 shadow-sm">
                      <div class="fw-bold">{{ element.trackingNumber }}</div>
                      <div class="small text-muted">{{ element.from }} -> {{ element.to }}</div>
                      <div class="small">{{ element.content }} ({{ element.quantity }}개)</div>
                    </div>
                  </template>
                </draggable>
              </BaseCard>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Add Driver Modal -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>신규 배송기사 등록</h5></template>
      <form @submit.prevent="handleAddDriver">
        <div class="mb-3">
          <label class="form-label">이름 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newDriver.name">
        </div>
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="newDriver.email">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newDriver.password">
        </div>
        <div class="mb-3">
          <label class="form-label">전화번호 <span class="text-danger">*</span></label>
          <input type="tel" class="form-control" v-model="newDriver.phone">
        </div>
        <div class="mb-3">
          <label class="form-label">차량 번호 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newDriver.carNumber">
        </div>
        <div class="mb-3">
          <label class="form-label">MAC 주소</label>
          <input type="text" class="form-control" v-model="newDriver.macAddress">
        </div>
        <div class="mb-3">
          <label class="form-label">담당 지역 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="newDriver.region">
            <option value="SEOUL_GYEONGGI">서울/경기</option>
            <option value="GANGWON">강원</option>
            <option value="CHUNGCHEONG">충청</option>
            <option value="GYEONGSANG">경상</option>
            <option value="JEOLLA">전라</option>
            <option value="JEJU">제주</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleAddDriver">추가하기</button>
      </template>
    </BaseModal>

  </div>
</template>

<style scoped>
.parcel-list {
  min-height: 100px;
}
.parcel-item {
  cursor: grab;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: .25rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 0.5rem;
}
.parcel-item:hover {
  background-color: #e9ecef;
}

.driver-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.drop-zone {
  min-height: 150px;
  background-color: #f0f8ff;
  transition: background-color 0.2s ease;
}

.drop-zone.sortable-ghost {
  background-color: #d4edda; /* Color when dragging over */
}

.assigned-parcel {
  cursor: default;
}
</style>
