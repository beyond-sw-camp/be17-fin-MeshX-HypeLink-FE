<template>
  <transition name="fade">
    <div v-if="drillDown.title">
      <BaseCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ drillDown.title }}</h5>
            <button class="btn btn-sm btn-light" @click="emit('close')">닫기</button>
          </div>
        </template>
        <ul class="list-group list-group-flush">
          <li v-for="item in drillDown.items" :key="item.name" class="list-group-item d-flex justify-content-between">
            <span>{{ item.name }}</span>
            <strong>{{ item.sales.toLocaleString() }}개</strong>
          </li>
        </ul>
      </BaseCard>
    </div>
  </transition>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue';

defineProps({ drillDown: Object });
const emit = defineEmits(['close']);
</script>
