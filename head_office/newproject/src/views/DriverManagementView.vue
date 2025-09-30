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
              <button class="btn btn-primary btn-sm" @click="isAddDriverModalOpen = true">+ 기사 추가</button>
            </div>
          </template>
          <draggable 
            v-model="drivers"
            group="drivers"
            item-key="id"
            class="list-group"
          >
            <template #item="{element}">
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">{{ element.name }}</h6>
                  <small class="text-muted">{{ element.phone }}</small>
                </div>
                <div>
                  <span class="badge bg-primary rounded-pill me-2">{{ element.region }}</span>
                  <button class="btn btn-sm btn-danger py-0 px-1" @click="deleteDriver(element.id)">X</button>
                </div>
              </div>
            </template>
          </draggable>
        </BaseCard>
      </div>

      <!-- 직영점 목록 -->
      <div class="col-md-7">
        <BaseCard>
          <template #header><h5>직영점 목록</h5></template>
          <div class="list-group">
            <div v-for="store in stores" :key="store.id" class="list-group-item">
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
                    <span>{{ element.name }}</span>
                    <button class="btn btn-sm btn-danger py-0 px-1" @click="unassignDriver(store, element)">X</button>
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
          <label class="form-label">이름</label>
          <input type="text" class="form-control" v-model="newDriver.name">
        </div>
        <div class="mb-3">
          <label class="form-label">연락처</label>
          <input type="text" class="form-control" v-model="newDriver.phone">
        </div>
        <div class="mb-3">
          <label class="form-label">담당 지역</label>
          <select class="form-select" v-model="newDriver.region">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import draggable from 'vuedraggable';
import BaseModal from '@/components/BaseModal.vue';

const drivers = ref([
  { id: 1, name: '김기사', phone: '010-1111-1111', region: '서울/경기' },
  { id: 2, name: '이기사', phone: '010-2222-2222', region: '서울/경기' },
  { id: 3, name: '박기사', phone: '010-3333-3333', region: '부산/경남' },
  { id: 4, name: '최기사', phone: '010-4444-4444', region: '제주' },
]);

const stores = ref([
  { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', drivers: [] },
  { id: 2, name: 'HypeLink 홍대점', address: '서울시 마포구 양화로', drivers: [] },
  { id: 3, name: 'HypeLink 부산점', address: '부산시 해운대구', drivers: [] },
  { id: 4, name: 'HypeLink 제주점', address: '제주시 첨단로', drivers: [] },
]);

const regions = ref([
  '서울/경기', '강원', '충청', '경상', '전라', '제주'
]);

onMounted(() => {
  console.log('Regions data:', regions.value);
});

const isAddDriverModalOpen = ref(false);
const newDriver = reactive({ name: '', phone: '', region: '' });

const handleDriverDrop = (store, event) => {
  if (store.drivers.length > 1) {
    const droppedDriver = event.item.__draggable_context.element;
    drivers.value.push(store.drivers.find(d => d.id !== droppedDriver.id));
    store.drivers = [droppedDriver];
  }
};

const unassignDriver = (store, driver) => {
  store.drivers = [];
  drivers.value.push(driver);
};

const addDriver = () => {
  if (!newDriver.name || !newDriver.phone) {
    alert('이름과 연락처는 필수입니다.');
    return;
  }
  drivers.value.push({ id: drivers.value.length + 1, ...newDriver });
  Object.assign(newDriver, { name: '', phone: '', region: '' });
  isAddDriverModalOpen.value = false;
};

const deleteDriver = (id) => {
  if (confirm('정말 이 기사를 삭제하시겠습니까?')) {
    drivers.value = drivers.value.filter(driver => driver.id !== id);
  }
};
</script>

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
