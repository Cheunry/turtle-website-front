/**
 * SSE 通知初始化和管理
 * 在 App.vue 中调用，用于全局管理 SSE 连接
 */

import sseManager from './sse'
import { getToken } from './auth'
import { ElNotification } from 'element-plus'
import router from '@/router'

/**
 * 初始化 SSE 连接
 * 应该在用户登录后调用
 */
export function initSseNotification() {
  const token = getToken()
  if (!token) {
    console.log('用户未登录，跳过 SSE 连接初始化')
    return
  }

  // 建立用户 SSE 连接
  sseManager.connectUser(
    (eventType, data) => {
      handleNotification(eventType, data)
    },
    (error) => {
      console.error('用户 SSE 连接错误:', error)
    }
  )

  // 建立作者 SSE 连接（如果用户是作者）
  // 注意：这里会尝试建立连接，如果用户不是作者，后端会返回错误，连接会自动断开
  sseManager.connectAuthor(
    (eventType, data) => {
      handleNotification(eventType, data)
    },
    (error) => {
      // 如果用户不是作者，这个错误是预期的，可以忽略
      console.log('作者 SSE 连接失败（可能是用户不是作者）:', error)
    }
  )
}

/**
 * 处理通知消息
 * @param {String} eventType 事件类型
 * @param {Object} data 消息数据
 */
function handleNotification(eventType, data) {
  console.log('收到 SSE 通知:', eventType, data)

  switch (eventType) {
    case 'audit_pass':
      // 审核通过通知
      handleAuditPassNotification(data)
      break
    case 'audit_reject':
      // 审核不通过通知
      handleAuditRejectNotification(data)
      break
    case 'message':
      // 通用消息通知
      handleMessageNotification(data)
      break
    default:
      console.log('未处理的事件类型:', eventType)
  }
}

/**
 * 处理审核通过通知
 * @param {Object} data 消息数据 {title, content, link, busId, busType, timestamp}
 */
function handleAuditPassNotification(data) {
  ElNotification({
    title: data.title || '审核通知',
    message: data.content || '您的作品已通过审核',
    type: 'success',
    duration: 5000,
    onClick: () => {
      // 点击通知后跳转到对应页面
      if (data.link) {
        router.push(data.link)
      }
    }
  })

  // 触发消息更新事件（如果需要刷新消息列表）
  window.dispatchEvent(new CustomEvent('sse-message-received', { detail: data }))
}

/**
 * 处理审核不通过通知
 * @param {Object} data 消息数据
 */
function handleAuditRejectNotification(data) {
  ElNotification({
    title: data.title || '审核通知',
    message: data.content || '您的作品审核未通过',
    type: 'warning',
    duration: 5000,
    onClick: () => {
      if (data.link) {
        router.push(data.link)
      }
    }
  })

  window.dispatchEvent(new CustomEvent('sse-message-received', { detail: data }))
}

/**
 * 处理通用消息通知
 * @param {Object} data 消息数据
 */
function handleMessageNotification(data) {
  // 检查消息是否有效：必须有title或content，且不能都是空字符串
  const hasTitle = data.title && data.title.trim() !== ''
  const hasContent = data.content && data.content.trim() !== ''
  
  // 如果消息无效（没有title也没有content），不显示通知
  if (!hasTitle && !hasContent) {
    console.log('收到空消息，跳过显示:', data)
    // 仍然触发事件，让其他组件知道有消息（可能是系统消息）
    window.dispatchEvent(new CustomEvent('sse-message-received', { detail: data }))
    return
  }

  ElNotification({
    title: data.title || '消息通知',
    message: data.content || '',
    type: 'info',
    duration: 4000,
    onClick: () => {
      if (data.link) {
        router.push(data.link)
      }
    }
  })

  window.dispatchEvent(new CustomEvent('sse-message-received', { detail: data }))
}

/**
 * 断开所有 SSE 连接
 * 应该在用户登出时调用
 */
export function disconnectSseNotification() {
  sseManager.disconnectAll()
}

