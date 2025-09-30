<template>
  <BaseCard>
    <template #header><h5>전체 POS 기기 헬스체크</h5></template>
    <table class="table table-hover">
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
        <tr v-for="device in devices" :key="device.id">
          <td>{{ device.storeName }}</td>
          <td>{{ device.posId }}</td>
          <td>
            <span class="badge" :class="statusClass(device.status)">{{ device.status }}</span>
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
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue';
import BaseCard from '../components/BaseCard.vue';

const devices = ref([
  { id: 1, storeName: 'HypeLink 강남점', posId: 'POS-A01', status: 'Online', cpu: 34, memory: 55, lastSync: '1분 전' },
  { id: 2, storeName: 'HypeLink 홍대점', posId: 'POS-B01', status: 'Online', cpu: 25, memory: 40, lastSync: '3분 전' },
  { id: 3, storeName: 'HypeLink 부산점', posId: 'POS-C01', status: 'Error', cpu: 95, memory: 80, lastSync: '30분 전' },
  { id: 4, storeName: 'HypeLink 제주점', posId: 'POS-D01', status: 'Offline', cpu: 0, memory: 0, lastSync: '2시간 전' },
]);

const statusClass = (status) => {
  if (status === 'Online') return 'bg-success';
  if (status === 'Error') return 'bg-danger';
  return 'bg-secondary';
};
</script>
