<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  isSidebarOpen: Boolean
})

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)
const currentTime = ref('')

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

const handleClickOutside = (event) => {
  const userInfoWrapper = event.target.closest('.user-info-wrapper')

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