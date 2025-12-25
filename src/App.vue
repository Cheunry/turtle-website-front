<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getToken } from '@/utils/auth'
import { initSseNotification, disconnectSseNotification } from '@/utils/sseNotification'

export default {
  name: 'App',
  setup() {
    const router = useRouter()

    onMounted(() => {
      // 如果用户已登录，初始化 SSE 连接
      if (getToken()) {
        initSseNotification()
      }

      // 监听登录事件（如果登录成功后需要建立连接）
      const handleLogin = () => {
        initSseNotification()
      }

      // 监听登出事件
      const handleLogout = () => {
        disconnectSseNotification()
      }

      // 监听路由变化，在需要认证的路由中检查连接
      router.afterEach((to, from) => {
        // 如果从登录页跳转过来，尝试建立连接
        if (from.name === 'login' && getToken()) {
          initSseNotification()
        }
      })

      // 注册全局事件监听
      window.addEventListener('user-login', handleLogin)
      window.addEventListener('user-logout', handleLogout)

      // 清理函数
      return () => {
        window.removeEventListener('user-login', handleLogin)
        window.removeEventListener('user-logout', handleLogout)
      }
    })

    onUnmounted(() => {
      // 组件卸载时断开连接
      disconnectSseNotification()
    })
  }
}
</script>
