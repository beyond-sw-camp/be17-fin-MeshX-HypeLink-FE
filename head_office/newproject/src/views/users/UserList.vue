<template>
  <BaseCard>
    <template #header><h5>사용자 관리</h5></template>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>이름</th>
          <th>이메일</th>
          <th>가입일</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>홍길동</td>
          <td>hong@example.com</td>
          <td>2024-01-01</td>
        </tr>
        <tr>
          <td>2</td>
          <td>김영희</td>
          <td>kim@example.com</td>
          <td>2024-01-02</td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>
<script setup>
import BaseCard from '@/components/BaseCard.vue';
</script>
