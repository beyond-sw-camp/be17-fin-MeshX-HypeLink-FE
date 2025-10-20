<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { getAnnouncementDetail } from '@/api/announcements';
import { useToastStore } from '@/stores/toast';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();


const announcement = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const announcementId = route.params.id;
    const res = await getAnnouncementDetail(announcementId);
    announcement.value = res?.data || null;
  } catch (err) {
    error.value = '공지사항을 불러오는 중 오류가 발생했습니다.';
    toastStore.showToast('공지사항을 불러오지 못했습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');

  return `${y}.${m}.${d} ${h}:${min}:${s}`;
};

</script>

<template>
  <div>
    <BaseSpinner v-if="isLoading" />
    <BaseCard v-else-if="announcement">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ announcement.title }}</h5>
          <small class="text-muted">{{ formatDate(announcement.date) }} by {{ announcement.author }}</small>
        </div>
      </template>
      <p>{{ announcement.contents }}</p>
      <template #footer>
        <button class="btn btn-secondary" @click="router.back()">목록으로</button>
      </template>
    </BaseCard>
    <BaseEmptyState v-else message="공지사항을 찾을 수 없습니다." />
  </div>
</template>
