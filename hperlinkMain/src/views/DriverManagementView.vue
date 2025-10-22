
<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import draggable from 'vuedraggable';
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

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

// --- Mock Data ---
const unassignedParcels = ref([
  { id: 1, trackingNumber: 'TN20241022001', content: 'Hype-Tee 외 2건', quantity: 15, from: '서울 본사', to: '강남점' },
  { id: 2, trackingNumber: 'TN20241022002', content: 'Mesh-Cap 외 1건', quantity: 8, from: '부산 물류센터', to: '부산점' },
  { id: 3, trackingNumber: 'TN20241022003', content: 'Link-Pants', quantity: 20, from: '서울 본사', to: '홍대점' },
  { id: 4, trackingNumber: 'TN20241022004', content: 'Hyper-Jacket', quantity: 5, from: '대전 물류센터', to: '강남점' },
]);

const drivers = ref([
  { 
    id: 1, 
    name: '홍길동 기사', 
    phone: '010-1111-1111', 
    carNumber: '12가 3456', 
    region: '서울/경기', 
    assignedParcels: [
      { id: 5, trackingNumber: 'TN20241021005', content: 'Initial-Item', quantity: 10, from: '서울 본사', to: '수원점' }
    ]
  },
  { id: 2, name: '김철수 기사', phone: '010-2222-2222', carNumber: '23나 4567', region: '서울/경기', assignedParcels: [] },
  { id: 3, name: '이영희 기사', phone: '010-3333-3333', carNumber: '34다 5678', region: '부산/경상', assignedParcels: [] },
]);

// --- Drag and Drop Logic ---
const handleParcelDrop = (driver, event) => {
  const droppedParcel = event.added.element;
  
  console.log(`'${droppedParcel.trackingNumber}' 소포가 '${driver.name}'에게 배정되었습니다.`);
  toastStore.showToast(`'${droppedParcel.content}' 배송 건이 ${driver.name}에게 할당되었습니다.`, 'success');

  // 여기에 실제 백엔드 API (POST /shipment/connecting)를 호출하는 로직이 들어갑니다.
};

</script>

<template>
  <div>
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">드래그 앤 드롭 배차 관리</h4>
      <p>왼쪽의 '미배정 소포 목록'에서 소포(송장)를 드래그하여 오른쪽의 담당 기사 카드 위로 옮겨 배송을 배정할 수 있습니다.</p>
    </div>

    <div class="row">
      <!-- Unassigned Parcels List -->
      <div class="col-md-5">
        <BaseCard>
          <template #header><h5>미배정 소포 목록</h5></template>
          <draggable 
            :list="unassignedParcels"
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
          <div v-if="unassignedParcels.length === 0" class="text-center text-muted p-5">
            배정할 소포가 없습니다.
          </div>
        </BaseCard>
      </div>

      <!-- Drivers List -->
      <div class="col-md-7">
        <BaseCard>
          <template #header><h5>배송 기사 목록</h5></template>
          <div class="driver-grid">
            <div v-for="driver in drivers" :key="driver.id" class="driver-card">
              <BaseCard :title="driver.name">
                <template #header>
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-0">{{ driver.name }}</h6>
                    <span class="badge" :class="getRegionBadgeClass(driver.region)">{{ driver.region }}</span>
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
                      이곳으로 소포를 드래그하세요
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
