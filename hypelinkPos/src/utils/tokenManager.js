import { reissueToken } from '@/api/auth'

/**
 * 토큰 관리를 위한 유틸리티
 */
class TokenManager {
  constructor() {
    this.isRefreshing = false
    this.failedQueue = []
  }

  /**
   * 대기 중인 요청들을 처리합니다
   * @param {Error|null} error - 에러 객체 (실패 시)
   * @param {string|null} token - 새로운 토큰 (성공 시)
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    this.failedQueue = []
  }

  /**
   * 요청을 대기열에 추가합니다
   * @returns {Promise<string>} 새로운 토큰을 반환하는 Promise
   */
  addToQueue() {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject })
    })
  }

  /**
   * 토큰 재발급을 시도합니다
   * @returns {Promise<string>} 새로운 액세스 토큰
   */
  async refreshAccessToken() {
    if (this.isRefreshing) {
      // 이미 재발급 중이면 대기열에 추가
      return this.addToQueue()
    }

    this.isRefreshing = true

    try {
      const response = await reissueToken()

      if (!response.success) {
        throw new Error(response.message || '토큰 재발급 실패')
      }

      const newAccessToken = response.accessToken

      // 대기열에 있던 모든 요청들에게 새 토큰 전달
      this.processQueue(null, newAccessToken)

      return newAccessToken
    } catch (error) {
      // 재발급 실패 시 모든 대기 요청 실패 처리
      this.processQueue(error, null)
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 토큰 재발급 실패 시 호출됩니다
   */
  async handleRefreshFailure() {
    // 스토어를 동적으로 import (순환 참조 방지)
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.logout()
  }
}

// 싱글톤 인스턴스
export const tokenManager = new TokenManager()
