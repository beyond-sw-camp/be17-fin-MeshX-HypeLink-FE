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
import { uploadNoticeImage } from '@/api/image';

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
const announcementForm = reactive({ id: null, title: '', contents: '', images: [] });

// 이미지 관련 상태
const selectedFiles = ref([]);  // 선택된 파일들
const imagePreviewUrls = ref([]);  // 미리보기 URL
const isUploading = ref(false);  // 업로드 중 상태

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

// "새 공지 작성" 또는 "수정" 버튼 눌렀을 때 모달 열기
const openAddAnnouncementModal = (announcement = null) => {
  formSubmitted.value = false;
  selectedFiles.value = [];
  imagePreviewUrls.value = [];

  Object.assign(announcementForm, { id: null, title: '', contents: '', images: [] });

  if (announcement && announcement.id) {
    // 수정 모드
    isEditing.value = true;
    Object.assign(announcementForm, announcement);
    // 기존 이미지가 있으면 미리보기에 표시
    if (announcement.images && announcement.images.length > 0) {
      imagePreviewUrls.value = announcement.images.map(img => img.imageUrl);
      announcementForm.images = announcement.images;
    }
  } else {
    // 새 공지 작성 모드
    isEditing.value = false;
  }

  isModalOpen.value = true;
};

// 이미지 파일 선택 핸들러
const handleImageSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = files;

  // 미리보기 URL 생성
  imagePreviewUrls.value = files.map(file => URL.createObjectURL(file));
};

// 이미지 제거
const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(imagePreviewUrls.value[index]);
  imagePreviewUrls.value.splice(index, 1);
};

//저장 버튼 눌렀을 때
const saveAnnouncement = async () => {
  formSubmitted.value = true;
  if (!announcementForm.title || !announcementForm.contents) {
    toastStore.showToast('제목과 내용을 모두 입력해주세요.', 'danger');
    return;
  }

  try {
    isUploading.value = true;

    // 이미지 업로드 처리
    let uploadedImages = [];
    if (selectedFiles.value.length > 0) {
      toastStore.showToast('이미지 업로드 중...', 'info');

      for (const file of selectedFiles.value) {
        try {
          const imageData = await uploadNoticeImage(file);
          uploadedImages.push(imageData);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          toastStore.showToast(`이미지 업로드 실패: ${file.name}`, 'warning');
        }
      }
    }

    // 기존 이미지 유지 또는 변환
    let finalImages;
    if (isEditing.value) {
      if (selectedFiles.value.length > 0) {
        // 수정 모드에서 새 이미지를 선택한 경우
        finalImages = uploadedImages;
      } else {
        // 수정 모드에서 새 이미지를 선택하지 않은 경우, 기존 이미지 정보를 변환
        finalImages = announcementForm.images.map(img => ({ id: img.id, originalName: img.originalName }));
      }
    } else {
      // 생성 모드
      finalImages = uploadedImages;
    }

    const payload = {
      title: announcementForm.title,
      contents: announcementForm.contents,
      isOpen: true,
      author: authStore.user?.name || '관리자',
      images: finalImages
    };

    if (isEditing.value) {
      await updateAnnouncement(announcementForm.id, payload);
      toastStore.showToast('공지사항이 수정되었습니다.', 'success');
    } else {
      await createAnnouncement(payload);
      toastStore.showToast('새 공지사항이 등록되었습니다.', 'success');
    }

    // 등록/수정 후 목록 다시 불러오기
    const res = await getAllAnnouncementsList();
    announcements.value = res?.data?.notices || [];

    isModalOpen.value = false;
    selectedFiles.value = [];
    imagePreviewUrls.value = [];
    Object.assign(announcementForm, { id: null, title: '', contents: '', images: [] });
  } catch (err) {
    console.error(err);
    toastStore.showToast('공지 저장 중 오류 발생', 'danger');
  } finally {
    isUploading.value = false;
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
            
            <div class="d-flex justify-content-between align-items-center mt-2">
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
        <div class="mb-3">
          <label class="form-label">이미지 첨부</label>
          <input
            type="file"
            class="form-control"
            accept="image/*"
            multiple
            @change="handleImageSelect"
          >
          <small class="text-muted">여러 이미지를 선택할 수 있습니다.</small>
        </div>
        <!-- 이미지 미리보기 -->
        <div v-if="imagePreviewUrls.length > 0" class="mb-3">
          <label class="form-label">미리보기</label>
          <div class="image-preview-container">
            <div
              v-for="(url, index) in imagePreviewUrls"
              :key="index"
              class="image-preview-item"
            >
              <img :src="url" alt="미리보기" class="preview-thumbnail">
              <button
                type="button"
                class="btn btn-sm btn-danger remove-btn"
                @click="removeImage(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false" :disabled="isUploading">취소</button>
        <button type="button" class="btn btn-primary" @click="saveAnnouncement" :disabled="isUploading">
          <span v-if="isUploading" class="spinner-border spinner-border-sm me-1"></span>
          {{ isUploading ? '업로드 중...' : '저장' }}
        </button>
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

/* 이미지 미리보기 컨테이너 */
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
}


</style>