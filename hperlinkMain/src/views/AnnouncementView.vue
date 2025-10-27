<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useToastStore } from '@/stores/toast';
import {getAllAnnouncementsList, getPagedAnnouncements, createAnnouncement, getAnnouncementDetail, updateAnnouncement} from '@/api/announcements';
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

// 페이지네이션 상태
const currentPage = ref(1);
const itemsPerPage = ref(6);
const totalPages = ref(1);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // JS에서 month는 0부터 시작
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

//공지사항 목록 조회 (백엔드 페이징)
const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const res = await getPagedAnnouncements({
      page: currentPage.value - 1,  // Spring Pageable은 0부터 시작
      size: itemsPerPage.value,
      sort: 'id,desc'
    });
    announcements.value = res?.data?.content || [];
    totalPages.value = res?.data?.totalPages || 1;
  } catch (err) {
    console.error(err);
    error.value = '공지사항 불러오기 실패';
  } finally {
    loading.value = false;
  }
};

//화면이 처음 뜰 때 실행
onMounted(() => {
  fetchAnnouncements();
});

// 페이지 변경 시 데이터 다시 불러오기
watch(currentPage, () => {
  fetchAnnouncements();
});

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
    await fetchAnnouncements();

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


</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">공지사항 목록</h5>
          <div class="d-flex">
             <!-- 권한이 관리자/매니저일 때만 보이는 버튼 -->
            <button v-if="authStore.isAdmin || authStore.isManager" class="btn btn-primary btn-sm" @click="openAddAnnouncementModal">+ 새 공지 작성</button>
          </div>
        </div>
      </template>
    
       <!-- 목록이 있으면 리스트 보여주고 -->
      <div v-if="announcements && announcements.length > 0">
        <ul class="list-group list-group-flush">
          <li v-for="announcement in announcements" :key="announcement.id" class="list-group-item">
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
                <button class="btn btn-link btn-sm text-secondary p-0" @click="openAddAnnouncementModal(announcement)">수정</button>
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