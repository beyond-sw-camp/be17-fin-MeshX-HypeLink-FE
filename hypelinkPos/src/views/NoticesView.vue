<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import noticesAPI from '@/api/notices'

const router = useRouter()

const notices = ref([])
const loading = ref(false)
const error = ref(null)

// 페이지네이션 상태
const currentPage = ref(1)
const itemsPerPage = ref(6)
const totalPages = ref(1)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 공지사항 목록 조회 (백엔드 페이징)
const fetchNotices = async () => {
  loading.value = true
  const result = await noticesAPI.getPagedNotices({
    page: currentPage.value - 1,  // Spring Pageable은 0부터 시작
    size: itemsPerPage.value,
    sort: 'id,desc'
  })

  if (result.success) {
    notices.value = result.data.content || []
    totalPages.value = result.data.totalPages || 1
  } else {
    error.value = result.message || '공지사항을 불러올 수 없습니다.'
  }

  loading.value = false
}

// 공지사항 상세 페이지로 이동
const openNotice = (notice) => {
  router.push(`/notices/${notice.id}`)
}

// 페이지 번호 변경
const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 화면이 처음 뜰 때 실행
onMounted(() => {
  fetchNotices()
})

// 페이지 변경 시 데이터 다시 불러오기
watch(currentPage, () => {
  fetchNotices()
})
</script>

<template>
  <div class="notices-view">
    <div class="header">
      <div class="header-content">
        <h1>공지사항</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>공지사항을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
    </div>

    <!-- Notices List -->
    <div v-else class="notices-container">
      <div v-if="notices.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>공지사항이 없습니다</p>
      </div>

      <div v-else class="notices-list">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice-card"
          @click="openNotice(notice)"
        >
          <div class="notice-header">
            <span class="date">{{ formatDate(notice.date) }}</span>
          </div>
          <h3 class="notice-title">{{ notice.title }}</h3>
          <p class="notice-preview">{{ notice.contents?.split('\n')[0] || '' }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" class="pagination-container">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
          </li>
          <li
            class="page-item"
            :class="{ active: page === currentPage }"
            v-for="page in totalPages"
            :key="page"
          >
            <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
          </li>
        </ul>
      </nav>
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
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--error-color);
}

.error-icon,
.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
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

.notice-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
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

/* Pagination */
.pagination-container {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-item {
  display: inline-block;
}

.page-item.disabled .page-link {
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}

.page-item.active .page-link {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-link {
  display: block;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
}

.page-link:hover:not(.disabled) {
  background: var(--bg-gray);
}
</style>