<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noticesAPI from '@/api/notices'

const route = useRoute()
const router = useRouter()

const notice = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchNoticeDetail = async () => {
  loading.value = true
  const result = await noticesAPI.getNoticeDetail(route.params.id)

  if (result.success) {
    notice.value = result.data
  } else {
    error.value = result.message || '공지사항을 불러올 수 없습니다.'
  }

  loading.value = false
}

const goBack = () => {
  router.push('/notices')
}

onMounted(() => {
  fetchNoticeDetail()
})
</script>

<template>
  <div class="notice-detail-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>공지사항을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">목록으로 돌아가기</button>
    </div>

    <!-- Content -->
    <div v-else-if="notice" class="notice-content">
      <div class="notice-header">
        <div class="header-top">
          <button class="back-button" @click="goBack">
            ← 목록으로
          </button>
          <div class="notice-meta">
            <span class="author">작성자: {{ notice.author }}</span>
            <span class="divider">•</span>
            <span class="date">{{ formatDate(notice.date) }}</span>
          </div>
        </div>
        <h1 class="notice-title">{{ notice.title }}</h1>
      </div>

      <div class="notice-body">
        <div class="notice-text">{{ notice.contents }}</div>

        <!-- Images -->
        <div v-if="notice.images && notice.images.length > 0" class="notice-images">
          <div v-for="image in notice.images" :key="image.id" class="image-item">
            <img :src="image.imageUrl" :alt="image.originalName" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-detail-view {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.loading-state,
.error-state {
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

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.back-btn {
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #0052CC;
}

.notice-content {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.notice-header {
  padding: 32px;
  border-bottom: 1px solid var(--border-color);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--bg-gray);
}

.notice-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.divider {
  color: var(--border-color);
}

.notice-body {
  padding: 32px;
}

.notice-text {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.8;
  white-space: pre-line;
  margin-bottom: 32px;
}

.notice-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.image-item img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
