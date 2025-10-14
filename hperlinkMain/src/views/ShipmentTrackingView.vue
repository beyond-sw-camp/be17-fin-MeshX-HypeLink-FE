<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { Client } from "@stomp/stompjs";
import "leaflet/dist/leaflet.css";
import { useAuthStore } from '@/stores/auth';
import { useShipmentStore } from '@/stores/shipments';

const authStore = useAuthStore();

const isLoading = ref(true);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const shipmentStore = useShipmentStore();

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
    initMap();
    connectWebSocket(); // 맵 초기화 후 WebSocket 연결
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
      shipment.driverId.toLowerCase().includes(term) ||
      shipment.name.toLowerCase().includes(term) ||
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

// 웹소캣 초기화
let stompClient = null;
// 지도 초기화
let map = null;
let markers = [];

const initMap = () => {
  // 기존 Leaflet → Naver Maps로 변경
  map = new naver.maps.Map("map-container", {
    center: new naver.maps.LatLng(36.5, 127.5), // 한국 중심
    zoom: 7,
    mapTypeControl: true
  });
  updateMapMarkers();
};

// --- STOMP WebSocket 연결 ---
const connectWebSocket = () => {
  stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws", // 서버 WebSocket 엔드포인트
    reconnectDelay: 5000, // 끊기면 5초 후 재연결
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log("STOMP:", str);
    }
  });

  stompClient.onConnect = () => {
    console.log("STOMP 연결 성공");
    stompClient.subscribe("/topic/dashboard", (message) => {
      const driverData = JSON.parse(message.body);

      // shipmentStore 업데이트 (예: 기사 위치 반영)
      shipmentStore.updateDriverLocation(driverData);

      // 지도 마커 갱신
      updateMapMarkers();
    });
  };

  stompClient.onStompError = (frame) => {
    console.error("STOMP 에러:", frame.headers["message"]);
  };

  stompClient.activate();
};

const updateMapMarkers = () => {
  // 기존 마커 제거 ❌ → 대신 driverId 기준으로 마커 재활용
  const newMarkers = {};

  filteredAndSortedShipments.value.forEach(shipment => {
    if (shipment.status !== '완료' && shipment.latitude && shipment.longitude) {
      const driverId = shipment.driverId;
      const targetPos = new naver.maps.LatLng(shipment.latitude, shipment.longitude);

      if (markers[driverId]) {
        // 이미 있는 마커 → 애니메이션 이동
        animateMarker(markers[driverId], targetPos);
      } else {
        // 신규 마커 생성
        const marker = new naver.maps.Marker({
          position: targetPos,
          map: map,
          icon: {
            content: `<div style="padding:4px 6px;background:#0066ff;color:#fff;
                                border-radius:4px;font-size:12px;">
                        ${shipment.name}
                      </div>`
          }
        });

        const info = new naver.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:13px;">
                      <b>${shipment.driverId}</b><br>
                      ${shipment.name} 기사<br>
                      상태: ${shipment.status}
                    </div>`
        });

        naver.maps.Event.addListener(marker, "click", () => {
          info.open(map, marker);
        });

        markers[driverId] = marker;
      }
      newMarkers[driverId] = markers[driverId];
    }
  });

  // 이전에 있었는데 이번엔 빠진 마커 제거
  Object.keys(markers).forEach(id => {
    if (!newMarkers[id]) {
      markers[id].setMap(null);
      delete markers[id];
    }
  });
};

const animateMarker = (marker, targetPos) => {
  const startPos = marker.getPosition();
  const startTime = performance.now();
  const duration = 4000; // 4초

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1); // 0 ~ 1 비율

    // 선형 보간 (linear interpolation)
    const lat = startPos.lat() + (targetPos.lat() - startPos.lat()) * progress;
    const lng = startPos.lng() + (targetPos.lng() - startPos.lng()) * progress;

    marker.setPosition(new naver.maps.LatLng(lat, lng));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      marker.setPosition(targetPos); // 마지막 위치 보정
    }
  };

  requestAnimationFrame(step);
};

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
