<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import draggable from 'vuedraggable';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useDriverStore } from '@/stores/drivers';

const toastStore = useToastStore();
const modalStore = useModalStore();
const driverStore = useDriverStore();

const isLoading = ref(true);

const regions = ref([
  '서울/경기', '강원', '충청', '경상', '전라', '제주'
]);

const isAddDriverModalOpen = ref(false);
const formSubmitted = ref(false);

const newDriverDefaults = {
  name: '',
  phone: '',
  region: '',
  email: '',
  password: '',
  carNumber: ''
};
const newDriver = reactive({ ...newDriverDefaults });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 ---
onMounted(async () => {
  try {
    await driverStore.fetchDrivers();
  } finally {
    isLoading.value = false;
  }
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedDrivers = computed(() => {
  let drivers = [...driverStore.allDrivers];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    drivers = drivers.filter(driver => 
      driver.name.toLowerCase().includes(term) || 
      driver.phone.toLowerCase().includes(term) ||
      driver.region.toLowerCase().includes(term)
    );
  }

  if (sortKey.value) {
    drivers.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return drivers;
});

// --- 페이지네이션 로직 ---
const paginatedDrivers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedDrivers.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedDrivers.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const handleDriverDrop = (store, event) => {
  const droppedDriverId = event.item.dataset.id;
  const droppedDriver = driverStore.allDrivers.find(d => d.id == droppedDriverId) || 
                      driverStore.stores.flatMap(s => s.drivers).find(d => d.id == droppedDriverId);

  if (!droppedDriver) return;

  driverStore.assignDriverToStore(droppedDriver, store);
  toastStore.showToast(`${droppedDriver.name} 기사가 ${store.name}에 배정되었습니다.`, 'success');
};

const unassignDriver = (store, driver) => {
  driverStore.unassignDriver(store, driver);
  toastStore.showToast(`${driver.name} 기사가 ${store.name}에서 해제되었습니다.`, 'info');
};

const addDriver = () => {
  formSubmitted.value = true;
  if (!newDriver.name || !newDriver.phone || !newDriver.region || !newDriver.email || !newDriver.password || !newDriver.carNumber) {
    toastStore.showToast('모든 필드를 입력해주세요.', 'danger');
    return;
  }
  driverStore.addDriver(newDriver);
  toastStore.showToast('새 기사가 추가되었습니다.', 'success');
  Object.assign(newDriver, newDriverDefaults);
  isAddDriverModalOpen.value = false;
};

const deleteDriver = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 기사를 삭제하시겠습니까?',
    isConfirmation: true,
  });

  if (confirmed) {
    driverStore.deleteDriver(id);
    toastStore.showToast('기사가 삭제되었습니다.', 'success');
  }
};
</script>

<template>
  <div>
    <div class="alert alert-info">'기사 목록'의 기사를 드래그하여 오른쪽 '직영점 목록'의 매장 위로 옮겨 배정할 수 있습니다.</div>
    <div class="row">
      <!-- 기사 목록 -->
      <div class="col-md-5">
        <BaseCard>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">배송 기사 목록</h5>
              <div class="d-flex">
                <input type="text" class="form-control form-control-sm me-2" placeholder="기사명/지역 검색" v-model="searchTerm">
                <button class="btn btn-primary btn-sm" @click="isAddDriverModalOpen = true">+ 기사 추가</button>
              </div>
            </div>
          </template>
          
          <div v-if="paginatedDrivers.length > 0">
            <draggable 
              :list="paginatedDrivers"
              group="drivers"
              item-key="id"
              class="list-group"
            >
              <template #item="{element}">
                <div class="list-group-item d-flex justify-content-between align-items-center" :data-id="element.id">
                  <div>
                    <h6 class="mb-0">{{ element.name }}</h6>
                    <small class="text-muted">{{ element.phone }} / {{ element.carNumber }}</small>
                  </div>
                  <div>
                    <span class="badge bg-primary rounded-pill me-2">{{ element.region }}</span>
                    <button class="btn btn-sm btn-danger py-0 px-1" @click="deleteDriver(element.id)">X</button>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- 페이지네이션 -->
            <nav v-if="totalPages > 1">
              <ul class="pagination justify-content-center mt-3">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
                </li>
                <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
                  <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
                </li>
              </ul>
            </nav>
          </div>
          <BaseEmptyState v-else message="조회된 기사가 없습니다." />
        </BaseCard>
      </div>

      <!-- 직영점 목록 -->
      <div class="col-md-7">
        <BaseCard>
          <template #header><h5>직영점 목록</h5></template>
          <div class="list-group">
            <div v-for="store in driverStore.stores" :key="store.id" class="list-group-item">
              <h6 class="mb-1">{{ store.name }}</h6>
              <small class="text-muted">{{ store.address }}</small>
              <draggable
                :list="store.drivers"
                group="drivers"
                item-key="id"
                class="drop-zone border rounded p-3 mt-2 bg-light"
                @add="handleDriverDrop(store, $event)"
              >
                <template #header>
                  <p v-if="store.drivers.length === 0" class="text-center text-muted small mb-0">이곳으로 기사를 드래그하세요</p>
                </template>
                <template #item="{element}">
                  <div class="assigned-driver bg-white border rounded p-2 d-flex justify-content-between align-items-center">
                    <div>
                      <span class="fw-bold">{{ element.name }}</span>
                      <small class="text-muted ms-2">{{ element.phone }} / {{ element.carNumber }}</small>
                    </div>
                    <div>
                      <span class="badge bg-secondary rounded-pill me-2">{{ element.region }}</span>
                      <button class="btn btn-sm btn-danger py-0 px-1" @click="unassignDriver(store, element)">X</button>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 기사 추가 모달 -->
    <BaseModal v-model="isAddDriverModalOpen">
      <template #header><h5>새 배송 기사 추가</h5></template>
      <form @submit.prevent="addDriver">
        <div class="mb-3">
          <label class="form-label">이름 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newDriver.name" :class="{ 'is-invalid': !newDriver.name && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="newDriver.email" :class="{ 'is-invalid': !newDriver.email && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newDriver.password" :class="{ 'is-invalid': !newDriver.password && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">연락처 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newDriver.phone" :class="{ 'is-invalid': !newDriver.phone && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">차량 번호 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newDriver.carNumber" :class="{ 'is-invalid': !newDriver.carNumber && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">담당 지역 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="newDriver.region" :class="{ 'is-invalid': !newDriver.region && formSubmitted }">
            <option disabled value="">지역 선택</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddDriverModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addDriver">추가하기</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>

<style scoped>
.drop-zone {
  min-height: 60px;
}
.list-group-item:hover {
  cursor: grab;
}
.assigned-driver {
  cursor: default;
}
</style>
