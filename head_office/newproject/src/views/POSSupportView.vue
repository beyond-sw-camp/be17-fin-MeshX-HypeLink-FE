<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { usePosReportStore } from '@/stores/pos-reports';
import POSReportForm from './pos-support/POSReportForm.vue';
import POSReportList from './pos-support/POSReportList.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();
const posReportStore = usePosReportStore();

const isLoading = ref(true);

// 모달 및 폼 상태
const isTechModalOpen = ref(false);
const selectedReport = ref(null);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedReports = computed(() => {
  let reports = [...posReportStore.allReports];

  if (authStore.isStoreManager) {
    reports = reports.filter(report => report.storeName === authStore.user.name);
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    reports = reports.filter(report => 
      report.issueType.toLowerCase().includes(term) || 
      report.storeName.toLowerCase().includes(term) ||
      report.technician?.toLowerCase().includes(term)
    );
  }

  if (filterStatus.value !== 'all') {
    reports = reports.filter(report => report.status === filterStatus.value);
  }

  if (sortKey.value) {
    reports.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return reports;
});

// --- 페이지네이션 로직 ---
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedReports.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedReports.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSearchTerm = (term) => { searchTerm.value = term; currentPage.value = 1; };
const updateFilterStatus = (status) => { filterStatus.value = status; currentPage.value = 1; };
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { currentPage.value = page; };

const handleSubmitReport = (formData) => {
  posReportStore.submitReport({ ...formData, storeName: authStore.user.name });
  toastStore.showToast('신고가 접수되었습니다.', 'success');
};

const openTechModal = (reportId) => {
  selectedReport.value = posReportStore.allReports.find(r => r.id === reportId);
  isTechModalOpen.value = true;
};

const handleAssignTechnician = (techName) => {
  if (selectedReport.value) {
    posReportStore.assignTechnician(selectedReport.value.id, techName);
    toastStore.showToast(`${selectedReport.value.storeName} ${selectedReport.value.issueType} 건에 ${techName} 기사가 배정되었습니다.`, 'success');
  }
  isTechModalOpen.value = false;
};

const handleChangeReportStatus = ({ id, status }) => {
  posReportStore.changeReportStatus(id, status);
  toastStore.showToast(`신고 #${id} 상태가 ${status}(으)로 변경되었습니다.`, 'success');
};
</script>

<template>
  <div>
    <!-- 점주용 화면 -->
    <div v-if="authStore.isStoreManager" class="row">
      <div class="col-lg-5">
        <POSReportForm :storeName="authStore.user.name" @submit-report="handleSubmitReport" />
      </div>
      <div class="col-lg-7">
        <POSReportList 
          title="내 접수 현황" 
          :reports="paginatedReports"
          :totalReports="filteredAndSortedReports.length"
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :sortKey="sortKey"
          :sortOrder="sortOrder"
          :searchTerm="searchTerm"
          :filterStatus="filterStatus"
          @update:search-term="updateSearchTerm"
          @update:filter-status="updateFilterStatus"
          @update:sort="updateSort"
          @update:page="updatePage"
        />
      </div>
    </div>

    <!-- 관리자용 화면 -->
    <div v-if="authStore.isSuperAdmin || authStore.isSubAdmin">
      <POSReportList 
        title="전체 POS 신고 접수 현황" 
        :reports="paginatedReports"
        :totalReports="filteredAndSortedReports.length"
        :currentPage="currentPage"
        :itemsPerPage="itemsPerPage"
        :sortKey="sortKey"
        :sortOrder="sortOrder"
        :searchTerm="searchTerm"
        :filterStatus="filterStatus"
        @assign-tech="openTechModal"
        @change-status="handleChangeReportStatus"
        @update:search-term="updateSearchTerm"
        @update:filter-status="updateFilterStatus"
        @update:sort="updateSort"
        @update:page="updatePage"
      />
    </div>

    <!-- 담당자 배정 모달 -->
    <BaseModal v-model="isTechModalOpen">
      <template #header><h5>담당 기술자 배정</h5></template>
      <p><strong>{{ selectedReport?.storeName }}</strong> ({{selectedReport?.issueType}}) 건에 대한 담당자를 배정합니다.</p>
      <div class="list-group">
        <a 
          href="#" 
          class="list-group-item list-group-item-action" 
          v-for="tech in posReportStore.technicians" 
          :key="tech.id"
          @click.prevent="handleAssignTechnician(tech.name)"
        >
          {{ tech.name }} - {{ tech.specialty }}
        </a>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isTechModalOpen = false">취소</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>