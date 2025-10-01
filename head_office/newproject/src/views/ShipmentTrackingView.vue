<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuthStore } from '@/stores/auth';
import { useShipmentStore } from '@/stores/shipments';

const authStore = useAuthStore();
const shipmentStore = useShipmentStore();

const isLoading = ref(true);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
    initMap();
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedShipments = computed(() => {
  let shipments = [...shipmentStore.allShipments];

  // 역할에 따른 필터링 (점주는 자신의 매장으로 오는 배송만)
  if (authStore.isStoreManager) {
    shipments = shipments.filter(s => s.to === authStore.user.name);
  }

  // 검색
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    shipments = shipments.filter(shipment => 
      shipment.id.toLowerCase().includes(term) || 
      shipment.driver.toLowerCase().includes(term) ||
      shipment.from.toLowerCase().includes(term) ||
      shipment.to.toLowerCase().includes(term)
    );
  }

  // 필터링 (상태별)
  if (filterStatus.value !== 'all') {
    shipments = shipments.filter(shipment => shipment.status === filterStatus.value);
  }

  // 정렬
  if (sortKey.value) {
    shipments.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return shipments;
});

// --- 페이지네이션 로직 ---
const paginatedShipments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedShipments.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedShipments.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const statusClass = (status) => {
  if (status === '배송중') return 'bg-primary';
  if (status === '지연') return 'bg-danger';
  if (status === '완료') return 'bg-success';
  return 'bg-secondary';
};

// --- 지도 초기화 ---
let map = null;
let markers = [];

const initMap = () => {
  if (map) map.remove(); // 기존 맵 제거
  map = L.map("map-container").setView([36.5, 127.5], 7); // 한반도 중심
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  updateMapMarkers();
};

const updateMapMarkers = () => {
  markers.forEach(marker => marker.remove()); // 기존 마커 제거
  markers = [];

  filteredAndSortedShipments.value.forEach(shipment => {
    if (shipment.status !== '완료' && shipment.location) {
      const marker = L.marker(shipment.location).addTo(map)
        .bindPopup(`<b>${shipment.id}</b><br>${shipment.driver} 기사<br>상태: ${shipment.status}`);
      markers.push(marker);
    }
  });
};

// 필터링/정렬/페이지 변경 시 마커 업데이트
watch(filteredAndSortedShipments, () => {
  if (map) updateMapMarkers();
});

</script>

<template>
  <div>
    <div class="row">
      <div class="col-lg-8">
        <BaseCard>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">실시간 배송 현황</h5>
              <div class="d-flex">
                <input type="text" class="form-control form-control-sm me-2" placeholder="배송 ID/기사 검색" v-model="searchTerm">
                <select class="form-select form-select-sm" v-model="filterStatus">
                  <option value="all">전체 상태</option>
                  <option value="배송중">배송중</option>
                  <option value="지연">지연</option>
                  <option value="완료">완료</option>
                </select>
              </div>
            </div>
          </template>
          <div id="map-container" style="height: 600px;"></div>
        </BaseCard>
      </div>
      <div class="col-lg-4">
        <BaseCard>
          <template #header><h5>배송 목록</h5></template>
          <div v-if="paginatedShipments.length > 0">
            <ul class="list-group list-group-flush">
              <li v-for="shipment in paginatedShipments" :key="shipment.id" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ shipment.id }}</strong> ({{ shipment.driver }})
                  <div class="text-muted small">{{ shipment.from }} → {{ shipment.to }}</div>
                  <div class="text-muted small">상품: {{ shipment.item }} ({{ shipment.qty }}개)</div>
                </div>
                <span class="badge" :class="statusClass(shipment.status)">{{ shipment.status }}</span>
              </li>
            </ul>

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
          <BaseEmptyState v-else message="조회된 배송이 없습니다." />
        </BaseCard>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>

<style scoped>
#map-container {
  width: 100%;
  height: 600px;
  border-radius: 0.375rem;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
</style>