import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { login, getProfile } from '@/api/user'

const TOKEN_KEY = 'family_asset_token'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(Cookies.get(TOKEN_KEY) || '')
  const userInfo = ref(null)
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    Cookies.set(TOKEN_KEY, newToken, { expires: 7 })
  }

  const clearToken = () => {
    token.value = ''
    userInfo.value = null
    Cookies.remove(TOKEN_KEY)
  }

  const loginAction = async (credentials) => {
    loading.value = true
    try {
      const res = await login(credentials)
      if (res.code === 200) {
        setToken(res.data.token)
        userInfo.value = res.data.user
        return { success: true }
      }
      return { success: false, msg: res.msg }
    } catch (error) {
      return { success: false, msg: error.response?.data?.msg || '登录失败' }
    } finally {
      loading.value = false
    }
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const res = await getProfile()
      if (res.code === 200) {
        userInfo.value = res.data
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  const checkLogin = async () => {
    if (token.value && !userInfo.value) {
      await fetchUserInfo()
    }
  }

  const logout = () => {
    clearToken()
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    loginAction,
    fetchUserInfo,
    checkLogin,
    logout
  }
})
