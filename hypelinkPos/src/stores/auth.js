import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)

  // 임시 지점 데이터 (나중에 API로 교체)
  const branches = [
    { username: 'gangnam', password: '1234', name: '강남점' },
    { username: 'hongdae', password: '1234', name: '홍대점' },
    { username: 'sinchon', password: '1234', name: '신촌점' },
    { username: 'admin', password: 'admin', name: '본사 관리자' }
  ]

  const login = (username, password) => {
    const branch = branches.find(
      b => b.username === username && b.password === password
    )

    if (branch) {
      isAuthenticated.value = true
      currentUser.value = {
        username: branch.username,
        name: branch.name
      }
      // 로컬스토리지에 저장
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      return true
    }

    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    currentUser.value = null
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    const user = localStorage.getItem('user')
    if (user) {
      currentUser.value = JSON.parse(user)
      isAuthenticated.value = true
      return true
    }
    return false
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    checkAuth
  }
})
