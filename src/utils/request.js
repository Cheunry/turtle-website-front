import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import {getToken,removeToken,removeNickName, setToken} from '@/utils/auth'
import { reportError } from '@/utils/errorReport'



axios.defaults.baseURL = process.env.VUE_APP_BASE_API_URL
axios.defaults.timeout = 60000 // 将默认超时时间调整为 60 秒
axios.defaults.withCredentials = true
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.post['Content-Type'] = 'application/json'

axios.interceptors.request.use(config => {
  config.headers['Authorization'] = getToken()
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
    ElMessage.error('服务端异常！')
    return Promise.reject(res)
  }
  if (res.data.code != "00000") {
    // 登录已过期 - 需要特殊处理
    if (res.data.code == 'A0230') {
      // 移除 token 
      removeToken();
      removeNickName();
      router.push({ path: '/login' })
      return Promise.reject(res.data)
    }
    
    // 其他业务错误：由拦截器统一显示错误消息，业务代码不再重复显示
    if (res.data.message) {
      ElMessage.error(res.data.message)
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }

    return Promise.reject(res.data)
  }

  return res.data
}, error => {
  // 网络错误处理：区分超时、网络断开等场景
  let errorMessage = '网络异常，请稍后重试'
  if (error.code === 'ECONNABORTED' || error.message.indexOf('timeout') !== -1) {
    errorMessage = '请求超时，请检查网络后重试'
  } else if (!error.response) {
    errorMessage = '网络连接失败，请检查网络设置'
  } else {
    // 有响应但状态码不是 2xx
    const status = error.response.status
    if (status === 401) {
      errorMessage = '登录已过期，请重新登录'
      removeToken()
      removeNickName()
      router.push({ path: '/login' })
    } else if (status >= 500) {
      errorMessage = '服务器异常，请稍后重试'
    } else if (status === 404) {
      errorMessage = '请求的资源不存在'
    }
  }
  
  // 上报非用户操作导致的错误（网络错误、服务器错误等）
  // 用户操作错误（如输入验证）不需要上报
  if (error.response?.status >= 500 || !error.response || error.code === 'ECONNABORTED') {
    reportError(error, 'request.interceptor', {
      url: error.config?.url,
      method: error.config?.method
    });
  }
  
  // 将格式化的错误信息附加到error对象上，方便业务代码使用
  error.errorMessage = errorMessage
  return Promise.reject(error)
})

export default axios