<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { usePermissionStore } from '@/stores/permissions';
import { useToastStore } from '@/stores/toast';

const permissionStore = usePermissionStore();
const toastStore = useToastStore();

const isLoading = ref(true);

// 스토어의 상태를 로컬 ref로 복사하여 UI와 바인딩
const allRolesData = ref({}); // { roleName: [route1, route2], ... }

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(2);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    // 스토어에서 현재 권한 데이터를 가져와 로컬 상태에 복사
    allRolesData.value = JSON.parse(JSON.stringify(permissionStore.permissions));
    isLoading.value = false;
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedRoles = computed(() => {
  let roles = Object.keys(allRolesData.value).map(key => ({ roleName: key, routes: allRolesData.value[key] }));

  // 총괄 관리자는 UI에서 직접 수정하지 않으므로 제외
  roles = roles.filter(role => role.roleName !== 'ADMIN');

  // 검색
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    roles = roles.filter(role => 
      roleText(role.roleName).toLowerCase().includes(term)
    );
  }

  // 정렬 (역할명 기준)
  roles.sort((a, b) => {
    const valA = roleText(a.roleName);
    const valB = roleText(b.roleName);
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  return roles;
});

// --- 페이지네이션 로직 ---
const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  // 필터링된 역할 데이터를 객체 형태로 다시 변환
  const paginatedArray = filteredAndSortedRoles.value.slice(start, end);
  const paginatedObj = {};
  paginatedArray.forEach(role => {
    paginatedObj[role.roleName] = role.routes;
  });
  return paginatedObj;
});

const totalPages = computed(() => Math.ceil(filteredAndSortedRoles.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const updatePermission = (roleName, route, isChecked) => {
  const allowedRoutes = allRolesData.value[roleName];
  if (isChecked) {
    if (!allowedRoutes.includes(route)) {
      allowedRoutes.push(route);
    }
  } else {
    const index = allowedRoutes.indexOf(route);
    if (index > -1) {
      allowedRoutes.splice(index, 1);
    }
  }
};

const savePermissions = () => {
  // 스토어의 액션을 호출하여 권한 업데이트
  Object.keys(allRolesData.value).forEach(roleName => {
    if (roleName !== 'ADMIN') { // 총괄 관리자는 UI에서 수정하지 않음
      permissionStore.updatePermissions(roleName, allRolesData.value[roleName]);
    }
  });
  toastStore.showToast('권한이 성공적으로 업데이트되었습니다.', 'success');
};

const roleText = (role) => {
  if (role === 'ADMIN') return '총괄 관리자';
  if (role === 'MANAGER') return '중간 관리자';
  if (role === 'BRANCH_MANAGER') return '지점장';
  return role;
};

const routeText = (route) => {
  // 라우트 이름을 보기 좋게 변환 (예: 'pos-support' -> 'AS/고장 접수')
  const routeMap = {
    'dashboard': '대시보드',
    'communication': '공지/소통 (허브)',
    'stores': '전체 매장 관리',
    'my-store': '내 점포 관리',
    'inventory': '재고 관리',
    'sales': '매출 관리',
    'pos-support': 'AS/고장 접수',
    'promotions': '프로모션 관리',
    'products': '상품 관리',
    'warehouse-inventory': '창고 재고',
    'purchase-orders': '발주서',
    'tracking': '전체 배송 추적',
    'customer-analytics': '고객 분석',
    'pos-health': 'POS 헬스체크',
    'drivers': '드라이버 관리',
    'users': '사용자 관리',
    'roles': '권한 관리',
    'announcements': '공지사항',
    'messenger': '메신저',
  };
  return routeMap[route] || route;
};
</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">역할별 권한 관리</h5>
          <div class="d-flex">
            <input type="text" class="form-control form-control-sm me-2" placeholder="역할명 검색" v-model="searchTerm">
            <button class="btn btn-primary btn-sm" @click="savePermissions">변경사항 저장</button>
          </div>
        </div>
      </template>
      <p class="text-muted">총괄 관리자(ADMIN)는 시스템의 모든 권한을 가집니다.</p>
      <hr>
      
      <div v-if="Object.keys(paginatedRoles).length > 0">
        <div v-for="(roleData, roleName) in paginatedRoles" :key="roleName" class="mb-4">
          <div v-if="roleName !== 'ADMIN'">
            <h4>'{{ roleText(roleName) }}' 역할의 권한</h4>
            <div class="row">
              <div v-for="route in permissionStore.allRoutes" :key="route" class="col-md-4 col-sm-6">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="`${roleName}-${route}`" 
                    :value="route"
                    :checked="roleData.includes(route)"
                    @change="updatePermission(roleName, route, $event.target.checked)"
                  >
                  <label class="form-check-label" :for="`${roleName}-${route}`">
                    {{ routeText(route) }}
                  </label>
                </div>
              </div>
            </div>
            <hr>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 역할이 없습니다." />
    </BaseCard>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>