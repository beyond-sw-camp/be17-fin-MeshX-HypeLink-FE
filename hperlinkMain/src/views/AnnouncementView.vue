<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useAnnouncementStore } from '@/stores/announcements';
import { useModalStore } from '@/stores/modal';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const announcementStore = useAnnouncementStore();
const modalStore = useModalStore();
const toastStore = useToastStore();
const router = useRouter();

const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const announcementForm = reactive({ id: null, title: '', content: '' });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

const filteredAnnouncements = computed(() => {
  let announcements = [...announcementStore.allAnnouncements];
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    announcements = announcements.filter(a => 
      a.title.toLowerCase().includes(term) || 
      a.content.toLowerCase().includes(term)
    );
  }
  return announcements;
});

const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAnnouncements.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAnnouncements.value.length / itemsPerPage.value));

const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const openAddAnnouncementModal = (announcement = null) => {
  formSubmitted.value = false;
  if (announcement) {
    isEditing.value = true;
    Object.assign(announcementForm, announcement);
  } else {
    isEditing.value = false;
    Object.assign(announcementForm, { id: null, title: '', content: '' });
  }
  isModalOpen.value = true;
};

const saveAnnouncement = () => {
  formSubmitted.value = true;
  if (!announcementForm.title || !announcementForm.content) {
    toastStore.showToast('제목과 내용을 모두 입력해주세요.', 'danger');
    return;
  }

  if (isEditing.value) {
    announcementStore.updateAnnouncement(announcementForm);
    toastStore.showToast('공지사항이 수정되었습니다.', 'success');
  } else {
    announcementStore.addAnnouncement(announcementForm);
    toastStore.showToast('새 공지사항이 등록되었습니다.', 'success');
  }
  isModalOpen.value = false;
  Object.assign(announcementForm, { id: null, title: '', content: '' });
};

const deleteAnnouncement = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 공지사항을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    announcementStore.deleteAnnouncement(id);
    toastStore.showToast('공지사항이 삭제되었습니다.', 'success');
  }
};

</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">공지사항 목록</h5>
          <div class="d-flex">
            <input type="text" class="form-control form-control-sm me-2" placeholder="제목/내용 검색" v-model="searchTerm">
            <button v-if="authStore.isAdmin || authStore.isManager" class="btn btn-primary btn-sm" @click="openAddAnnouncementModal">+ 새 공지 작성</button>
          </div>
        </div>
      </template>
    
      <div v-if="paginatedAnnouncements && paginatedAnnouncements.length > 0">
        <ul class="list-group list-group-flush">
          <li v-for="announcement in paginatedAnnouncements" :key="announcement.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <router-link :to="`/announcements/${announcement.id}`" class="text-decoration-none">
                <h6 class="mb-1">{{ announcement.title }}</h6>
              </router-link>
              <small>{{ announcement.date }}</small>
            </div>
            <p class="mb-1">{{ announcement.content }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">작성자: {{ announcement.author }}</small>
              <div v-if="authStore.isAdmin || authStore.isManager">
                <button class="btn btn-link btn-sm text-secondary p-0 me-2" @click="openAddAnnouncementModal(announcement)">수정</button>
                <button class="btn btn-link btn-sm text-danger p-0" @click="deleteAnnouncement(announcement.id)">삭제</button>
              </div>
            </div>
          </li>
        </ul>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center mt-3">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 공지사항이 없습니다." />

    </BaseCard>

    <!-- 공지사항 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '공지 수정' : '새 공지 작성' }}</h5></template>
      <form @submit.prevent="saveAnnouncement">
        <div class="mb-3">
          <label class="form-label">제목 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="announcementForm.title" :class="{ 'is-invalid': !announcementForm.title && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">내용 <span class="text-danger">*</span></label>
          <textarea class="form-control" rows="5" v-model="announcementForm.content" :class="{ 'is-invalid': !announcementForm.content && formSubmitted }"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveAnnouncement">저장</button>
      </template>
    </BaseModal>

  </div>
</template>

<style scoped>
.modal {
  z-index: 1055; /* Bootstrap 기본 z-index(1050)보다 높게 설정 */
}
.modal-backdrop {
  z-index: 1050; /* Bootstrap 기본 z-index와 일치 */
}
</style>