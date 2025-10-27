<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from './components/common/Sidebar.vue'
import TopHeader from './components/common/TopHeader.vue'
import { useAuthStore } from '@/stores/auth'

const isSidebarOpen = ref(false)
const authStore = useAuthStore()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 앱 시작 시 자동 세션 복원 시도
onMounted(async () => {
  try {
    await authStore.checkAuth()
  } catch (error) {
    console.log('세션 복원 실패:', error)
  }
})
</script>

<template>
  <div class="app-container">
    <TopHeader :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />
    <div class="content-wrapper" :class="{ dimmed: isSidebarOpen }">
      <main class="main-content">
        <RouterView />
      </main>
    </div>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="toggleSidebar"></div>
    <Sidebar v-if="isSidebarOpen" class="sidebar-overlay" @close="toggleSidebar" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #0064FF;
  --text-primary: #191F28;
  --text-secondary: #4E5968;
  --border-color: #E5E8EB;
  --bg-gray: #F9FAFB;
  --success-color: #12B564;
  --error-color: #F04452;
  --warning-color: #FFAE0D;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo',
               'Noto Sans KR', sans-serif;
  color: var(--text-primary);
  background: #fff;
}

.app-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-gray);
}

.content-wrapper.dimmed::after {
  content: '';
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 150;
  pointer-events: none;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 290;
  background: rgba(0, 0, 0, 0.3);
}

.sidebar-overlay {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 300;
}
</style>
