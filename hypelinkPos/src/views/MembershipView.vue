<script setup>
import { ref, computed } from 'vue'
import { useMembershipStore } from '@/stores/membership'

const membershipStore = useMembershipStore()

const searchQuery = ref('')
const showEditModal = ref(false)
const editingMember = ref(null)
const editName = ref('')
const editPhone = ref('')
const editBirthdate = ref('')

const filteredMembers = computed(() => {
  if (!searchQuery.value) return membershipStore.members

  const query = searchQuery.value.toLowerCase()
  return membershipStore.members.filter(
    m =>
      m.name.toLowerCase().includes(query) ||
      m.phone.includes(query)
  )
})

const openEditModal = (member) => {
  editingMember.value = member
  editName.value = member.name
  editPhone.value = member.phone
  editBirthdate.value = member.birthdate
  showEditModal.value = true
}

const saveEdit = () => {
  if (!editName.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  const result = membershipStore.updateMember(editingMember.value.id, {
    name: editName.value,
    phone: editPhone.value,
    birthdate: editBirthdate.value
  })

  if (result.success) {
    alert('수정되었습니다.')
    showEditModal.value = false
    editingMember.value = null
  }
}

const deleteMember = (member) => {
  if (confirm(`${member.name}님의 멤버십을 삭제하시겠습니까?`)) {
    const result = membershipStore.deleteMember(member.id)
    if (result.success) {
      alert('삭제되었습니다.')
    }
  }
}

const formatPhone = (phone) => {
  if (phone.length === 11) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return dateString.replace(/-/g, '.')
}
</script>

<template>
  <div class="membership-view">
    <div class="header">
      <h1>멤버십 관리</h1>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">전체 회원</div>
          <div class="stat-value">{{ membershipStore.totalMembers }}명</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">활동 회원 (30일)</div>
          <div class="stat-value">{{ membershipStore.activeMembers }}명</div>
        </div>
      </div>
    </div>

    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="이름 또는 전화번호로 검색"
        class="search-input"
      />
    </div>

    <div class="members-container">
      <div class="members-table">
        <div class="table-header">
          <div class="col col-name">이름</div>
          <div class="col col-phone">전화번호</div>
          <div class="col col-birthdate">생년월일</div>
          <div class="col col-points">포인트</div>
          <div class="col col-spent">누적 금액</div>
          <div class="col col-visit">방문 횟수</div>
          <div class="col col-date">가입일</div>
          <div class="col col-actions">관리</div>
        </div>

        <div class="table-body">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="table-row"
          >
            <div class="col col-name">
              <span class="member-name">{{ member.name }}</span>
            </div>
            <div class="col col-phone">
              <span class="phone-value">{{ formatPhone(member.phone) }}</span>
            </div>
            <div class="col col-birthdate">
              <span class="birthdate-value">{{ formatDate(member.birthdate) }}</span>
            </div>
            <div class="col col-points">
              <span class="points-value">{{ member.points.toLocaleString() }}P</span>
            </div>
            <div class="col col-spent">
              <span class="spent-value">{{ member.totalSpent.toLocaleString() }}원</span>
            </div>
            <div class="col col-visit">
              <span class="visit-value">{{ member.visitCount }}회</span>
            </div>
            <div class="col col-date">
              <span class="date-value">{{ formatDate(member.joinedAt) }}</span>
            </div>
            <div class="col col-actions">
              <button class="action-btn edit" @click="openEditModal(member)">
                수정
              </button>
              <button class="action-btn delete" @click="deleteMember(member)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>회원 정보 수정</h2>
          <button class="close-btn" @click="showEditModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>이름</label>
            <input
              v-model="editName"
              type="text"
              placeholder="이름 입력"
            />
          </div>

          <div class="form-group">
            <label>전화번호</label>
            <input
              v-model="editPhone"
              type="tel"
              placeholder="전화번호 입력"
              maxlength="11"
            />
          </div>

          <div class="form-group">
            <label>생년월일</label>
            <input
              v-model="editBirthdate"
              type="date"
            />
          </div>

          <div class="form-group">
            <label>포인트</label>
            <input
              :value="editingMember?.points.toLocaleString() + 'P'"
              type="text"
              disabled
            />
          </div>

          <div class="form-group">
            <label>누적 금액</label>
            <input
              :value="editingMember?.totalSpent.toLocaleString() + '원'"
              type="text"
              disabled
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showEditModal = false">
            취소
          </button>
          <button class="confirm-btn" @click="saveEdit">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.membership-view {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
}

.search-section {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.members-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.members-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 0.8fr 1fr 0.8fr 1fr 1.2fr;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
}

.table-header {
  background: var(--bg-gray);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.table-row {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.table-row:hover {
  background: var(--bg-gray);
}

.table-row:last-child {
  border-bottom: none;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.phone-value,
.birthdate-value {
  font-size: 14px;
  color: var(--text-secondary);
}

.points-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-color);
}

.spent-value,
.visit-value,
.date-value {
  font-size: 14px;
  color: var(--text-primary);
}

.col-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #E8F5E9;
  color: var(--success-color);
}

.action-btn.edit:hover {
  background: var(--success-color);
  color: white;
}

.action-btn.delete {
  background: #FFEBEE;
  color: var(--error-color);
}

.action-btn.delete:hover {
  background: var(--error-color);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus:not(:disabled) {
  border-color: var(--primary-color);
}

.form-group input:disabled {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover {
  background: #0052CC;
}
</style>
