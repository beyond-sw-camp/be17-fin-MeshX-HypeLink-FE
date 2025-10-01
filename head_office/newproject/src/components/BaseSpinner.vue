<script setup>
defineProps({ height: { type: String, default: '100px' } });
</script>

<template>
  <div class="d-flex justify-content-center align-items-center" :style="{ minHeight: height }">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>