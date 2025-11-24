<script setup>
const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>POS 이용 방법</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="guide-section">
          <h3>📝 상품 편집하기</h3>
          <div class="guide-content">
            <ol>
              <li>오른쪽 상단의 <strong>"편집"</strong> 버튼을 클릭합니다.</li>
              <li><strong>상품 삭제:</strong> 상품 카드 우측 상단의 ✕ 버튼을 클릭하여 삭제합니다.</li>
              <li><strong>상품 추가:</strong> 빈 슬롯(+표시)을 클릭하여 원하는 상품을 선택합니다.</li>
              <li>편집이 완료되면 <strong>"완료"</strong> 버튼을 클릭합니다.</li>
            </ol>
          </div>
        </div>

        <div class="guide-section">
          <h3>💳 결제하기</h3>
          <div class="guide-content">
            <ol>
              <li>판매할 상품을 클릭하여 주문 목록에 추가합니다.</li>
              <li>수량을 조정하려면 주문 목록에서 + / - 버튼을 사용합니다.</li>
              <li><strong>"결제하기"</strong> 버튼을 클릭합니다.</li>
              <li><strong>QR 결제:</strong> 카메라로 QR 코드를 스캔하면 자동으로 결제됩니다.</li>
            </ol>
          </div>
        </div>

        <div class="guide-section">
          <h3>👤 멤버십 조회</h3>
          <div class="guide-content">
            <ol>
              <li>우측 상단의 전화번호 입력란을 클릭합니다.</li>
              <li>회원 전화번호를 입력하여 조회합니다.</li>
              <li>회원 정보가 확인되면 쿠폰 사용이 가능합니다.</li>
            </ol>
          </div>
        </div>

        <div class="guide-section">
          <h3>🔍 상품 검색</h3>
          <div class="guide-content">
            <ol>
              <li>상단 검색창에 상품명을 입력하여 검색합니다.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--bg-gray);
  border-radius: 50%;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--error-color);
  color: white;
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.guide-section {
  margin-bottom: 28px;
}

.guide-section:last-child {
  margin-bottom: 0;
}

.guide-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-content {
  background: var(--bg-gray);
  padding: 16px 20px;
  border-radius: 12px;
}

.guide-content ol {
  margin: 0;
  padding-left: 20px;
}

.guide-content li {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.guide-content li:last-child {
  margin-bottom: 0;
}

.guide-content strong {
  color: var(--primary-color);
  font-weight: 600;
}

.guide-content ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.guide-content ul li {
  font-size: 14px;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .guide-section h3 {
    font-size: 16px;
  }

  .guide-content li {
    font-size: 14px;
  }
}
</style>
