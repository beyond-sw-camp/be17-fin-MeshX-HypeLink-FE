<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';

const authStore = useAuthStore();
const showGuide = ref(true);
</script>

<template>
  <div>
    <!-- 사용 가이드 섹션 -->
    <div v-if="showGuide" class="row mb-4">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ authStore.user.name }}님, 환영합니다!</h5>
              <button class="btn btn-sm btn-outline-secondary" @click="showGuide = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
                닫기
              </button>
            </div>
          </template>

          <div class="guide-header mb-4">
            <h5>시스템 사용 가이드</h5>
            <p class="text-muted">좌측 메뉴를 통해 다양한 기능을 이용하실 수 있습니다.</p>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="guide-section">
                <h6 class="text-primary mb-3">B2B 운영 관리</h6>
                <ul class="guide-list">
                  <li><strong>전체 매장 관리:</strong> 모든 가맹점의 정보와 운영 현황을 통합 관리합니다.</li>
                  <li><strong>상품 관리:</strong> 전체 상품 카탈로그를 등록하고 수정합니다.</li>
                  <li><strong>창고 재고:</strong> 본사 창고의 재고를 실시간으로 확인하고 관리합니다.</li>
                  <li><strong>발주서:</strong> 가맹점의 발주 요청을 확인하고 승인/처리합니다.</li>
                  <li><strong>POS 기기 관리:</strong> 전체 POS 단말기 현황과 상태를 모니터링합니다.</li>
                </ul>
              </div>

              <div class="guide-section mt-4">
                <h6 class="text-success mb-3">마케팅 & 프로모션</h6>
                <ul class="guide-list">
                  <li><strong>프로모션 관리:</strong> 전사 프로모션을 기획하고 운영합니다.</li>
                  <li><strong>쿠폰 관리:</strong> 고객 대상 쿠폰을 발행하고 사용 현황을 추적합니다.</li>
                </ul>
              </div>
            </div>

            <div class="col-md-6">
              <div class="guide-section">
                <h6 class="text-info mb-3">데이터 분석 & 모니터링</h6>
                <ul class="guide-list">
                  <li><strong>통합 분석 대시보드:</strong> 전사 매출, 재고, 운영 지표를 한눈에 확인합니다.</li>
                  <li><strong>고객 분석:</strong> 고객 행동 패턴과 구매 데이터를 분석합니다.</li>
                  <li><strong>매출 관리:</strong> 전체 매장의 매출 현황과 추이를 분석합니다.</li>
                  <li><strong>POS 헬스체크:</strong> POS 시스템의 상태를 실시간으로 모니터링합니다.</li>
                </ul>
              </div>

              <div class="guide-section mt-4">
                <h6 class="text-warning mb-3">물류 & 고객 서비스</h6>
                <ul class="guide-list">
                  <li><strong>전체 배송 추적:</strong> 모든 배송 건의 실시간 위치와 상태를 추적합니다.</li>
                  <li><strong>드라이버 관리:</strong> 배송 기사의 정보와 배송 이력을 관리합니다.</li>
                  <li><strong>AS/고장 접수:</strong> 가맹점과 고객의 AS 요청을 접수하고 처리합니다.</li>
                </ul>
              </div>

              <div class="guide-section mt-4">
                <h6 class="text-secondary mb-3">시스템 관리</h6>
                <ul class="guide-list">
                  <li><strong>사용자 관리:</strong> 시스템 사용자와 권한을 관리합니다.</li>
                  <li><strong>공지사항:</strong> 가맹점에 중요 공지사항을 전달합니다.</li>
                  <li><strong>메신저:</strong> 가맹점 및 내부 직원과 실시간 소통합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="alert alert-light mt-4" role="alert">
            <strong>TIP:</strong> 각 메뉴는 좌측 사이드바에서 클릭하여 이동할 수 있으며, 실시간 데이터는 자동으로 업데이트됩니다.
          </div>
        </BaseCard>
      </div>
    </div>
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

.guide-header h5 {
  font-weight: 600;
  color: #212529;
}
</style>