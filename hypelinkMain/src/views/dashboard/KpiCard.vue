<script setup>
import BaseCard from '@/components/BaseCard.vue';
defineProps({ title: String, value: String, color: String });
</script>

<template>
  <BaseCard>
    <div class="d-flex align-items-center">
      <div :class="`bg-${color}-subtle`" class="p-3 rounded-circle">
        <slot></slot> <!-- SVG 아이콘이 들어갈 자리 -->
      </div>
      <div class="ms-3">
        <p class="text-muted mb-0">{{ title }}</p>
        <h4 class="mb-0">{{ value }}</h4>
      </div>
    </div>
  </BaseCard>
</template>