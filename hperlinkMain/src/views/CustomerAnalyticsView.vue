<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import AgeDistributionChart from './customer-analytics/AgeDistributionChart.vue';
import CategorySalesChart from './customer-analytics/CategorySalesChart.vue';
import DrillDownResults from './customer-analytics/DrillDownResults.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useCustomerStore } from '@/stores/customers';
import { useCouponStore } from '@/stores/coupons';
import { useModalStore } from '@/stores/modal';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { issueCouponToCustomer, searchCustomers } from '@/api/customers';
import { getAgeDistribution, getCategoryCustomerSales } from '@/api/analytics';

const customerStore = useCustomerStore();
const couponStore = useCouponStore();
const modalStore = useModalStore();
const toastStore = useToastStore();
const authStore = useAuthStore();

const isLoading = ref(true);

// --- 필터 및 선택 상태 ---
const searchTerm = ref('');
const filterAgeGroup = ref('all');
const isSearchMode = ref(false); // 검색 모드인지 여부

const selectedCustomers = ref(new Set());
const selectedCoupon = ref(null);

// --- 정렬 및 페이지네이션 상태 ---
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// --- 드릴다운 데이터 및 로직 ---
const drillDown = ref({ title: null, items: [] });
const handleAgeSelect = (ageGroup) => {
  drillDown.value = {
    title: `'${ageGroup}' 고객이 가장 많이 구매한 품목`,
    items: customerStore.topItemsByAge[ageGroup] || []
  };
};
const handleCategorySelect = (category) => {
  drillDown.value = {
    title: `'${category}' 카테고리 인기 품목`,
    items: customerStore.topItemsByCategory[category] || []
  };
};
const clearDrillDown = () => {
  drillDown.value = { title: null, items: [] };
};

// --- 차트 데이터 ---
const ageChartSeries = ref([]);
const ageChartLabels = ref(['10대', '20대', '30대', '40대', '50대 이상']);
const categoryChartSeries = ref([]);
const categoryChartCategories = ref(['상의', '하의', '아우터', '악세서리']);

// --- 연령대 계산 헬퍼 함수 ---
const calculateAgeGroup = (birthDateString) => {
  if (!birthDateString) return '미상';
  const birthYear = new Date(birthDateString).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age < 20) return '10대';
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  return '50대 이상';
};

// --- 차트 데이터 로딩 ---
const loadChartData = async () => {
  try {
    // 연령대별 분포
    const ageResponse = await getAgeDistribution();
    const ageData = ageResponse.data || [];

    // 차트에 맞게 데이터 변환
    const ageMap = new Map();
    ageData.forEach(item => {
      ageMap.set(item.ageGroup, item.customerCount);
    });

    ageChartSeries.value = ageChartLabels.value.map(label =>
      ageMap.get(label) || 0
    );

    // 카테고리별 매출
    const categoryResponse = await getCategoryCustomerSales();
    const categoryData = categoryResponse.data || [];

    categoryChartCategories.value = categoryData.map(item => item.category);
    categoryChartSeries.value = [{
      name: '매출액',
      data: categoryData.map(item => item.salesAmount / 10000) // 만원 단위
    }];

  } catch (error) {
    console.error('Failed to load chart data:', error);
  }
};

// --- 데이터 로딩 함수 ---
const loadCustomersData = async (page = 0) => {
  try {
    await customerStore.fetchAllCustomers(page, itemsPerPage.value);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    toastStore.showToast('고객 데이터 로딩에 실패했습니다.', 'error');
  }
};

// --- 고객 검색 함수 (백엔드 검색 with 페이징) ---
const searchCustomersData = async (page = 0) => {
  try {
    const response = await searchCustomers(searchTerm.value, filterAgeGroup.value, page, itemsPerPage.value);
    if (response.data && response.data.customerInfoResList) {
      customerStore.allCustomers = response.data.customerInfoResList;
      customerStore.totalPages = response.data.totalPages;
      customerStore.totalElements = response.data.totalElements;
      customerStore.currentPage = response.data.currentPage;
    }
  } catch (error) {
    console.error('Failed to search customers:', error);
    toastStore.showToast('고객 검색에 실패했습니다.', 'error');
  }
};

