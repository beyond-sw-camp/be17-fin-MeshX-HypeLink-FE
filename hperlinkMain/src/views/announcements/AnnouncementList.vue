<script setup>
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

defineProps({
  announcements: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'add-announcement', //공지 생성
  'edit-announcement', //공지 수정
  'delete-announcement', //공지 삭제
  'view-announcement' // 공지 상세 조회
])

const canEdit = computed(() => authStore.isSuperAdmin || authStore.isSubAdmin)

</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">공지사항 목록</h5>
        <!-- 🔹 본사/부관리자만 새 공지 생성 가능 -->
        <button v-if="canEdit" class="btn btn-primary btn-sm" @click="emit('add-announcement')">+ 새 공지 작성</button>
      </div>
    </template>
    <ul class="list-group list-group-flush">
      <li v-for="(announcement, index) in announcements" :key="announcement.id" class="list-group-item" @click="emit('view-announcement', announcement.id)"
      >
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ announcement.title }}</h6>
          <small>{{ announcement.date }}</small>
        </div>
        <p class="mb-1">{{ announcement.content }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">작성자: {{ announcement.author }}</small>

          <!-- 🔹 본사/부관리자만 수정·삭제 가능 -->
          <div v-if="canEdit">
            <button class="btn btn-link btn-sm text-secondary p-0 me-2" @click.stop="emit('edit-announcement', index)">수정</button>
            <button class="btn btn-link btn-sm text-danger p-0" @click.stop="emit('delete-announcement', index)">삭제</button>
          </div>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>