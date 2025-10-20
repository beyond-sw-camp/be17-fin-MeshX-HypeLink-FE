import { ref } from 'vue';
import { defineStore } from 'pinia';

export const usePermissionStore = defineStore('permissions', () => {
  // 시스템에 존재하는 모든 라우트(페이지)의 이름
  const allRoutes = [
    'dashboard', 'stores', 'my-store', 'inventory', 
    'sales', 'pos-support', 'promotions', 'tracking', 'customer-analytics', 
    'pos-health', 'drivers', 'users', 'roles', 'announcements', 'messenger',
    'products', 'warehouse-inventory', 'purchase-orders', 'announcement-detail', 'coupons'
  ];

  // 역할별 접근 가능한 라우트 이름 목록 (기본값)
  const permissions = ref({
    ADMIN: [...allRoutes], // 모든 권한
    MANAGER: ['dashboard', 'announcements', 'announcement-detail', 'messenger', 'stores', 'inventory', 'sales', 'pos-support', 'promotions', 'tracking', 'customer-analytics', 'pos-health', 'drivers', 'products', 'warehouse-inventory', 'purchase-orders', 'coupons'], // 사용자 관리 제외
    BRANCH_MANAGER: ['dashboard', 'announcements', 'announcement-detail', 'messenger', 'my-store', 'inventory', 'sales', 'pos-support', 'purchase-orders'],
  });

  // 특정 역할이 특정 라우트에 접근할 수 있는지 확인하는 함수
  const canAccess = (role, routeName) => {
    return permissions.value[role]?.includes(routeName) || false;
  };

  // 권한을 업데이트하는 함수
  const updatePermissions = (role, allowedRoutes) => {
    permissions.value[role] = allowedRoutes;
  };

  return { allRoutes, permissions, canAccess, updatePermissions };
});
