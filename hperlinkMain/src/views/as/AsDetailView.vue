<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsStore } from '@/stores/as';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const asStore = useAsStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();

const asId = ref(route.params.id);
const isEditing = ref(false);
const editableDescription = ref('');
const newComment = ref('');
const newStatus = ref(''); // For Head Office to change status

const currentAsRequest = computed(() => asStore.selectedAsRequest);
const canEditOrDelete = computed(() => {
  return authStore.isBranchManager && currentAsRequest.value?.status === 'PENDING';
});
const canChangeStatus = computed(() => {
  return (authStore.isAdmin || authStore.isManager) && currentAsRequest.value?.status !== 'COMPLETED';
});
const canAddComment = computed(() => authStore.isAdmin || authStore.isManager);

onMounted(async () => {
  await asStore.fetchAsRequestDetail(asId.value);
  if (currentAsRequest.value) {
    editableDescription.value = currentAsRequest.value.description;
    newStatus.value = currentAsRequest.value.status;
  }
});

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editableDescription.value = currentAsRequest.value.description;
};

const saveChanges = async () => {
  const result = await asStore.updateAsRequest(asId.value, { description: editableDescription.value });
  if (result.success) {
    toastStore.showToast('AS 요청이 수정되었습니다.', 'success');
    isEditing.value = false;
  } else {
    toastStore.showToast(result.message || 'AS 요청 수정에 실패했습니다.', 'danger');
  }
};

const deleteRequest = async () => {
  if (confirm('정말로 이 AS 요청을 삭제하시겠습니까?')) {
    const result = await asStore.deleteAsRequest(asId.value);
    if (result.success) {
      toastStore.showToast('AS 요청이 삭제되었습니다.', 'success');
      router.push({ name: 'asList' });
    } else {
      toastStore.showToast(result.message || 'AS 요청 삭제에 실패했습니다.', 'danger');
    }
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) {
    toastStore.showToast('코멘트 내용을 입력해주세요.', 'danger');
    return;
  }
  const result = await asStore.addAsComment(asId.value, { description: newComment.value });
  if (result.success) {
    toastStore.showToast('코멘트가 추가되었습니다.', 'success');
    newComment.value = '';
  } else {
    toastStore.showToast(result.message || '코멘트 추가에 실패했습니다.', 'danger');
  }
};

const changeStatus = async () => {
  const result = await asStore.updateAsStatus(asId.value, { status: newStatus.value });
  if (result.success) {
    toastStore.showToast('AS 상태가 변경되었습니다.', 'success');
  } else {
    toastStore.showToast(result.message || 'AS 상태 변경에 실패했습니다.', 'danger');
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-warning text-dark';
    case 'APPROVED': return 'bg-success';
    case 'REJECTED': return 'bg-danger';
    case 'COMPLETED': return 'bg-primary';
    default: return 'bg-secondary';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return '대기중';
    case 'APPROVED': return '처리중';
    case 'REJECTED': return '거절';
    case 'COMPLETED': return '완료';
    default: return status;
  }
};

const getRoleBadge = (role) => {
  switch (role) {
    case 'ADMIN': return { text: '총괄 관리자', class: 'role-badge-admin' };
    case 'MANAGER': return { text: '중간 관리자', class: 'role-badge-manager' };
    case 'BRANCH_MANAGER': return { text: '지점장', class: 'role-badge-branch' };
    case 'POS_MEMBER': return { text: 'POS 직원', class: 'role-badge-pos' };
    case 'DRIVER': return { text: '배송기사', class: 'role-badge-driver' };
    default: return { text: role, class: 'role-badge-default' };
  }
};
</script>

