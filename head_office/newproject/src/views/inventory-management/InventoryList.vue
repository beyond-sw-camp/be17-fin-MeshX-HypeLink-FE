<script setup>
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';
defineProps({ inventory: Array });
const emit = defineEmits(['send-shipment']);
const authStore = useAuthStore();
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 v-if="authStore.isAdmin" class="mb-0">전체 재고 현황</h5>
      <h5 v-else class="mb-0">내 매장 재고 현황</h5>
    </template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th v-if="authStore.isAdmin">점포명</th>
          <th>상품 코드</th>
          <th>상품명</th>
          <th>현재고</th>
          <th>안전재고</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id">
          <td v-if="authStore.isAdmin">{{ item.storeName }}</td>
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.currentStock }}</td>
          <td>{{ item.safeStock }}</td>
          <td>
            <span v-if="item.currentStock > item.safeStock" class="badge bg-success">양호</span>
            <span v-else-if="item.currentStock > 0" class="badge bg-warning">주의</span>
            <span v-else class="badge bg-danger">품절</span>
          </td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>