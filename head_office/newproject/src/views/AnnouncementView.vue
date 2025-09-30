<template>
  <div>
    <AnnouncementList 
      :announcements="announcements"
      @add-announcement="openModal()"
      @edit-announcement="openModal"
      @delete-announcement="deleteAnnouncement"
    />

    <AnnouncementFormModal 
      v-model="isModalOpen"
      :is-editing="isEditing"
      :initial-data="currentAnnouncement"
      @save="saveAnnouncement"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AnnouncementList from './announcements/AnnouncementList.vue';
import AnnouncementFormModal from './announcements/AnnouncementFormModal.vue';

const authStore = useAuthStore();

const announcements = ref([
  { id: 1, title: '[필독] 2025 F/W 시즌 신제품 출시 안내', content: '새 학기를 맞아 모든 상품 10% 할인 프로모션 진행', author: '상품기획팀', date: '2025-09-28' },
  { id: 2, title: '[공지] 추석 연휴 배송 일정 안내', content: '연휴 기간 동안의 배송 일정을 확인해주시기 바랍니다...', author: '운영지원팀', date: '2025-09-27' },
]);

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentAnnouncement = reactive({});

const openModal = (index = -1) => {
  if (index > -1) {
    isEditing.value = true;
    Object.assign(currentAnnouncement, announcements.value[index]);
  } else {
    isEditing.value = false;
    Object.assign(currentAnnouncement, { id: null, title: '', content: '', author: authStore.user.name, date: new Date().toISOString().slice(0, 10) });
  }
  isModalOpen.value = true;
};

const saveAnnouncement = (formData) => {
  if (isEditing.value) {
    const index = announcements.value.findIndex(a => a.id === currentAnnouncement.id);
    if (index !== -1) {
      Object.assign(announcements.value[index], formData);
    }
  } else {
    announcements.value.unshift({
      id: announcements.value.length + 10,
      author: authStore.user.name,
      date: new Date().toISOString().slice(0, 10),
      ...formData
    });
  }
  isModalOpen.value = false;
};

const deleteAnnouncement = (index) => {
  if (confirm('정말 이 공지를 삭제하시겠습니까?')) {
    announcements.value.splice(index, 1);
  }
};
</script>