<template>
  <div class="as-detail-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>AS 요청 상세</h2>
      <button class="btn btn-secondary" @click="router.back()">목록으로</button>
    </div>

    <BaseSpinner v-if="asStore.isLoading" />
    <div v-else-if="asStore.error" class="alert alert-danger">{{ asStore.error }}</div>
    <div v-else-if="!currentAsRequest" class="alert alert-info">AS 요청을 찾을 수 없습니다.</div>
    <div v-else>
      <BaseCard class="mb-3">
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ currentAsRequest.title }}</h5>
            <span :class="['badge', getStatusBadgeClass(currentAsRequest.status)]">{{ getStatusText(currentAsRequest.status) }}</span>
          </div>
        </template>
        <div class="mb-2">
          <span class="text-muted small">접수일: </span>
          <span class="fw-medium">{{ formatDate(currentAsRequest.createdAt) }}</span>
        </div>
        <div class="mb-3" v-if="currentAsRequest.storeName">
          <span class="text-muted small">매장: </span>
          <span class="fw-medium">{{ currentAsRequest.storeName }}</span>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">내용:</label>
          <div v-if="!isEditing">{{ currentAsRequest.description }}</div>
          <textarea v-else class="form-control" rows="5" v-model="editableDescription"></textarea>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <template v-if="canEditOrDelete">
            <button v-if="!isEditing" class="btn btn-sm btn-outline-secondary me-2" @click="startEditing">수정</button>
            <template v-else>
              <button class="btn btn-sm btn-secondary me-2" @click="cancelEditing">취소</button>
              <button class="btn btn-sm btn-primary me-2" @click="saveChanges">저장</button>
            </template>
            <button class="btn btn-sm btn-outline-danger" @click="deleteRequest">삭제</button>
          </template>
        </div>
      </BaseCard>

      <!-- Head Office: Status Change -->
      <BaseCard v-if="authStore.isAdmin || authStore.isManager" class="mb-3">
        <template #header><h5>AS 상태 변경</h5></template>
        <div class="d-flex align-items-center">
          <select class="form-select me-2" v-model="newStatus" :disabled="!canChangeStatus">
            <option value="PENDING">대기중</option>
            <option value="APPROVED">처리중</option>
            <option value="REJECTED">거절</option>
            <option value="COMPLETED">완료</option>
          </select>
          <button class="btn btn-primary" @click="changeStatus" :disabled="!canChangeStatus || newStatus === currentAsRequest.status">
            상태 변경
          </button>
        </div>
      </BaseCard>

      <!-- Comments Section -->
      <BaseCard v-if="authStore.isAdmin || authStore.isManager" class="mb-3">
        <template #header>
          <h5>코멘트</h5>
        </template>

        <!-- Existing Comments -->
        <div v-if="currentAsRequest.comments && currentAsRequest.comments.length > 0" class="comments-list mb-4">
          <div v-for="comment in currentAsRequest.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-author-section">
                <span class="comment-author">{{ comment.memberName || '관리자' }}</span>
                <span v-if="comment.memberRole" :class="['role-badge', getRoleBadge(comment.memberRole).class]">
                  {{ getRoleBadge(comment.memberRole).text }}
                </span>
              </div>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">
              {{ comment.description }}
            </div>
          </div>
        </div>
        <div v-else class="text-muted mb-4">
          <small>아직 코멘트가 없습니다.</small>
        </div>

        <!-- Add Comment -->
        <div class="add-comment-section">
          <label class="form-label small text-muted">코멘트 추가</label>
          <div class="d-flex gap-2">
            <textarea
              class="form-control form-control-sm"
              rows="2"
              v-model="newComment"
              :disabled="!canAddComment"
              placeholder="코멘트를 입력하세요..."
            ></textarea>
            <button
              class="btn btn-sm btn-primary align-self-end"
              @click="submitComment"
              :disabled="!canAddComment || !newComment.trim()"
              style="white-space: nowrap;"
            >
              작성
            </button>
          </div>
        </div>
      </BaseCard>

    </div>
  </div>
</template>

<style scoped>
.as-detail-view {
  padding: 20px;
}

.comments-list {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.comment-item {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-author {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
}

.role-badge-admin {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.role-badge-manager {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.role-badge-branch {
  background-color: #e8f5e9;
  color: #388e3c;
  border: 1px solid #c8e6c9;
}

.role-badge-pos {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffe0b2;
}

.role-badge-driver {
  background-color: #fce4ec;
  color: #c2185b;
  border: 1px solid #f8bbd0;
}

.role-badge-default {
  background-color: #f5f5f5;
  color: #616161;
  border: 1px solid #e0e0e0;
}

.comment-date {
  font-size: 12px;
  color: #6c757d;
}

.comment-content {
  color: #212529;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.add-comment-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.add-comment-section .form-label {
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
