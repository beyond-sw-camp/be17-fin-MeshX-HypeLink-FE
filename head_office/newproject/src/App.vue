<script setup>
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import BaseToast from './components/BaseToast.vue';
import TheGlobalModal from './components/TheGlobalModal.vue';
import { useUiStore } from './stores/ui';

const uiStore = useUiStore();
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': !uiStore.isSidebarOpen }">
    <AppSidebar />
    <div class="main-content">
      <AppHeader />
      <main class="p-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <BaseToast />
    <TheGlobalModal />
  </div>
</template>

<style lang="scss">
.app-layout {
  display: flex;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.25s ease-in-out;
}

main {
  background-color: #f8f9fa; // 밝은 회색 배경
  flex-grow: 1;
}
</style>
