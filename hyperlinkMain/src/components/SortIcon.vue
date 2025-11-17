<script setup>
defineProps(['sortKey', 'sortOrder', 'currentKey']);
</script>

<template>
  <span v-if="sortKey === currentKey">
    <svg v-if="sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16"><path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592c.859 0 1.319-1.012.753-1.659L8.753 4.86a1 1 0 0 0-1.506 0z"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659L8.753 11.14a1 1 0 0 1-1.506 0z"/></svg>
  </span>
</template>