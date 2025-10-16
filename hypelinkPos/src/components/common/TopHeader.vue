<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  isSidebarOpen: Boolean
})

const emit = defineEmits(['toggle-sidebar'])

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()
const router = useRouter()

const showNotifications = ref(false)
const showUserMenu = ref(false)
const currentTime = ref('')

// 임시 공지사항 데이터 (나중에 store로 분리)
const unreadNotices = ref([
  { id: 1, title: '시스템 정기 점검 안내', type: 'notice' },
  { id: 2, title: '가을 맞이 특별 이벤트', type: 'event' }
])

const updateTime = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[now.getDay()]

  const period = hours < 12 ? '오전' : '오후'
  const displayHours = hours % 12 || 12

  currentTime.value = `${month}.${day}(${dayName}) ${period} ${displayHours}:${minutes}:${seconds}`
}

const notifications = computed(() => {
  const list = []

  // 재고 부족/없음 알림
  inventoryStore.lowStockItems.forEach(item => {
    if (item.currentStock === 0) {
      list.push({
        id: `stock-${item.productId}`,
        type: 'stock-empty',
        title: `${item.productName} 재고 없음`,
        message: '재고를 확인해주세요',
        link: '/inventory'
      })
    } else if (item.currentStock <= item.minStock) {
      list.push({
        id: `stock-${item.productId}`,
        type: 'stock-low',
        title: `${item.productName} 재고 부족`,
        message: `현재 ${item.currentStock}개 남음`,
        link: '/inventory'
      })
    }
  })

  // 안읽은 공지사항
  unreadNotices.value.forEach(notice => {
    list.push({
      id: `notice-${notice.id}`,
      type: notice.type === 'notice' ? 'notice' : 'event',
      title: notice.title,
      message: '새로운 공지사항이 있습니다',
      link: '/notices'
    })
  })

  return list
})

const totalCount = computed(() => notifications.value.length)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const goToLink = (link) => {
  router.push(link)
  showNotifications.value = false
}

const getNotificationIcon = (type) => {
  switch(type) {
    case 'stock-empty': return '❌'
    case 'stock-low': return '⚠️'
    case 'notice': return '📢'
    case 'event': return '🎉'
    default: return '🔔'
  }
}

const getNotificationClass = (type) => {
  switch(type) {
    case 'stock-empty': return 'noti-error'
    case 'stock-low': return 'noti-warning'
    case 'notice': return 'noti-info'
    case 'event': return 'noti-event'
    default: return ''
  }
}

const handleClickOutside = (event) => {
  const notificationWrapper = event.target.closest('.notification-wrapper')
  const userInfoWrapper = event.target.closest('.user-info-wrapper')

  if (!notificationWrapper && showNotifications.value) {
    showNotifications.value = false
  }

  if (!userInfoWrapper && showUserMenu.value) {
    showUserMenu.value = false
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
    router.push('/login')
  }
}

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

let timeInterval = null

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <header class="top-header">
    <div class="header-left">
      <button class="menu-toggle-btn" @click="handleToggleSidebar">
        <span class="menu-icon">☰</span>
      </button>
    </div>

    <div class="header-right">
      <h2>{{ currentTime }}</h2>

      <div class="notification-wrapper">
        <button class="notification-btn" @click="toggleNotifications">
          <span class="bell-icon">🔔</span>
          <span v-if="totalCount > 0" class="notification-badge">{{ totalCount }}</span>
        </button>

        <div v-if="showNotifications" class="notification-dropdown">
          <div class="dropdown-header">
            <h3>알림</h3>
            <span class="notification-count">{{ totalCount }}개</span>
          </div>

          <div class="dropdown-body">
            <div v-if="notifications.length === 0" class="empty-notifications">
              <span class="empty-icon">✓</span>
              <p>새로운 알림이 없습니다</p>
            </div>

            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="getNotificationClass(notification.type)"
              @click="goToLink(notification.link)"
            >
              <span class="noti-icon">{{ getNotificationIcon(notification.type) }}</span>
              <div class="noti-content">
                <div class="noti-title">{{ notification.title }}</div>
                <div class="noti-message">{{ notification.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="user-info-wrapper">
        <button class="user-info" @click="toggleUserMenu">
          <span class="user-icon">🏪</span>
          <span class="user-name">{{ authStore.currentUser?.name || '지점' }}</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <div v-if="showUserMenu" class="user-menu-dropdown">
          <div class="user-menu-header">
            <div class="user-menu-name">{{ authStore.currentUser?.name }}</div>
            <div class="user-menu-id">{{ authStore.currentUser?.username }}</div>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <span class="logout-icon">🚪</span>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-header {
  height: 64px;
  background: #2C3E50;
  border-bottom: 1px solid #1a252f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 250;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-icon {
  font-size: 24px;
  color: white;
}

.header-left h2 {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-right h2 {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: var(--bg-gray);
}

.bell-icon {
  font-size: 20px;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  background: var(--error-color);
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 360px;
  max-height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h3 {
  font-size: 16px;
  font-weight: 700;
}

.notification-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.dropdown-body {
  overflow-y: auto;
  max-height: 400px;
}

.empty-notifications {
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-notifications p {
  color: var(--text-secondary);
  font-size: 14px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--bg-gray);
}

.noti-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.noti-content {
  flex: 1;
}

.noti-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.noti-message {
  font-size: 13px;
  color: var(--text-secondary);
}

.noti-error {
  background: #FFF5F5;
  border-left: 3px solid var(--error-color);
}

.noti-warning {
  background: #FFFBF0;
  border-left: 3px solid var(--warning-color);
}

.noti-info {
  background: #F0F9FF;
  border-left: 3px solid var(--primary-color);
}

.noti-event {
  background: #FFF3E0;
  border-left: 3px solid var(--warning-color);
}

.user-info-wrapper {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-gray);
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-info:hover {
  background: #E5E8EB;
}

.user-icon {
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.user-menu-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.user-menu-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-gray);
}

.user-menu-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-menu-id {
  font-size: 13px;
  color: var(--text-secondary);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: none;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: var(--error-color);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #FFF5F5;
}

.logout-icon {
  font-size: 18px;
}
</style>