// --- 데이터 로딩 ---
onMounted(async () => {
  isLoading.value = true;
  try {
    await loadCustomersData(0); // Fetch customers from backend with pagination
    await couponStore.fetchAllCoupons(); // Fetch coupons from backend
    await loadChartData(); // Load chart data
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    toastStore.showToast('데이터 로딩에 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
});

// --- 필터링 및 정렬 로직 (클라이언트 측 정렬만) ---
const filteredAndSortedCustomers = computed(() => {
  let customers = [...customerStore.allCustomers];

  // Add calculated age group to each customer
  customers = customers.map(c => ({
    ...c,
    calculatedAgeGroup: calculateAgeGroup(c.birthday) // Use 'birthday' from CustomerInfoRes
  }));

  // Sorting
  customers.sort((a, b) => {
    const valA = a[sortKey.value];
    const valB = b[sortKey.value];
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });

  return customers;
});

// --- 검색 버튼 핸들러 ---
const handleSearch = async () => {
  isSearchMode.value = true;
  currentPage.value = 1;
  await searchCustomersData(0);
};

// --- 페이지네이션 로직 (서버 페이징 사용) ---
const paginatedCustomers = computed(() => {
  return filteredAndSortedCustomers.value;
});
const totalPages = computed(() => customerStore.totalPages || 1);

// --- 표시할 페이지 버튼 계산 (최대 5개) ---
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// --- 일괄 선택 로직 ---
const isAllSelected = computed(() => {
  if (paginatedCustomers.value.length === 0) return false;
  return paginatedCustomers.value.every(c => selectedCustomers.value.has(c.customerId));
});
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    paginatedCustomers.value.forEach(c => selectedCustomers.value.delete(c.customerId));
  } else {
    paginatedCustomers.value.forEach(c => selectedCustomers.value.add(c.customerId));
  }
};

// --- 이벤트 핸들러 ---
const updatePage = async (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    // 검색 모드일 때는 검색 API 호출, 아니면 일반 목록 API 호출
    if (isSearchMode.value) {
      await searchCustomersData(page - 1);
    } else {
      await loadCustomersData(page - 1);
    }
  }
};
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

const toggleCustomerSelection = (customerId) => {
  if (selectedCustomers.value.has(customerId)) {
    selectedCustomers.value.delete(customerId);
  } else {
    selectedCustomers.value.add(customerId);
  }
};

// --- 쿠폰 발급 로직 ---
const issueCoupon = async () => {
  if (selectedCustomers.value.size === 0) {
    return toastStore.showToast('쿠폰을 발급할 고객을 선택해주세요.', 'warning');
  }
  if (!selectedCoupon.value) {
    return toastStore.showToast('발급할 쿠폰을 선택해주세요.', 'warning');
  }

  const coupon = couponStore.allCoupons.find(c => c.id === selectedCoupon.value);
  const confirmed = await modalStore.show({
    title: '쿠폰 발급 확인',
    message: `${selectedCustomers.value.size}명의 고객에게 '${coupon.name}' 쿠폰을 발급하시겠습니까?`,
    isConfirmation: true,
  });

  if (confirmed) {
    try {
      const issuePromises = Array.from(selectedCustomers.value).map(customerId => {
        return issueCouponToCustomer(customerId, selectedCoupon.value);
      });
      await Promise.all(issuePromises);
      toastStore.showToast('쿠폰이 성공적으로 발급되었습니다.', 'success');
      selectedCustomers.value.clear();
      selectedCoupon.value = null;
      await loadCustomersData(currentPage.value - 1);
    } catch (error) {
      console.error('쿠폰 발급 실패:', error);
      toastStore.showToast('쿠폰 발급에 실패했습니다.', 'error');
    }
  }
};

</script>

