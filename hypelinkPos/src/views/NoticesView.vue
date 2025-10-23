<script setup>
import { ref, computed } from 'vue'

// 임시 데이터 (나중에 API로 교체)
const notices = ref([
  {
    id: 1,
    type: 'notice',
    title: '시스템 정기 점검 안내',
    content: '2025년 10월 5일 새벽 2시~4시까지 시스템 정기 점검이 진행됩니다.\n해당 시간에는 일부 기능이 제한될 수 있습니다.',
    date: '2025-09-28',
    isRead: false
  },
  {
    id: 2,
    
    title: '가을 신상품 특별 할인',
    content: '10월 한 달간 가을 의류 신상품 할인 이벤트가 진행됩니다.\n아우터 및 니트 제품 최대 20% 할인!',
    date: '2025-09-25',
    isRead: false
  },
  {
    id: 3,
    type: 'notice',
    title: 'POS 시스템 업데이트 완료',
    content: '새로운 기능이 추가되었습니다.\n- 영수증 출력 개선\n- 재고 관리 UI 개선\n- 성능 최적화',
    date: '2025-09-20',
    isRead: true
  },
  {
    id: 4,
    
    title: '추석 연휴 운영 안내',
    content: '추석 연휴 기간 본사 고객센터 운영이 제한됩니다.\n긴급 문의는 비상연락망을 이용해주세요.',
    date: '2025-09-15',
    isRead: true
  }
])

const selectedNotice = ref(null)
const showDetail = ref(false)

const filteredNotices = computed(() => {
  return notices.value
})

const unreadCount = computed(() => {
  return notices.value.filter(n => !n.isRead).length
})

const openNotice = (notice) => {
  selectedNotice.value = notice
  showDetail.value = true
  notice.isRead = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedNotice.value = null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="notices-view">
    <div class="header">
      <div class="header-content">
        <h1>공지사항</h1>
        <span v-if="unreadCount > 0" class="unread-badge">
          안읽은 공지 {{ unreadCount }}개
        </span>
      </div>
      
    </div>

    <div class="notices-container">
      <div class="notices-list">
        <div
          v-for="notice in filteredNotices"
          :key="notice.id"
          class="notice-card"
          :class="{ unread: !notice.isRead }"
          @click="openNotice(notice)"
        >
          <div class="notice-header">
            <div class="badges">
              <span v-if="!notice.isRead" class="new-badge">NEW</span>
            </div>
            <span class="date">{{ formatDate(notice.date) }}</span>
          </div>
          <h3 class="notice-title">{{ notice.title }}</h3>
          <p class="notice-preview">{{ notice.content.split('\n')[0] }}</p>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail && selectedNotice" class="modal-overlay" >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="badges">
            </div>
            <h2>{{ selectedNotice.title }}</h2>
            <span class="date">{{ formatDate(selectedNotice.date) }}</span>
          </div>
          <button class="close-btn" @click="closeDetail">✕</button>
        </div>

        <div class="modal-body">
          <div class="notice-content">
            {{ selectedNotice.content }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="confirm-btn" @click="closeDetail">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notices-view {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
}

.unread-badge {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}



.notices-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.notices-list {
  display: flex;
  flex-direction: column;
}

.notice-card {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.notice-card:last-child {
  border-bottom: none;
}

.notice-card:hover {
  background: var(--bg-gray);
}

.notice-card.unread {
  background: #F8FAFC;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.badges {
  display: flex;
  gap: 8px;
}



.new-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.date {
  font-size: 13px;
  color: var(--text-secondary);
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.notice-preview {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header-content {
  flex: 1;
}

.modal-header-content .badges {
  margin-bottom: 12px;
}

.modal-header-content h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
}

.modal-header-content .date {
  font-size: 14px;
  color: var(--text-secondary);
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
  flex-shrink: 0;
  margin-left: 16px;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.notice-content {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.8;
  white-space: pre-line;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.confirm-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: #0052CC;
}
</style>