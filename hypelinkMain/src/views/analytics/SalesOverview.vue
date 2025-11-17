<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getSalesOverview } from '@/api/analytics';

// Props
const props = defineProps({
  period: {
    type: String,
    default: 'weekly'
  }
});

// 실제 API 데이터
const salesData = ref({
  totalRevenue: {
    value: 0,
    change: 0,
    previous: 0
  },
  totalTransactions: {
    value: 0,
    change: 0,
    previous: 0
  },
  averageOrderValue: {
    value: 0,
    change: 0,
    previous: 0
  },
  totalDiscount: {
    value: 0,
    change: 0,
    previous: 0
  }
});

// API 호출
const fetchSalesData = async () => {
  try {
    const response = await getSalesOverview(props.period);
    if (response.data) {
      const apiData = response.data;
      salesData.value = {
        totalRevenue: {
          value: apiData.totalRevenue || 0,
          change: apiData.growthRate || 0,
          previous: 0
        },
        totalTransactions: {
          value: apiData.totalTransactions || 0,
          change: apiData.growthRate || 0,
          previous: 0
        },
        averageOrderValue: {
          value: apiData.avgOrderValue || 0,
          change: apiData.growthRate || 0,
          previous: 0
        },
        totalDiscount: {
          value: 0, // TODO: 할인 데이터 추가시 업데이트
          change: 0,
          previous: 0
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
  }
};

onMounted(() => {
  fetchSalesData();
});

watch(() => props.period, () => {
  fetchSalesData();
});

const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `₩${(value / 100000000).toFixed(1)}억`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

const formatNumber = (value) => {
  return value.toLocaleString();
};
</script>

<template>
  <div class="row mb-4">
    <div class="col-12">
      <h5 class="mb-3">💰 매출 현황</h5>
    </div>

    <!-- Total Revenue -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">💵</span>
            <span class="kpi-title">총 매출액</span>
          </div>
          <div class="kpi-value">{{ formatCurrency(salesData.totalRevenue.value) }}</div>
          <div class="kpi-change" :class="salesData.totalRevenue.change > 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ salesData.totalRevenue.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(salesData.totalRevenue.change) }}%</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Total Transactions -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">🧾</span>
            <span class="kpi-title">거래 건수</span>
          </div>
          <div class="kpi-value">{{ formatNumber(salesData.totalTransactions.value) }}건</div>
          <div class="kpi-change" :class="salesData.totalTransactions.change > 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ salesData.totalTransactions.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(salesData.totalTransactions.change) }}%</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Average Order Value -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">💳</span>
            <span class="kpi-title">평균 객단가</span>
          </div>
          <div class="kpi-value">{{ formatCurrency(salesData.averageOrderValue.value) }}</div>
          <div class="kpi-change" :class="salesData.averageOrderValue.change > 0 ? 'positive' : 'negative'">
            <span class="change-icon">{{ salesData.averageOrderValue.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(salesData.averageOrderValue.change) }}%</span>
            <span class="change-label">전 기간 대비</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Total Discount -->
    <div class="col-xl-3 col-lg-6 mb-3">
      <BaseCard class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-header">
            <span class="kpi-icon">🏷️</span>
            <span class="kpi-title">할인 금액</span>
          </div>
          <div class="kpi-value">{{ formatCurrency(salesData.totalDiscount.value) }}</div>
          <div class="kpi-change" :class="salesData.totalDiscount.change > 0 ? 'negative' : 'positive'">
            <span class="change-icon">{{ salesData.totalDiscount.change > 0 ? '↑' : '↓' }}</span>
            <span class="change-value">{{ Math.abs(salesData.totalDiscount.change) }}%</span>
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
