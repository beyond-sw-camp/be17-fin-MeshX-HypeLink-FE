<template>
  <aside class="sidebar" v-if="authStore.isLoggedIn">
    <router-link to="/" class="sidebar-header text-decoration-none">
      HypeLink
    </router-link>
    
    <nav class="nav flex-column">
      <!-- ===== 공통 메뉴 ===== -->
      <router-link to="/" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-grid-1x2-fill" viewBox="0 0 16 16"><path d="M0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V1zm0 9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5z"/></svg>
        <span>대시보드</span>
      </router-link>
      <router-link to="/communication" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chat-left-dots-fill" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
        <span>공지/소통</span>
      </router-link>

      <!-- ===== B2B 관리 (공통/역할별 분리) ===== -->
      <hr class="text-secondary my-2 bg-secondary" style="opacity: 0.1">
      <h6 class="text-secondary ps-3">B2B 관리</h6>
      <router-link v-if="authStore.isAdmin" to="/stores" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/></svg>
        <span>전체 매장 관리</span>
      </router-link>
      <router-link v-if="authStore.isStoreOwner" to="/my-store" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-shop-window" viewBox="0 0 16 16"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zM1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/></svg>
        <span>내 점포 관리</span>
      </router-link>
      <router-link to="/inventory" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/></svg>
        <span>재고 관리</span>
      </router-link>
      <router-link to="/sales" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-graph-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/></svg>
        <span>매출 관리</span>
      </router-link>
      <router-link to="/pos-support" class="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-tools" viewBox="0 0 16 16"><path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.356 3.356a1 1 0 0 0 1.414 0l1.586-1.586a1 1 0 0 0 0-1.414l-3.356-3.356a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.675-2.675A1 1 0 0 1 13 5.889h.07a1 1 0 0 0 .815-.419L16 1 15 0 1 0zM11.354 4.646a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
        <span>AS/고장 접수</span>
      </router-link>

      <!-- ===== 관리자 전용 메뉴 ===== -->
      <template v-if="authStore.isAdmin">
        <hr class="text-secondary my-2 bg-secondary" style="opacity: 0.1">
        <h6 class="text-secondary ps-3">시스템 관리</h6>
        <router-link to="/tracking" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-4 0H1.5a.5.5 0 0 1 0-1H1v-1h.5a.5.5 0 0 1 0-1H1V6h.5a.5.5 0 0 1 0-1H1V3.5zm3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM11 5V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V5h10zM4.5 11h6.02a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1 0-1zM12 8.02V6h-1v2.02a1.5 1.5 0 0 1 .17.98l.39 1.95a.5.5 0 0 1-.98.19l-.39-1.95a.5.5 0 0 1 .19-.49l.39-.39.39.39a.5.5 0 0 1 .19.49l-.39 1.95a.5.5 0 0 1-.98-.19l.39-1.95a1.5 1.5 0 0 1 .17-.98z"/></svg>
          <span>전체 배송 추적</span>
        </router-link>
        <router-link to="/customer-analytics" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pie-chart-fill" viewBox="0 0 16 16"><path d="M15.985 8.5H8.207l.055 1.992A8.01 8.01 0 0 0 16 8.5.5.5 0 0 0 15.985 8.5zM4.241 15.032a8.017 8.017 0 0 0 9.792-9.792l-9.792 9.792zM8.5.505a8.017 8.017 0 0 0-4.756 13.553l9.246-9.246A8.01 8.01 0 0 0 8.5.505z"/></svg>
          <span>고객 분석</span>
        </router-link>
        <router-link to="/pos-health" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart-pulse" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053.918 3.995.78 5.323 1.508 6.636a4.914 4.914 0 0 0 .915 1.045l4.952 4.952.707.707.707-.707 4.952-4.952a4.914 4.914 0 0 0 .915-1.045C15.22 5.323 15.082 3.995 14.6 3.053 13.486.878 10.4.281 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-2.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-2.042 23.333 4.867 8 15z"/><path d="M10.464 3.314a.5.5 0 0 0-.945.049L7.921 8.956 6.464 5.314a.5.5 0 0 0-.945-.049l-1.825 4.433a.5.5 0 0 0 .945.397L5.39 8.356l.94 2.35a.5.5 0 0 0 .945-.049l1.825-4.433a.5.5 0 0 0-.945-.397L8.61 8.356l-.94-2.35a.5.5 0 0 0-.945.049l-.005.012-1.588 3.855a.5.5 0 0 0 .945.396l1.056-2.642 1.236 3.089a.5.5 0 0 0 .945-.396l1.056-2.642 1.236 3.089a.5.5 0 0 0 .945-.396l-1.588-3.855-.005-.012z"/></svg>
          <span>POS 헬스체크</span>
        </router-link>
        <router-link to="/users" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.274.274H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          <span>사용자 관리</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
</script>

<style lang="scss" scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0; /* 사이드바 너비가 줄어들지 않도록 고정 */
  min-height: 100vh;
  background-color: #ffffff; // 흰색 배경
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  transition: margin-left 0.25s ease-in-out;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;

  .sidebar-header {
    color: #212529;
    margin-bottom: 1.5rem;
    padding-left: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .nav-link {
    color: #495057;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.75rem; // 아이콘과 텍스트 간격
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;

    &:hover {
      color: #0d6efd;
      background-color: #e9ecef;
    }

    &.router-link-exact-active {
      color: #ffffff;
      background-color: #0d6efd;
    }
  }
}
</style>
