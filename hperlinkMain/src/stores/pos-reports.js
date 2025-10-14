import { ref } from 'vue';
import { defineStore } from 'pinia';

export const usePosReportStore = defineStore('pos-reports', () => {
  const allReports = ref([
    { id: 1, storeName: 'HypeLink 강남점', issueType: '결제 오류', date: '2025-09-29', status: '접수완료', technician: null },
    { id: 2, storeName: 'HypeLink 홍대점', issueType: '화면 안 켜짐', date: '2025-09-29', status: '처리중', technician: '이전문' },
    { id: 3, storeName: 'HypeLink 부산점', issueType: '기타', date: '2025-09-28', status: '처리완료', technician: '김기술' },
    { id: 4, storeName: 'HypeLink 제주점', issueType: '영수증 프린터 문제', date: '2025-09-27', status: '접수완료', technician: null },
    { id: 5, storeName: 'HypeLink 강남점', issueType: '결제 오류', date: '2025-09-26', status: '처리중', technician: '박프로' },
  ]);

  const technicians = ref([
    { id: 1, name: '김기술', specialty: '네트워크/결제' },
    { id: 2, name: '이전문', specialty: '하드웨어/전원' },
    { id: 3, name: '박프로', specialty: '소프트웨어' },
  ]);

  const submitReport = (report) => {
    const newReport = {
      id: allReports.value.length + 10,
      ...report,
      date: new Date().toISOString().slice(0, 10),
      status: '접수완료',
      technician: null
    };
    allReports.value.unshift(newReport);
  };

  const assignTechnician = (reportId, techName) => {
    const report = allReports.value.find(r => r.id === reportId);
    if (report) {
      report.technician = techName;
      report.status = '처리중';
    }
  };

  const changeReportStatus = (reportId, status) => {
    const report = allReports.value.find(r => r.id === reportId);
    if (report) {
      report.status = status;
    }
  };

  return { allReports, technicians, submitReport, assignTechnician, changeReportStatus };
});
