<script setup>
import { ref, computed } from 'vue'

const showRequestModal = ref(false)
const serviceRequests = ref([
  {
    id: 1,
    issueType: 'hardware',
    title: 'POS 프린터 용지 걸림',
    description: '영수증 출력 시 용지가 자주 걸립니다.',
    status: 'pending',
    createdAt: '2025-09-28 14:30',
    assignedTo: null
  },
  {
    id: 2,
    issueType: 'software',
    title: '결제 화면 느림',
    description: '결제 버튼 클릭 후 반응이 3초 이상 걸립니다.',
    status: 'in-progress',
    createdAt: '2025-09-25 10:15',
    assignedTo: '김기사'
  },
  {
    id: 3,
    issueType: 'network',
    title: '카드 단말기 연결 끊김',
    description: '오후 시간대에 카드 결제가 자주 실패합니다.',
    status: 'completed',
    createdAt: '2025-09-20 16:45',
    assignedTo: '이기사'
  }
])

const newRequest = ref({
  issueType: 'hardware',
  title: '',
  description: ''
})

const issueTypes = [
  { id: 'hardware', name: 'POS 하드웨어 고장', icon: '💻' },
  { id: 'printer', name: '프린터 문제', icon: '🖨️' },
  { id: 'card-terminal', name: '카드 단말기', icon: '💳' },
  { id: 'software', name: '소프트웨어 오류', icon: '⚙️' },
  { id: 'network', name: '네트워크 문제', icon: '🌐' },
  { id: 'other', name: '기타', icon: '📝' }
]

const statusList = [
  { id: 'pending', name: '대기중', color: '#FFA726' },
  { id: 'in-progress', name: '처리중', color: '#42A5F5' },
  { id: 'completed', name: '완료', color: '#66BB6A' }
]

const filteredRequests = computed(() => {
  return serviceRequests.value.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const getIssueTypeName = (type) => {
  return issueTypes.find(t => t.id === type)?.name || type
}

const getIssueTypeIcon = (type) => {
  return issueTypes.find(t => t.id === type)?.icon || '📝'
}

const getStatusInfo = (status) => {
  return statusList.find(s => s.id === status)
}

const openRequestModal = () => {
  newRequest.value = {
    issueType: 'hardware',
    title: '',
    description: ''
  }
  showRequestModal.value = true
}

const submitRequest = () => {
  if (!newRequest.value.title) {
    alert('문제 제목을 입력해주세요.')
    return
  }
  if (!newRequest.value.description) {
    alert('문제 상세 내용을 입력해주세요.')
    return
  }

  const request = {
    id: Date.now(),
    issueType: newRequest.value.issueType,
    title: newRequest.value.title,
    description: newRequest.value.description,
    status: 'pending',
    createdAt: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    assignedTo: null
  }

  serviceRequests.value.unshift(request)
  showRequestModal.value = false
  alert('A/S 요청이 접수되었습니다.')
}
</script>

<template>
  <div class="service-view">
    <div class="header">
      <div class="header-left">
        <h1>A/S 요청</h1>
        <p class="header-desc">POS 기기 및 시스템 문제 발생 시 A/S를 요청하세요</p>
      </div>
      <button class="request-btn" @click="openRequestModal">
        + A/S 요청하기
      </button>
    </div>

    <div class="requests-container">
      <div class="requests-list">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="request-card"
          :class="`status-${request.status}`"
        >
          <div class="request-header">
            <div class="request-type">
              <span class="type-icon">{{ getIssueTypeIcon(request.issueType) }}</span>
              <span class="type-name">{{ getIssueTypeName(request.issueType) }}</span>
            </div>
            <div class="request-meta">
              <span
                class="status-badge"
                :style="{ background: getStatusInfo(request.status).color }"
              >
                {{ getStatusInfo(request.status).name }}
              </span>
            </div>
          </div>

          <h3 class="request-title">{{ request.title }}</h3>
          <p class="request-description">{{ request.description }}</p>

          <div class="request-footer">
            <span class="request-date">{{ request.createdAt }}</span>
            <span v-if="request.assignedTo" class="assignee">
              담당: {{ request.assignedTo }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Modal -->
    <div v-if="showRequestModal" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>A/S 요청하기</h2>
          <button class="close-btn" @click="showRequestModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>문제 유형 <span class="required">*</span></label>
            <select v-model="newRequest.issueType">
              <option
                v-for="type in issueTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.icon }} {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>문제 제목 <span class="required">*</span></label>
            <input
              v-model="newRequest.title"
              type="text"
              placeholder="예: POS 프린터 용지 걸림"
            />
          </div>

          <div class="form-group">
            <label>상세 설명 <span class="required">*</span></label>
            <textarea
              v-model="newRequest.description"
              rows="5"
              placeholder="문제 상황을 자세히 설명해주세요"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showRequestModal = false">
            취소
          </button>
          <button class="confirm-btn" @click="submitRequest">요청하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-view {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.request-btn {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.request-btn:hover {
  background: #0052CC;
}

.requests-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 24px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  padding: 24px;
  background: var(--bg-gray);
  border-radius: 12px;
  border-left: 4px solid var(--border-color);
  transition: all 0.2s;
}

.request-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.request-card.status-pending {
  border-left-color: #FFA726;
}

.request-card.status-in-progress {
  border-left-color: #42A5F5;
}

.request-card.status-completed {
  border-left-color: #66BB6A;
  opacity: 0.7;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.request-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 20px;
}

.type-name {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}

.request-meta {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.request-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.request-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.assignee {
  font-weight: 600;
  color: var(--primary-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.required {
  color: var(--error-color);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
}

.form-group textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover {
  background: #0052CC;
}
</style>