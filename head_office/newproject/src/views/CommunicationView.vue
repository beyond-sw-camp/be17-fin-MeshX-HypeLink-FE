<template>
  <div>
    <div class="row">
      <div class="col-lg-7">
        <NoticeCard 
          title="본사 공지사항" 
          :items="notices" 
          :show-add-button="authStore.isAdmin"
          :show-admin-controls="authStore.isAdmin"
          @add-notice="openNoticeModal()"
          @edit-notice="openNoticeModal"
          @delete-notice="deleteNotice"
        />
      </div>
      <div class="col-lg-5">
        <NoticeCard title="매장 문의사항" :items="inquiries" />
      </div>
    </div>

    <!-- 공지 작성/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ modalState.isEditing ? '공지 수정' : '새 공지 작성' }}</h5></template>
      <form @submit.prevent="saveNotice">
        <div class="mb-3">
          <label class="form-label">제목</label>
          <input type="text" class="form-control" v-model="noticeForm.title">
        </div>
        <div class="mb-3">
          <label class="form-label">내용</label>
          <textarea class="form-control" rows="5" v-model="noticeForm.content"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveNotice">저장</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import NoticeCard from './communication/NoticeCard.vue';
import BaseModal from '@/components/BaseModal.vue';

const authStore = useAuthStore();

const notices = ref([
  { id: 1, title: '[필독] 2025 F/W 시즌 신제품 출시 안내', content: '다음 주 월요일부터 신제품 판매가 시작됩니다. 각 매장에서는...', author: '상품기획팀', date: '2025-09-28' },
  { id: 2, title: '[공지] 추석 연휴 배송 일정 안내', content: '연휴 기간 동안의 배송 일정을 확인해주시기 바랍니다...', author: '운영지원팀', date: '2025-09-27' },
]);

const inquiries = ref([
  { id: 1, title: 'POS 기기 오류 관련 문의', content: '강남점', author: '최민성 (강남점)', date: '2025-09-29' },
  { id: 2, title: 'Hyper-Jacket 재고 추가 요청', content: '홍대점', author: '김점주', date: '2025-09-29' },
]);

// --- 모달 및 폼 관리 ---
const isModalOpen = ref(false);
const modalState = reactive({ isEditing: false, editIndex: -1 });
const noticeForm = reactive({ title: '', content: '' });

const openNoticeModal = (index = -1) => {
  if (index > -1) { // 수정 모드
    modalState.isEditing = true;
    modalState.editIndex = index;
    const notice = notices.value[index];
    noticeForm.title = notice.title;
    noticeForm.content = notice.content;
  } else { // 작성 모드
    modalState.isEditing = false;
    noticeForm.title = '';
    noticeForm.content = '';
  }
  isModalOpen.value = true;
};

const saveNotice = () => {
  if (!noticeForm.title || !noticeForm.content) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  if (modalState.isEditing) {
    // 수정
    notices.value[modalState.editIndex].title = noticeForm.title;
    notices.value[modalState.editIndex].content = noticeForm.content;
  } else {
    // 새로 추가
    notices.value.unshift({
      id: notices.value.length + 10,
      title: noticeForm.title,
      content: noticeForm.content,
      author: authStore.user.name,
      date: new Date().toISOString().slice(0, 10)
    });
  }
  isModalOpen.value = false;
};

const deleteNotice = (index) => {
  if (confirm('정말 이 공지를 삭제하시겠습니까?')) {
    notices.value.splice(index, 1);
  }
};

</script>
