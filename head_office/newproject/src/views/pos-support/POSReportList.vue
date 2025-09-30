<template>
  <BaseCard>
    <template #header><h5>{{ title }}</h5></template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th v-if="isAdmin">점포명</th>
          <th>문제 유형</th>
          <th>접수일</th>
          <th>상태</th>
          <th v-if="isAdmin">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="report in reports" :key="report.id">
          <td v-if="isAdmin">{{ report.storeName }}</td>
          <td>{{ report.issueType }}</td>
          <td>{{ report.date }}</td>
          <td>
            <span class="badge" :class="statusClass(report.status)">{{ report.status }}</span>
          </td>
          <td v-if="isAdmin">
            <button class="btn btn-sm btn-outline-secondary me-2">원격</button>
            <button class="btn btn-sm btn-success">완료</button>
          </td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue';

defineProps({
  title: String,
  reports: Array,
  isAdmin: Boolean
});
const emit = defineEmits(['assign-tech', 'change-status']);

const statusClass = (status) => {
  if (status === '접수완료') return 'bg-info';
  if (status === '처리중') return 'bg-warning';
  if (status === '부품요청') return 'bg-danger';
  if (status === '처리완료') return 'bg-success';
  return 'bg-secondary';
};
</script>
