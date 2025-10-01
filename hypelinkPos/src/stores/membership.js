import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMembershipStore = defineStore('membership', () => {
  const members = ref([
    {
      id: 1,
      name: '김철수',
      phone: '01012345678',
      birthdate: '1985-03-15',
      points: 5000,
      totalSpent: 150000,
      visitCount: 12,
      joinedAt: '2024-01-15',
      lastVisit: '2024-03-10'
    },
    {
      id: 2,
      name: '이영희',
      phone: '01098765432',
      birthdate: '1990-07-22',
      points: 3200,
      totalSpent: 89000,
      visitCount: 8,
      joinedAt: '2024-02-20',
      lastVisit: '2024-03-09'
    }
  ])

  const nextId = ref(3)

  // 전화번호로 멤버 찾기
  const findMemberByPhone = (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    return members.value.find(m => m.phone === cleanPhone)
  }

  // 멤버십 등록
  const registerMember = (name, phone, birthdate) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    // 이미 존재하는지 확인
    const existing = findMemberByPhone(cleanPhone)
    if (existing) {
      return { success: false, message: '이미 등록된 회원입니다.' }
    }

    const newMember = {
      id: nextId.value++,
      name,
      phone: cleanPhone,
      birthdate,
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastVisit: null
    }

    members.value.push(newMember)
    return { success: true, member: newMember }
  }

  // 포인트 적립 (결제 금액의 1%)
  const earnPoints = (memberId, amount) => {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      const earnedPoints = Math.floor(amount * 0.01)
      member.points += earnedPoints
      member.totalSpent += amount
      member.visitCount += 1
      member.lastVisit = new Date().toISOString().split('T')[0]
      return earnedPoints
    }
    return 0
  }

  // 포인트 사용
  const usePoints = (memberId, points) => {
    const member = members.value.find(m => m.id === memberId)
    if (member && member.points >= points) {
      member.points -= points
      return { success: true }
    }
    return { success: false, message: '포인트가 부족합니다.' }
  }

  // 멤버 정보 수정
  const updateMember = (memberId, updates) => {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      Object.assign(member, updates)
      return { success: true }
    }
    return { success: false }
  }

  // 멤버 삭제
  const deleteMember = (memberId) => {
    const index = members.value.findIndex(m => m.id === memberId)
    if (index !== -1) {
      members.value.splice(index, 1)
      return { success: true }
    }
    return { success: false }
  }

  const totalMembers = computed(() => members.value.length)
  const activeMembers = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return members.value.filter(m =>
      m.lastVisit && new Date(m.lastVisit) >= thirtyDaysAgo
    ).length
  })

  return {
    members,
    totalMembers,
    activeMembers,
    findMemberByPhone,
    registerMember,
    earnPoints,
    usePoints,
    updateMember,
    deleteMember
  }
})
