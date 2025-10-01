<script setup>
import { useSlots, computed } from 'vue';

const slots = useSlots();

const hasHeaderSlot = computed(() => !!slots.header);
const hasFooterSlot = computed(() => !!slots.footer);
</script>

<template>
  <div class="card">
    <div v-if="hasHeaderSlot" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot> <!-- 기본 컨텐츠 -->
    </div>
    <div v-if="hasFooterSlot" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}
</style>