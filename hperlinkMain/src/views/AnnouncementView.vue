<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useToastStore } from '@/stores/toast';
import {getAllAnnouncementsList, createAnnouncement, deleteAnnouncement as deleteAnnouncementApi, getAnnouncementDetail, updateAnnouncement} from '@/api/announcements';

const announcements = ref([]);   // 기존 allAnnouncements 대체
const loading = ref(false);
const error = ref(null);

const authStore = useAuthStore();
const modalStore = useModalStore();
const toastStore = useToastStore();
const router = useRouter();

const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false); //수정 모드인지 새로 작성인지
const formSubmitted = ref(false); //유효성 표시용
const announcementForm = reactive({ id: null, title: '', contents: '' });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // JS에서 month는 0부터 시작
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

//화면이 처음 뜰 때 실행: 전체 공지 목록을 서버에서 받아오기
onMounted(async () => {
  loading.value = true;
  try {
    const res = await getAllAnnouncementsList();
    announcements.value = res?.data?.notices || [];
  } catch (err) {
    console.error(err);
    error.value = '공지사항 불러오기 실패';
  } finally {
    loading.value = false;
  }
});

//검색어가 반영된 목록 계산(computed: 원본+검색어가 바뀌면 자동 재계산)
const filteredAnnouncements = computed(() => {
  let filtered = [...announcements.value]; 
  if (searchTerm.value) {                         // 검색어가 있으면 소문자로 맞추고 제목/내용에 검색어 포함된 것만 남김
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(term) ||
      a.contents?.toLowerCase().includes(term)
    );
  }
  return filtered;
});

//현재 페이지에 해당하는 목록 조각만 계산
const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAnnouncements.value.slice(start, end);
});

// 전체 페이지 수 계산(목록 길이 ÷ 페이지당 개수)
const totalPages = computed(() => Math.ceil(filteredAnnouncements.value.length / itemsPerPage.value));

//페이지 번호 바꾸기(범위 밖이면 무시)
const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// “새 공지 작성” 또는 “수정” 버튼 눌렀을 때 모달 열기
const openAddAnnouncementModal = (announcement = null) => {
  formSubmitted.value = false;
   Object.assign(announcementForm, { id: null, title: '', contents: '' });
   if (announcement && announcement.id) {
    // 수정 모드
    isEditing.value = true;
    Object.assign(announcementForm, announcement);
  } else {
    // 새 공지 작성 모드
    isEditing.value = false;
  }

  isModalOpen.value = true;
};

//저장 버튼 눌렀을 때
const saveAnnouncement = async () => {
  formSubmitted.value = true;
  if (!announcementForm.title || !announcementForm.contents) {
    toastStore.showToast('제목과 내용을 모두 입력해주세요.', 'danger');
    return;
  }

  try {
    if (isEditing.value) { 
      await updateAnnouncement(announcementForm.id, {
        title: announcementForm.title,
        contents: announcementForm.contents,
        isOpen: true,
        author: authStore.user?.name || '관리자'
      });
      toastStore.showToast('공지사항이 수정되었습니다.', 'success');
    } else {
      await createAnnouncement({
        title: announcementForm.title,
        contents: announcementForm.contents,
        isOpen: true,
        author: authStore.user?.name || '관리자'
      });
      toastStore.showToast('새 공지사항이 등록되었습니다.', 'success');
    }

    // 등록/수정 후 목록 다시 불러오기
    const res = await getAllAnnouncementsList();
    announcements.value = res?.data?.notices || [];

    isModalOpen.value = false;
    Object.assign(announcementForm, { id: null, title: '', contents: '' });
  } catch (err) {
    console.error(err);
    toastStore.showToast('공지 저장 중 오류 발생', 'danger');
  }
};

// 삭제 버튼 눌렀을 때
const deleteAnnouncement = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 공지사항을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    try {
      await deleteAnnouncementApi(id);

      // 새 목록 재조회
      const res = await getAllAnnouncementsList();
      announcements.value = res?.data?.notices || [];

      //  전체 페이지 수 계산 후 현재 페이지 조정
      const total = Math.ceil(announcements.value.length / itemsPerPage.value);
      if (currentPage.value > total) {
        currentPage.value = total > 0 ? total : 1;
      }

      toastStore.showToast('공지사항이 삭제되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      toastStore.showToast('삭제 중 오류 발생', 'danger');
    }
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
             <!-- 권한이 관리자/매니저일 때만 보이는 버튼 -->
            <button v-if="authStore.isAdmin || authStore.isManager" class="btn btn-primary btn-sm" @click="openAddAnnouncementModal">+ 새 공지 작성</button>
          </div>
        </div>
      </template>
    
       <!-- 목록이 있으면 리스트 보여주고 -->
      <div v-if="paginatedAnnouncements && paginatedAnnouncements.length > 0">
        <ul class="list-group list-group-flush">
          <li v-for="announcement in paginatedAnnouncements" :key="announcement.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
               <!-- 제목 눌렀을 때 상세 페이지로 이동하는 링크 -->
              <router-link :to="`/announcements/${announcement.id}`" class="text-decoration-none">
                <h6 class="mb-1">{{ announcement.title }}</h6>
              </router-link>
              <!-- 날짜(있으면) 표시 -->
              <small>{{  formatDate(announcement.date) }}</small>
            </div>
            <p class="mb-1">{{ announcement.contents }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">작성자: {{ announcement.author }}</small>
              <div v-if="authStore.isAdmin || authStore.isManager">
                <button class="btn btn-link btn-sm text-secondary p-0 me-2" @click="openAddAnnouncementModal(announcement)">수정</button>
                <button class="btn btn-link btn-sm text-danger p-0" @click="deleteAnnouncement(announcement.id)">삭제</button>
              </div>
            </div>
          </li>
        </ul>
        <!-- 로딩/에러 상태 표시 (리스트 아래) -->
        <div v-if="loading" class="p-3 text-center text-muted">불러오는 중...</div>
        <div v-else-if="error" class="p-3 text-danger">{{ error }}</div>
        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center mt-3">
             <!-- 이전 버튼 (1페이지면 비활성) -->
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
             <!-- 다음 버튼 (마지막 페이지면 비활성) -->
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
       <!-- 목록이 없으면 “비어있음” 컴포넌트 보여주기 -->
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
          <textarea class="form-control" rows="5" v-model="announcementForm.contents" :class="{ 'is-invalid': !announcementForm.contents && formSubmitted }"></textarea>
        </div>
         <!-- 제목, 내용 입력: 빈 채 저장 누르면 빨간 테두리 -->
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