<script setup lang="js">
import {ref} from 'vue';

const props = defineProps(['itemForm']);
const emit = defineEmits(['submit']);
const itemForm = props.itemForm;
// 이미지 미리보기 저장
const imagePreviews = ref([]);
</script>

<template>
  <form @submit.prevent="emit('submit')">
    <div class="mb-3">
      <label class="form-label">한글명 *</label>
      <input type="text" class="form-control" v-model="itemForm.koName" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">영문명</label>
      <input type="text" class="form-control" v-model="itemForm.enName"/>
    </div>

    <div class="mb-3">
      <label class="form-label">가격 *</label>
      <input type="number" class="form-control" v-model.number="itemForm.amount" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">원가 *</label>
      <input type="number" class="form-control" v-model.number="itemForm.unitPrice" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">카테고리</label>
      <select class="form-select" v-model="itemForm.category">
        <option>상의</option>
        <option>하의</option>
        <option>아우터</option>
        <option>신발</option>
        <option>악세서리</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">회사명</label>
      <input type="text" class="form-control" v-model="itemForm.company"/>
    </div>

    <div class="mb-3">
      <label class="form-label">상품 설명</label>
      <textarea class="form-control" rows="3" v-model="itemForm.content"></textarea>
    </div>

    <!-- ✅ 이미지 업로드 -->
    <div class="mb-3">
      <label class="form-label">상품 이미지</label>
      <input type="file" class="form-control" accept="image/*" multiple @change="handleFileSelect"/>
    </div>

    <!-- ✅ 이미지 미리보기 -->
    <div v-if="imagePreviews.length" class="d-flex flex-wrap gap-2 mb-3">
      <div v-for="img in imagePreviews" :key="img.name" class="border p-2 text-center" style="width: 100px;">
        <img :src="img.url" alt="preview" class="img-fluid rounded"/>
        <small class="d-block mt-1 text-truncate">{{ img.name }}</small>
      </div>
    </div>
  </form>
</template>

<style scoped>

</style>