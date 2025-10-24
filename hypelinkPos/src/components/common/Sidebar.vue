<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const emit = defineEmits(['close'])

const route = useRoute()

const menuItems = [
  { name: 'POS', path: '/', icon: '🛒' },
  { name: '주문내역', path: '/orders', icon: '📋' },
  { name: '재고관리', path: '/inventory', icon: '📦' },
  { name: '리포트', path: '/reports', icon: '📊' },
  { name: '공지사항', path: '/notices', icon: '📢' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleMenuClick = () => {
  emit('close')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <h1>HypeLink</h1>
      </div>
      <button class="sidebar-close-btn" @click="emit('close')">✕</button>
    </div>

    <nav class="menu">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
        @click="handleMenuClick"
      >
        <span class="icon">{{ item.icon }}</span>
        <span class="label">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="bottom-info">
      <div class="store-name">테스트 매장</div>
      <div class="version">v1.0.0</div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.sidebar-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-close-btn:hover {
  background: var(--bg-gray);
  color: var(--text-primary);
}

.menu {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 17px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.menu-item:hover {
  background: var(--bg-gray);
}

.menu-item.active {
  background: #EBF3FF;
  color: var(--primary-color);
  font-weight: 600;
}

.menu-item .icon {
  font-size: 24px;
}

.bottom-info {
  padding: 24px 28px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-secondary);
}

.store-name {
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 15px;
}

.version {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>