<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';

const props = defineProps({ drillDown: Object });
const emit = defineEmits(['close', 'page-change']);

// 표시할 페이지 버튼 계산 (최대 5개)
const visiblePages = computed(() => {
  const total = props.drillDown.totalPages;
  const current = props.drillDown.currentPage;
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
</script>

<template>
  <transition name="fade">
    <div v-if="drillDown.title">
      <BaseCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0">{{ drillDown.title }}</h5>
              <small class="text-muted">
                전체 {{ drillDown.totalElements }}개
                <span v-if="drillDown.totalPages > 0" class="ms-2">
                  ({{ drillDown.currentPage }}/{{ drillDown.totalPages }} 페이지)
                </span>
              </small>
            </div>
            <button class="btn btn-sm btn-light" @click="emit('close')">닫기</button>
          </div>
        </template>
        <ul class="list-group list-group-flush">
          <li v-for="(item, index) in drillDown.items" :key="index" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ item.itemName || item.name }}</strong>
                <span v-if="item.category" class="text-muted ms-2">({{ item.category }})</span>
              </div>
              <div class="text-end">
                <div><strong>{{ (item.salesCount || item.sales || 0).toLocaleString() }}개</strong></div>
                <div class="text-muted small">{{ (item.salesAmount || 0).toLocaleString() }}원</div>
              </div>
            </div>
          </li>
        </ul>

        <nav v-if="drillDown.totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: drillDown.currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="emit('page-change', drillDown.currentPage - 1)">이전</a>
            </li>
            <li class="page-item" v-if="visiblePages[0] > 1">
              <a class="page-link" href="#" @click.prevent="emit('page-change', 1)">1</a>
            </li>
            <li class="page-item disabled" v-if="visiblePages[0] > 2">
              <span class="page-link">...</span>
            </li>
            <li class="page-item" :class="{ active: page === drillDown.currentPage }" v-for="page in visiblePages" :key="page">
              <a class="page-link" href="#" @click.prevent="emit('page-change', page)">{{ page }}</a>
            </li>
            <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < drillDown.totalPages - 1">
              <span class="page-link">...</span>
            </li>
            <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < drillDown.totalPages">
              <a class="page-link" href="#" @click.prevent="emit('page-change', drillDown.totalPages)">{{ drillDown.totalPages }}</a>
            </li>
            <li class="page-item" :class="{ disabled: drillDown.currentPage === drillDown.totalPages }">
              <a class="page-link" href="#" @click.prevent="emit('page-change', drillDown.currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </BaseCard>
    </div>
  </transition>
</template>