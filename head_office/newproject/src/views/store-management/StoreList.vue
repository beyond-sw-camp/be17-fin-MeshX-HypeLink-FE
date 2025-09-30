<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">매장 관리</h5>
        <div>
          <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm me-2" @click="emit('add-store')">+ 신규 매장 등록</button>
          <button v-if="authStore.isAdmin" class="btn btn-outline-secondary btn-sm" @click="emit('download-pdf')">PDF 다운로드</button>
        </div>
      </div>
    </template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>매장명</th>
          <th>주소</th>
          <th>점주</th>
          <th>연락처</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.id">
          <td>{{ store.name }}</td>
          <td>{{ store.address }}</td>
          <td>{{ store.owner }}</td>
          <td>{{ store.phone }}</td>
          <td><span class="badge" :class="store.status === '운영중' ? 'bg-success' : 'bg-danger'">{{ store.status }}</span></td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>
<script setup>
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';
defineProps({ stores: Array });
const emit = defineEmits(['add-store', 'download-pdf']);
const authStore = useAuthStore();
</script>
