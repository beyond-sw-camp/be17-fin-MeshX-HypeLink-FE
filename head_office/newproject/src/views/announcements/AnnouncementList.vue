<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">공지사항 목록</h5>
        <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm" @click="emit('add-announcement')">+ 새 공지 작성</button>
      </div>
    </template>
    <ul class="list-group list-group-flush">
      <li v-for="(announcement, index) in announcements" :key="announcement.id" class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ announcement.title }}</h6>
          <small>{{ announcement.date }}</small>
        </div>
        <p class="mb-1">{{ announcement.content }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">작성자: {{ announcement.author }}</small>
          <div v-if="authStore.isAdmin">
            <button class="btn btn-link btn-sm text-secondary p-0 me-2" @click="emit('edit-announcement', index)">수정</button>
            <button class="btn btn-link btn-sm text-danger p-0" @click="emit('delete-announcement', index)">삭제</button>
          </div>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

defineProps({ announcements: Array });
const emit = defineEmits(['add-announcement', 'edit-announcement', 'delete-announcement']);
</script>
