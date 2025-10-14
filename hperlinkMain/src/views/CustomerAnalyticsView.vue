<script setup>
import { ref, computed, onMounted } from 'vue';
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

const customerStore = useCustomerStore();
const couponStore = useCouponStore();
const modalStore = useModalStore();
const toastStore = useToastStore();
const authStore = useAuthStore();

const isLoading = ref(true);

// --- 필터 및 선택 상태 ---
const searchTerm = ref('');
const filterAgeGroup = ref('all');
const filterCategory = ref('all');
const filterMembership = ref(false);
const selectedCustomers = ref(new Set());
const selectedCoupon = ref(null);

// --- 정렬 및 페이지네이션 상태 ---
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

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
const ageChartSeries = ref([15, 45, 25, 10, 5]);
const ageChartLabels = ref(['10대', '20대', '30대', '40대', '50대 이상']);
const categoryChartSeries = ref([{ name: '매출액', data: [400, 230, 180, 120] }]);
const categoryChartCategories = ref(['상의', '하의', '아우터', '악세서리']);

// --- 데이터 로딩 ---
onMounted(() => {
  setTimeout(() => { isLoading.value = false; }, 500);
});

// --- 필터링 및 정렬 로직 ---
const filteredAndSortedCustomers = computed(() => {
  let customers = [...customerStore.allCustomers];

  if (filterMembership.value) {
    customers = customers.filter(c => c.isMember);
  }
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    customers = customers.filter(c => c.name.toLowerCase().includes(term));
  }
  if (filterAgeGroup.value !== 'all') {
    customers = customers.filter(c => c.ageGroup === filterAgeGroup.value);
  }
  if (filterCategory.value !== 'all') {
    customers = customers.filter(c => c.purchaseHistory.some(p => p.category === filterCategory.value));
  }

  customers.sort((a, b) => {
    const valA = a[sortKey.value];
    const valB = b[sortKey.value];
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });

  return customers;
});

// --- 페이지네이션 로직 ---
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedCustomers.value.slice(start, end);
});
const totalPages = computed(() => Math.ceil(filteredAndSortedCustomers.value.length / itemsPerPage.value));

// --- 일괄 선택 로직 ---
const isAllSelected = computed(() => {
  if (paginatedCustomers.value.length === 0) return false;
  return paginatedCustomers.value.every(c => selectedCustomers.value.has(c.id));
});
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    paginatedCustomers.value.forEach(c => selectedCustomers.value.delete(c.id));
  } else {
    paginatedCustomers.value.forEach(c => selectedCustomers.value.add(c.id));
  }
};

// --- 이벤트 핸들러 ---
const updatePage = (page) => { if (page > 0 && page <= totalPages.value) { currentPage.value = page; } };
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
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
    console.log(`Issuing coupon ${coupon.id} to customers:`, Array.from(selectedCustomers.value));
    toastStore.showToast('쿠폰이 성공적으로 발급되었습니다.', 'success');
    selectedCustomers.value.clear();
    selectedCoupon.value = null;
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
                <div class="form-check form-check-inline me-3">
                  <input class="form-check-input" type="checkbox" v-model="filterMembership" id="memberCheck">
                  <label class="form-check-label" for="memberCheck">멤버십 고객만</label>
                </div>
                <input type="text" class="form-control form-control-sm me-2" placeholder="고객명 검색" v-model="searchTerm">
                <select class="form-select form-select-sm me-2" v-model="filterAgeGroup">
                  <option value="all">전체 연령대</option>
                  <option v-for="age in ageChartLabels" :key="age" :value="age">{{ age }}</option>
                </select>
                <select class="form-select form-select-sm" v-model="filterCategory">
                  <option value="all">전체 카테고리</option>
                  <option v-for="cat in categoryChartCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
          </template>
          
          <div v-if="authStore.isSuperAdmin || authStore.isSubAdmin" v-show="selectedCustomers.size > 0" class="coupon-issue-section alert alert-info">
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
                  <th @click="updateSort('ageGroup')" class="sortable">연령대 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="ageGroup" /></th>
                  <th @click="updateSort('totalPurchases')" class="sortable">총 구매액 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="totalPurchases" /></th>
                  <th @click="updateSort('lastPurchase')" class="sortable">최근 구매일 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="lastPurchase" /></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in paginatedCustomers" :key="customer.id" :class="{ 'table-active': selectedCustomers.has(customer.id) }">
                  <td><input class="form-check-input" type="checkbox" :value="customer.id" :checked="selectedCustomers.has(customer.id)" @change="selectedCustomers.has(customer.id) ? selectedCustomers.delete(customer.id) : selectedCustomers.add(customer.id)"></td>
                  <td>{{ customer.name }} <span v-if="customer.isMember" class="badge bg-warning">M</span></td>
                  <td>{{ customer.ageGroup }}</td>
                  <td>{{ customer.totalPurchases.toLocaleString() }}원</td>
                  <td>{{ customer.lastPurchase }}</td>
                </tr>
              </tbody>
            </table>

            <nav v-if="totalPages > 1">
              <ul class="pagination justify-content-center mt-3">
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