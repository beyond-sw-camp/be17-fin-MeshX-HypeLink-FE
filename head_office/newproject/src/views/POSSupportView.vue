<template>
  <div>
    <!-- 점주용 화면 -->
    <div v-if="authStore.isStoreOwner" class="row">
      <div class="col-lg-5">
        <POSReportForm :storeName="authStore.user.name" @submit-report="submitReport" />
      </div>
      <div class="col-lg-7">
        <POSReportList title="내 접수 현황" :reports="myReports" :is-admin="false" />
      </div>
    </div>

    <!-- 관리자용 화면 -->
    <div v-if="authStore.isSuperAdmin || authStore.isSubAdmin">
      <POSReportList 
        title="전체 POS 신고 접수 현황" 
        :reports="reports" 
        :is-admin="true"
        @assign-tech="openTechModal"
        @change-status="changeReportStatus"
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
          v-for="tech in technicians" 
          :key="tech.id"
          @click.prevent="assignTechnician(tech.name)"
        >
          {{ tech.name }} - {{ tech.specialty }}
        </a>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isTechModalOpen = false">취소</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import POSReportForm from './pos-support/POSReportForm.vue';
import POSReportList from './pos-support/POSReportList.vue';
import BaseModal from '@/components/BaseModal.vue';

const authStore = useAuthStore();

// --- 데이터 --- 
const reports = ref([
  { id: 3, storeName: 'HypeLink 부산점', issueType: '기타', date: '2025-09-28', status: '처리완료', technician: '김기술' },
  { id: 2, storeName: 'HypeLink 홍대점', issueType: '화면 안 켜짐', date: '2025-09-29', status: '처리중', technician: '이전문' },
  { id: 1, storeName: 'HypeLink 강남점', issueType: '결제 오류', date: '2025-09-29', status: '접수완료', technician: null },
]);

const technicians = ref([
  { id: 1, name: '김기술', specialty: '네트워크/결제' },
  { id: 2, name: '이전문', specialty: '하드웨어/전원' },
  { id: 3, name: '박프로', specialty: '소프트웨어' },
]);

// --- 점주 로직 ---
const myReports = computed(() => 
  reports.value.filter(r => r.storeName === authStore.user?.name)
);

const submitReport = (formData) => {
  if (!formData.issueType || !formData.description) {
    alert('모든 항목을 입력해주세요.');
    return;
  }
  const newReport = {
    id: reports.value.length + 10,
    storeName: authStore.user.name,
    ...formData,
    date: new Date().toISOString().slice(0, 10),
    status: '접수완료',
    technician: null
  };
  reports.value.unshift(newReport);
};

// --- 관리자 로직 ---
const isTechModalOpen = ref(false);
const selectedReport = ref(null);

const openTechModal = (reportId) => {
  selectedReport.value = reports.value.find(r => r.id === reportId);
  isTechModalOpen.value = true;
};

const assignTechnician = (techName) => {
  if (selectedReport.value) {
    selectedReport.value.technician = techName;
    selectedReport.value.status = '처리중'; // 담당자 배정 시 상태 자동 변경
  }
  isTechModalOpen.value = false;
};

const changeReportStatus = ({ id, status }) => {
  const report = reports.value.find(r => r.id === id);
  if (report) {
    report.status = status;
  }
};

</script>
