<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useShipmentTable } from '@/js/useShipmentTable';
import { useShipmentMap } from '@/js/useShipmentMap';
import { useShipmentSocket } from '@/js/useShipmentSocket';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import {useShipmentStore} from "@/stores/shipments.js";

// 로딩 상태
const isLoading = ref(true);
const shipmentStore = useShipmentStore();

// 테이블 및 필터링 관련 상태
const {
  searchTerm, filterStatus, sortKey, sortOrder,
  currentPage, itemsPerPage, filteredAndSortedShipments,
  paginatedShipments, totalPages, updateSort, updatePage, statusClass
} = useShipmentTable();

// 지도 관련 훅
const { initMap, updateMapMarkers } = useShipmentMap(filteredAndSortedShipments);

// 소켓 훅 (확장형)
const {
  connectWebSocket,
  disconnectWebSocket,
  subscribe,
  unsubscribe
} = useShipmentSocket(updateMapMarkers);

onMounted(() => { // async 추가
  setTimeout(() => { // async 추가
    isLoading.value = false;

    // 지도 초기화
    initMap(); // await 추가

    // 웹소켓 연결
    connectWebSocket();

    // 기본 대시보드 구독
    // updateMapMarkers는 내부에서 shipmentStore와 연계됨
    setTimeout(() => {
      subscribe('/topic/dashboard', msg => {
        const driverData = JSON.parse(msg.body);
        console.log('Dashboard:', driverData);
        shipmentStore.updateDriverLocation(driverData);
        updateMapMarkers();
      });
    }, 2000);
  }, 1000);
});

// 테이블 데이터 변경 시 지도 갱신
watch(filteredAndSortedShipments, () => updateMapMarkers());

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  unsubscribe('/topic/dashboard');
  disconnectWebSocket();
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
                  <strong>{{ shipment.driverId }}</strong> ({{ shipment.name }})
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
