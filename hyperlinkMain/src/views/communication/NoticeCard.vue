<script setup>
import BaseCard from '@/components/BaseCard.vue';
defineProps({ 
  title: String, 
  items: Array,
  showAddButton: { type: Boolean, default: false },
  showAdminControls: { type: Boolean, default: false }
});
const emit = defineEmits(['add-notice', 'edit-notice', 'delete-notice']);
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ title }}</h5>
        <button v-if="showAddButton" class="btn btn-primary btn-sm" @click="emit('add-notice')">+ 공지 작성</button>
      </div>
    </template>
    <ul class="list-group list-group-flush">
      <li v-for="(item, index) in items" :key="item.id" class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ item.title }}</h6>
          <small>{{ item.date }}</small>
        </div>
        <p class="mb-1">{{ item.content }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">작성자: {{ item.author }}</small>
          <div v-if="showAdminControls">
            <button class="btn btn-link btn-sm text-secondary p-0 me-2" @click="emit('edit-notice', index)">수정</button>
            <button class="btn btn-link btn-sm text-danger p-0" @click="emit('delete-notice', index)">삭제</button>
          </div>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>