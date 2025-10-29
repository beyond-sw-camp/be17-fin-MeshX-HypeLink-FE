<script setup>
import { ref, computed } from 'vue';
import BaseCard from '../components/BaseCard.vue';
import BaseEmptyState from '../components/BaseEmptyState.vue';

const allDevices = ref([
  { id: 1, storeName: 'HypeLink 강남점', posId: 'POS-A01', status: 'Online', cpu: 34, memory: 55, lastSync: '1분 전' },
  { id: 2, storeName: 'HypeLink 홍대점', posId: 'POS-B01', status: 'Online', cpu: 25, memory: 40, lastSync: '3분 전' },
  { id: 3, storeName: 'HypeLink 부산점', posId: 'POS-C01', status: 'Error', cpu: 95, memory: 80, lastSync: '30분 전' },
  { id: 4, storeName: 'HypeLink 제주점', posId: 'POS-D01', status: 'Offline', cpu: 0, memory: 0, lastSync: '2시간 전' },
]);

// 페이징 상태
const currentPage = ref(1);
const itemsPerPage = ref(10);

// 페이지네이션 계산
const totalPages = computed(() => Math.ceil(allDevices.value.length / itemsPerPage.value) || 1);

const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allDevices.value.slice(start, end);
});

// 표시할 페이지 버튼 계산 (최대 5개)
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const updatePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const statusClass = (status) => {
  if (status === 'Online') return 'bg-success';
  if (status === 'Error') return 'bg-danger';
  return 'bg-secondary';
};

const getStatusText = (status) => {
  switch (status) {
    case 'Online': return '정상';
    case 'Offline': return '연결 끊김';
    case 'Error': return '오류';
    default: return status;
  }
};
</script>

<template>
  <BaseCard>
    <template #header><h5>전체 POS 기기 헬스체크</h5></template>

    <table class="table table-hover" v-if="paginatedDevices.length > 0">
      <thead>
        <tr>
          <th>점포명</th>
          <th>POS ID</th>
          <th>상태</th>
          <th>CPU 사용량</th>
          <th>메모리 사용량</th>
          <th>마지막 동기화</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="device in paginatedDevices" :key="device.id">
          <td>{{ device.storeName }}</td>
          <td>{{ device.posId }}</td>
          <td>
            <span class="badge" :class="statusClass(device.status)">{{ getStatusText(device.status) }}</span>
          </td>
          <td>
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{ width: device.cpu + '%' }" :aria-valuenow="device.cpu">{{ device.cpu }}%</div>
            </div>
          </td>
          <td>
            <div class="progress">
              <div class="progress-bar bg-info" role="progressbar" :style="{ width: device.memory + '%' }" :aria-valuenow="device.memory">{{ device.memory }}%</div>
            </div>
          </td>
          <td>{{ device.lastSync }}</td>
        </tr>
      </tbody>
    </table>

    <BaseEmptyState v-else message="조회된 POS 기기가 없습니다." />

    <!-- 페이지네이션 -->
    <nav v-if="totalPages >= 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
        </li>
        <li class="page-item" v-if="visiblePages[0] > 1">
          <a class="page-link" href="#" @click.prevent="updatePage(1)">1</a>
        </li>
        <li class="page-item disabled" v-if="visiblePages[0] > 2">
          <span class="page-link">...</span>
        </li>
        <li class="page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
          <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
        </li>
        <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < totalPages - 1">
          <span class="page-link">...</span>
        </li>
        <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < totalPages">
          <a class="page-link" href="#" @click.prevent="updatePage(totalPages)">{{ totalPages }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
        </li>
      </ul>
    </nav>
  </BaseCard>
</template>