<template>
  <div>
    <div class="row">
      <div class="col-lg-6">
        <AgeDistributionChart :series="ageChartSeries" :labels="ageChartLabels" @data-point-selected="handleAgeSelect" />
      </div>
      <div class="col-lg-6">
        <CategorySalesChart :series="categoryChartSeries" :categories="categoryChartCategories" @data-point-selected="handleCategorySelect" />
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-lg-12">
        <BaseCard>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">고객 목록</h5>
              <div class="d-flex align-items-center">
                <input type="text" class="form-control form-control-sm me-2" placeholder="고객명/전화번호 검색" v-model="searchTerm" @keyup.enter="handleSearch">
                <select class="form-select form-select-sm me-2" v-model="filterAgeGroup">
                  <option value="all">전체 연령대</option>
                  <option v-for="age in ageChartLabels" :key="age" :value="age">{{ age }}</option>
                </select>
                <button class="btn btn-primary btn-sm search-btn" @click="handleSearch">검색</button>
              </div>
            </div>
          </template>

          <div v-if="authStore.isAdmin || authStore.isManager" v-show="selectedCustomers.size > 0" class="coupon-issue-section alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
              <span><strong>{{ selectedCustomers.size }}</strong>명의 고객 선택됨</span>
              <div class="d-flex align-items-center">
                <select class="form-select form-select-sm me-2" v-model="selectedCoupon">
                  <option :value="null" disabled>-- 발급할 쿠폰 선택 --</option>
                  <option v-for="coupon in couponStore.allCoupons" :key="coupon.id" :value="coupon.id">{{ coupon.name }}</option>
                </select>
                <button class="btn btn-primary btn-sm" @click="issueCoupon">쿠폰 발급</button>
              </div>
            </div>
          </div>

          <div v-if="paginatedCustomers.length > 0">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th style="width: 1%;"><input class="form-check-input" type="checkbox" @change="toggleSelectAll" :checked="isAllSelected"></th>
                  <th @click="updateSort('name')" class="sortable">고객명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
                  <th @click="updateSort('calculatedAgeGroup')" class="sortable">연령대 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="calculatedAgeGroup" /></th>
                  <th @click="updateSort('phone')" class="sortable">전화번호 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="phone" /></th>
                  <th @click="updateSort('birthday')" class="sortable">생년월일 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="birthday" /></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in paginatedCustomers" :key="customer.customerId" :class="{ 'table-active': selectedCustomers.has(customer.customerId) }">
                  <td><input class="form-check-input" type="checkbox" :value="customer.customerId" :checked="selectedCustomers.has(customer.customerId)" @change="toggleCustomerSelection(customer.customerId)"></td>
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.calculatedAgeGroup }}</td>
                  <td>{{ customer.phone }}</td>
                  <td>{{ customer.birthday || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <nav v-if="totalPages > 1">
              <ul class="pagination justify-content-center mt-3">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
                </li>
                <li class="page-item" v-if="visiblePages[0] > 1">
                  <a class="page-link" href="#" @click.prevent="updatePage(1)">1</a>
                </li>
                <li class="page-item disabled" v-if="visiblePages[0] > 2">
                  <span class="page-link">...</span>
                </li>
                <li class="page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
                  <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
                </li>
                <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < totalPages - 1">
                  <span class="page-link">...</span>
                </li>
                <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < totalPages">
                  <a class="page-link" href="#" @click.prevent="updatePage(totalPages)">{{ totalPages }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
                </li>
              </ul>
            </nav>
          </div>
          <BaseEmptyState v-else message="조회된 고객이 없습니다." />
        </BaseCard>
      </div>
    </div>

    <transition name="fade">
      <div class="row mt-4" v-if="drillDown.title">
        <div class="col-12">
          <DrillDownResults :drillDown="drillDown" @close="clearDrillDown" />
        </div>
      </div>
    </transition>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: #f8f9fa;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.search-btn {
  white-space: nowrap;
  min-width: 60px;
}
</style>
