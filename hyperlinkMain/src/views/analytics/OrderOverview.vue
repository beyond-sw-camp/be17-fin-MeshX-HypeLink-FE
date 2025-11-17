<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getOrderOverview } from '@/api/analytics';

// Props
const props = defineProps({
  period: {
    type: String,
    default: 'weekly'
  }
});

// 실제 API 데이터
const orderData = ref({
  totalOrders: {
    value: 0,
    change: 0,
    previous: 0
  },
  pendingOrders: {
    value: 0,
    change: 0,
    previous: 0,
    isAlert: false
  },
  averageProcessingTime: {
    value: 0,
    change: 0,
    previous: 0,
    unit: '일'
  },
  completionRate: {
    value: 0,
    change: 0,
    previous: 0,
    unit: '%'
  }
});

// API 호출
const fetchOrderData = async () => {
  try {
    const response = await getOrderOverview(props.period);
    if (response.data) {
      const apiData = response.data;
      orderData.value = {
        totalOrders: {
          value: apiData.totalOrders || 0,
          change: 0,
          previous: 0
        },
        pendingOrders: {
          value: apiData.pendingOrders || 0,
          change: 0,
          previous: 0,
          isAlert: (apiData.pendingOrders || 0) > 10
        },
        averageProcessingTime: {
          value: 0, // TODO: 처리시간 계산 추가
          change: 0,
          previous: 0,
          unit: '일'
        },
        completionRate: {
          value: apiData.completionRate || 0,
          change: 0,
          previous: 0,
          unit: '%'
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch order data:', error);
  }
};

onMounted(() => {
  fetchOrderData();
});

watch(() => props.period, () => {
  fetchOrderData();
});

const formatNumber = (value) => {
  return value.toLocaleString();
};
</script>

<template>
  <div class="row mb-4">
    <div class="col-12">
      <h5 class="mb-3">📦 주문 현황</h5>
    </div>

    <!-- Total Orders -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">📋</span>
            <span class="kpi-title">총 주문 건수</span>
          </div>
          <div class="kpi-value">{{ formatNumber(orderData.totalOrders.value) }}건</div>
          <div class="kpi-change" :class="orderData.totalOrders.change > 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ orderData.totalOrders.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(orderData.totalOrders.change) }}%</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Pending Orders -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card" :class="{ 'alert-card': orderData.pendingOrders.isAlert }">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">⚠️</span>
            <span class="kpi-title">미처리 주문</span>
          </div>
          <div class="kpi-value alert-value">{{ formatNumber(orderData.pendingOrders.value) }}건</div>
          <div class="kpi-change" :class="orderData.pendingOrders.change > 0 ? 'negative' : 'positive'">
            <span class="change-icon">{{ orderData.pendingOrders.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(orderData.pendingOrders.change) }}%</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Average Processing Time -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">⏱️</span>
            <span class="kpi-title">평균 처리 시간</span>
          </div>
          <div class="kpi-value">{{ orderData.averageProcessingTime.value }}{{ orderData.averageProcessingTime.unit }}</div>
          <div class="kpi-change" :class="orderData.averageProcessingTime.change < 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ orderData.averageProcessingTime.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(orderData.averageProcessingTime.change) }}{{ orderData.averageProcessingTime.unit }}</span>
            <span class="change-label">{{ orderData.averageProcessingTime.change < 0 ? '개선' : '악화' }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Completion Rate -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">✅</span>
            <span class="kpi-title">주문 완료율</span>
          </div>
          <div class="kpi-value">{{ orderData.completionRate.value }}{{ orderData.completionRate.unit }}</div>
          <div class="kpi-change" :class="orderData.completionRate.change > 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ orderData.completionRate.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(orderData.completionRate.change) }}%p</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert-card {
  border-left: 4px solid #ffc107;
}

.kpi-content {
  padding: 1rem;
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.kpi-icon {
  font-size: 1.5rem;
}

.kpi-title {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #212529;
  margin-bottom: 0.5rem;
}

.alert-value {
  color: #ffc107;
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
}

.kpi-change.positive {
  color: #198754;
}

.kpi-change.negative {
  color: #dc3545;
}

.change-icon {
  font-size: 1rem;
  font-weight: bold;
}

.change-value {
  font-weight: 600;
}

.change-label {
  color: #6c757d;
  font-size: 0.8rem;
}
</style>
