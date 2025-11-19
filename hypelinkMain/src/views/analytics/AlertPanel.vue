<script setup>
import { ref } from 'vue';
import BaseCard from '@/components/BaseCard.vue';

// Mock data
const alerts = ref([
  {
    id: 1,
    type: 'danger',
    icon: '🚨',
    title: 'SLA 위반',
    message: '24시간 초과 미처리 주문 3건',
    count: 3,
    action: '주문 보기'
  },
  {
    id: 2,
    type: 'warning',
    icon: '📦',
    title: '재고 부족',
    message: '12개 상품이 재고 부족 상태입니다',
    count: 12,
    action: '재고 보기'
  },
  {
    id: 3,
    type: 'warning',
    icon: '⚠️',
    title: '미처리 주문',
    message: '처리 대기 중인 주문이 있습니다',
    count: 23,
    action: '처리하기'
  },
  {
    id: 4,
    type: 'info',
    icon: '🚚',
    title: '배송 지연',
    message: '5건의 배송이 지연되고 있습니다',
    count: 5,
    action: '확인하기'
  }
]);

const getAlertClass = (type) => {
  const classes = {
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
    success: 'alert-success'
  };
  return classes[type] || 'alert-secondary';
};

const handleAction = (alert) => {
  // TODO: Navigate to relevant page
};
</script>

<template>
  <div class="row mb-4">
    <div class="col-12">
      <BaseCard>
        <template #header>
          <h5 class="mb-0">⚠️ 긴급 알림</h5>
        </template>

        <div class="alerts-container">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-item"
            :class="getAlertClass(alert.type)"
          >
            <div class="alert-content">
              <div class="alert-left">
                <span class="alert-icon">{{ alert.icon }}</span>
                <div class="alert-text">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-message">{{ alert.message }}</div>
                </div>
              </div>
              <div class="alert-right">
                <span class="alert-count badge" :class="'bg-' + alert.type">
                  {{ alert.count }}
                </span>
                <button
                  class="btn btn-sm"
                  :class="'btn-' + alert.type"
                  @click="handleAction(alert)"
                >
                  {{ alert.action }} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid;
  transition: all 0.2s;
}

.alert-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.alert-danger {
  background-color: #f8d7da;
  border-left-color: #dc3545;
}

.alert-warning {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.alert-info {
  background-color: #d1ecf1;
  border-left-color: #0dcaf0;
}

.alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.alert-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.alert-icon {
  font-size: 2rem;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: #212529;
}

.alert-message {
  font-size: 0.9rem;
  color: #6c757d;
}

.alert-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-count {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  min-width: 3rem;
  text-align: center;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #000 !important;
}

.bg-info {
  background-color: #0dcaf0 !important;
}

.btn-sm {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .alert-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .alert-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
