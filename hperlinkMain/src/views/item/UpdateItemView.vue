<script setup lang="js">
import {onMounted, ref} from 'vue';
import {useToastStore} from "@/stores/toast.js";

import colorApi from '@/api/item/color'
import categoryApi from '@/api/item/category'
import sizeApi from '@/api/item/size'

const sizes = ref([]);
const categories = ref([]);
const colors = ref([]);

const toastStore = useToastStore();

const props = defineProps(['itemForm']);
const emit = defineEmits(['submit']);
const itemForm = props.itemForm;
// 이미지 미리보기 저장
const imagePreviews = ref([]);

const getColors = async () => {
  let res = await colorApi.getColors();
  if(res.status !== 200) {
    toastStore.showToast("색깔을 불러오지 못했습니다.", "danger")
  }
  colors.value = res.data.data.colors;
}

const getCategories = async () => {
  let res = await categoryApi.getCategories();
  if(res.status !== 200) {
    toastStore.showToast("카테고리를 불러오지 못했습니다.", "danger")
  }
  categories.value = res.data.data.categories;
}

const getSizes = async () => {
  let res = await sizeApi.getSizes();
  if(res.status !== 200) {
    toastStore.showToast("색깔을 불러오지 못했습니다.", "danger")
  }
  sizes.value = res.data.data.sizes;
}


const isLightColor = (hex) => {
  if (!hex) return false;
  let r, g, b;

  if (hex.startsWith('#')) {
    const c = hex.substring(1);
    if (c.length === 3) {
      r = parseInt(c[0] + c[0], 16);
      g = parseInt(c[1] + c[1], 16);
      b = parseInt(c[2] + c[2], 16);
    } else if (c.length === 6) {
      r = parseInt(c.substring(0, 2), 16);
      g = parseInt(c.substring(2, 4), 16);
      b = parseInt(c.substring(4, 6), 16);
    }
  } else if (hex.startsWith('rgb')) {
    [r, g, b] = hex.match(/\d+/g).map(Number);
  } else return false;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
}


onMounted(async () => {
  await getColors();
  await getSizes();
  await getCategories();
})
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
        <option disabled value="">카테고리를 선택하세요</option>
        <option v-for="cat in categories" :key="cat.category" :value="cat.category">
          {{ cat.category }}
        </option>
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

    <!-- 상품 상세(색상/사이즈/재고) 추가 -->
    <div class="mb-3">
      <label class="form-label">상품 상세 리스트</label>
      <div v-for="(detail, idx) in itemForm.itemDetailList" :key="detail.id || idx" class="border p-2 mb-2 rounded">
        <div class="row">
          <div class="col">
            <select
                class="form-select size-input"
                v-model="detail.size"
                :disabled="!!detail.id"
            >
              <option disabled value="">사이즈 선택</option>
              <option
                  v-for="s in sizes"
                  :key="s.id"
                  :value="s.size"
              >
                {{ s.size }}
              </option>
            </select>
          </div>
        <div class="col">
          <select
              class="form-select color-input"
              v-model="detail.color"
              :disabled="!!detail.id"
          >
            <option disabled value="">색상 선택</option>
            <option
                v-for="c in colors"
                :key="c.id"
                :value="c.colorName"
                :style="{
              backgroundColor: c.colorCode,
              color: isLightColor(c.colorCode) ? '#000' : '#fff'
            }"
            >
              {{ c.colorName }}
            </option>
          </select>
        </div>
          <div class="col">
            <input
                type="number"
                class="form-control"
                placeholder="재고"
                v-model.number="detail.stock"
                :disabled="!!detail.id"
            />
          </div>
          <div class="col">
            <input
                type="text"
                class="form-control"
                placeholder="상세코드"
                v-model="detail.itemDetailCode"
                :disabled="!!detail.id"
            />
          </div>
          <div class="col-1 text-center">
            <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                @click="itemForm.itemDetailList.splice(idx, 1)"
                :disabled="!!detail.id">
            x
            </button>
          </div>
        </div>
      </div>

      <button
          type="button"
          class="btn btn-sm btn-outline-primary mt-2"
          @click="itemForm.itemDetailList.push({ size: '', color: '', stock: 0, itemDetailCode: '' })"
      >
        + 상세 추가
      </button>
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