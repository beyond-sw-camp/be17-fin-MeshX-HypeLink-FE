<script setup>
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<template>
  <div>
    <BaseCard class="mt-4">
      <template #header><h5>{{ authStore.user.name }}님, 환영합니다.</h5></template>
      <p>좌측 메뉴를 통해 매장을 관리하고, 필요한 지원을 요청할 수 있습니다.</p>
      
    
      <template><h5>📚 시스템 사용 가이드</h5></template>
      
      <div class="guide-section">
        <h6 class="text-primary mb-3">🏪 점포 운영 관리</h6>
        <ul class="guide-list">
          <li><strong>내 점포 관리:</strong> 점포 기본 정보 조회 및 운영 현황을 확인할 수 있습니다.</li>
          <li><strong>재고 관리:</strong> 현재 보유 중인 상품 재고를 실시간으로 확인하고 관리합니다.</li>
          <li><strong>매출 관리:</strong> 일별/월별 매출 통계를 확인하고 매출 현황을 분석합니다.</li>
        </ul>
      </div>

      <div class="guide-section">
        <h6 class="text-success mb-3">🛒 발주 및 상품 관리</h6>
        <ul class="guide-list">
          <li><strong>발주 요청:</strong> 본사에 필요한 상품을 발주 신청하고 발주 내역을 확인합니다.</li>
        </ul>
      </div>

      <div class="guide-section">
        <h6 class="text-info mb-3">💻 POS 시스템</h6>
        <ul class="guide-list">
          <li><strong>POS 관리:</strong> 점포에서 사용 중인 POS 단말기 목록과 상태를 확인합니다.</li>
          <li><strong>POS 지원:</strong> POS 시스템 관련 문의사항이나 오류 발생 시 지원을 요청합니다.</li>
        </ul>
      </div>

      <div class="guide-section">
        <h6 class="text-warning mb-3">🔧 고객 서비스</h6>
        <ul class="guide-list">
          <li><strong>AS 관리:</strong> 고객으로부터 접수된 AS 요청을 등록하고 처리 현황을 관리합니다.</li>
        </ul>
      </div>

      <div class="guide-section">
        <h6 class="text-secondary mb-3">📢 소통 및 공지</h6>
        <ul class="guide-list">
          <li><strong>공지사항:</strong> 본사에서 전달하는 중요 공지사항과 업데이트 소식을 확인합니다.</li>
          <li><strong>메신저:</strong> 본사 담당자 및 다른 점포와 실시간으로 소통할 수 있습니다.</li>
        </ul>
      </div>

      <div class="alert alert-light mt-4" role="alert">
        <strong>💡 TIP:</strong> 각 메뉴는 좌측 사이드바에서 클릭하여 이동할 수 있으며, 권한에 따라 접근 가능한 메뉴가 표시됩니다.
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.guide-section {
  padding: 1rem 0;
}

.guide-list {
  list-style: none;
  padding-left: 0;
}

.guide-list li {
  padding: 0.5rem 0;
  line-height: 1.6;
  border-bottom: 1px solid #f0f0f0;
}

.guide-list li:last-child {
  border-bottom: none;
}

.guide-list strong {
  color: #212529;
}
</style>