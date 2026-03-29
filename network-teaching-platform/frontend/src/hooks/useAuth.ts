/**
 * 认证 Hook
 * 处理用户登录、注册和认证逻辑
 */
import { useState } from 'react'
import { useUserStore } from '../stores/userStore'
import { authAPI, UserCreate, UserLogin } from '../services/api'

export function useAuth() {
  const { setUser, setToken, setLoading, setError, logout } = useUserStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 登录
  const login = async (credentials: UserLogin) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authAPI.login(credentials)
      setToken(response.access_token)

      // 获取用户信息
      const user = await authAPI.getCurrentUser()
      setUser(user)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.detail || '登录失败，请检查用户名和密码'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const register = async (data: UserCreate) => {
    setLoading(true)
    setError(null)

    try {
      await authAPI.register(data)

      // 注册成功后自动登录
      const loginResult = await login({
        username: data.username,
        password: data.password,
      })

      return loginResult
    } catch (error: any) {
      const message = error.response?.data?.detail || '注册失败'
      setError(message)
      setLoading(false)
      return { success: false, error: message }
    }
  }

  // 登出
  const logoutUser = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      logout()
      setIsAuthenticated(false)
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const user = await authAPI.getCurrentUser()
        setUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Token 验证失败:', error)
        logout()
      }
    }
  }

  return {
    isAuthenticated,
    login,
    register,
    logout: logoutUser,
    initAuth,
  }
}
