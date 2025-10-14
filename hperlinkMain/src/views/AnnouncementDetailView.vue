<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { useAnnouncementStore } from '@/stores/announcements';

const route = useRoute();
const router = useRouter();
const announcementStore = useAnnouncementStore();

const announcement = ref(null);
const isLoading = ref(true);

onMounted(() => {
  const announcementId = parseInt(route.params.id);
  announcement.value = announcementStore.allAnnouncements.find(a => a.id === announcementId);
  isLoading.value = false;
});
</script>

<template>
  <div>
    <BaseSpinner v-if="isLoading" />
    <BaseCard v-else-if="announcement">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ announcement.title }}</h5>
          <small class="text-muted">{{ announcement.date }} by {{ announcement.author }}</small>
        </div>
      </template>
      <p>{{ announcement.content }}</p>
      <template #footer>
        <button class="btn btn-secondary" @click="router.back()">목록으로</button>
      </template>
    </BaseCard>
    <BaseEmptyState v-else message="공지사항을 찾을 수 없습니다." />
  </div>
</template>
