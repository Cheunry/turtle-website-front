/**
 * POST JSON 并消费 text/event-stream（SSE），用于 AI 润色等流式接口。
 * 与 axios 拦截器无关，需自行带 Token；错误事件会抛出带 code/message 的 Error。
 */
import { getToken, isTokenExpired, removeToken, removeNickName, removeUid } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

/**
 * @param {string} urlPath 如 /author/ai/polish/stream（含前缀，与 axios baseURL 拼接方式一致）
 * @param {object} jsonBody
 * @param {(eventName: string, rawData: string) => void} onEvent 每个完整 SSE 事件回调；rawData 为 data 行合并后的原文（delta 为纯文本）
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<void>} 流正常读完后 resolve；若未收到 done 事件会 reject
 */
export async function postJsonSse(urlPath, jsonBody, onEvent, options = {}) {
  const { signal } = options
  const token = getToken()
  if (!token || isTokenExpired()) {
    removeToken()
    removeNickName()
    removeUid()
    window.dispatchEvent(new Event('user-logout'))
    ElMessage.warning('登录已过期，请重新登录')
    router.push({ path: '/login' })
    throw new Error('未登录')
  }

  const base = (process.env.VUE_APP_BASE_API_URL || '').replace(/\/$/, '')
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  const url = `${base}${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      Accept: 'text/event-stream',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(jsonBody),
    credentials: 'include',
    signal
  })

  if (!res.ok) {
    if (res.status === 401) {
      removeToken()
      removeNickName()
      removeUid()
      window.dispatchEvent(new Event('user-logout'))
      ElMessage.warning('登录已过期，请重新登录')
      router.push({ path: '/login' })
    }
    let msg = `请求失败 (${res.status})`
    try {
      const text = await res.text()
      const j = JSON.parse(text)
      if (j.message) msg = j.message
    } catch (_) {
      /* ignore */
    }
    throw new Error(msg)
  }

  const reader = res.body && res.body.getReader()
  if (!reader) {
    throw new Error('响应不支持流式读取')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = 'message'
  const dataLines = []
  let sawDone = false

  const flush = () => {
    if (dataLines.length === 0) {
      return
    }
    const raw = dataLines.join('\n')
    dataLines.length = 0
    const ev = currentEvent
    currentEvent = 'message'
    if (ev === 'error') {
      let o = { code: '', message: raw }
      try {
        o = JSON.parse(raw)
      } catch (_) {
        o = { code: '', message: raw }
      }
      const err = new Error(o.message || '操作失败')
      err.code = o.code
      throw err
    }
    if (ev === 'done') {
      sawDone = true
    }
    onEvent(ev, raw)
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        flush()
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const rawLine of lines) {
        const line = rawLine.replace(/\r$/, '')
        if (line.startsWith('event:')) {
          if (dataLines.length > 0) {
            flush()
          }
          currentEvent = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart())
        } else if (line === '') {
          flush()
        }
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch (_) {
      /* ignore */
    }
  }

  if (!sawDone) {
    throw new Error('连接已结束，未收到完成信号，请重试')
  }
}
