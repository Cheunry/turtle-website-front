/**
 * SSE (Server-Sent Events) 工具类
 * 用于建立和维护与服务器的 SSE 连接，接收实时通知
 * 
 * 注意：使用 fetch API 而不是 EventSource，因为 EventSource 不支持自定义 headers
 */

/**
 * SSE 连接管理器
 */
class SseManager {
  constructor() {
    this.userController = null; // AbortController for user connection
    this.authorController = null; // AbortController for author connection
    this.reconnectTimer = null;
    this.reconnectDelay = 3000; // 重连延迟（毫秒）
    this.maxReconnectDelay = 60000; // 最大重连延迟（毫秒）
    this.currentDelay = this.reconnectDelay;
  }

  /**
   * 建立用户 SSE 连接（使用 fetch + ReadableStream）
   * @param {Function} onMessage 消息回调函数 (eventType, data)
   * @param {Function} onError 错误回调函数
   */
  connectUser(onMessage, onError) {
    // 如果已有连接，先关闭
    this.disconnectUser();

    const token = this.getToken();
    if (!token) {
      console.warn('用户未登录，无法建立 SSE 连接');
      return;
    }

    const baseUrl = process.env.VUE_APP_BASE_API_URL || '';
    const url = `${baseUrl}/front/user/sse/user/connect`;

    // 创建 AbortController 用于取消请求
    this.userController = new AbortController();

    // 使用 fetch API 建立 SSE 连接
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      signal: this.userController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`SSE连接失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('用户 SSE 流已结束');
            this.userController = null;
            // 流结束，尝试重连
            this.scheduleReconnect(() => this.connectUser(onMessage, onError));
            return;
          }

          // 解码数据
          buffer += decoder.decode(value, { stream: true });
          
          // 按行分割处理 SSE 消息
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.substring(5).trim();
            } else if (line === '') {
              // 空行表示一个事件结束
              if (eventData) {
                try {
                  const data = JSON.parse(eventData);
                  if (eventType === 'connected') {
                    console.log('用户 SSE 连接已建立');
                    this.currentDelay = this.reconnectDelay; // 重置重连延迟
                  } else if (eventType !== 'heartbeat') {
                    // 忽略心跳消息
                    onMessage && onMessage(eventType, data);
                  }
                } catch (e) {
                  console.error('解析 SSE 消息失败:', e, eventData);
                }
              }
              eventType = 'message';
              eventData = '';
            }
          }

          // 继续读取
          readStream();
        }).catch(error => {
          if (error.name === 'AbortError') {
            console.log('用户 SSE 连接已取消');
          } else {
            console.error('读取 SSE 流失败:', error);
            this.userController = null;
            onError && onError(error);
            this.scheduleReconnect(() => this.connectUser(onMessage, onError));
          }
        });
      };

      readStream();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        return; // 用户主动取消，不需要处理
      }
      console.error('建立用户 SSE 连接失败:', error);
      this.userController = null;
      onError && onError(error);
      this.scheduleReconnect(() => this.connectUser(onMessage, onError));
    });
  }

  /**
   * 建立作者 SSE 连接（使用 fetch + ReadableStream）
   * @param {Function} onMessage 消息回调函数 (eventType, data)
   * @param {Function} onError 错误回调函数
   */
  connectAuthor(onMessage, onError) {
    // 如果已有连接，先关闭
    this.disconnectAuthor();

    const token = this.getToken();
    if (!token) {
      console.warn('用户未登录，无法建立 SSE 连接');
      return;
    }

    const baseUrl = process.env.VUE_APP_BASE_API_URL || '';
    const url = `${baseUrl}/front/user/sse/author/connect`;

    // 创建 AbortController 用于取消请求
    this.authorController = new AbortController();

    // 使用 fetch API 建立 SSE 连接
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      signal: this.authorController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`SSE连接失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('作者 SSE 流已结束');
            this.authorController = null;
            // 流结束，尝试重连
            this.scheduleReconnect(() => this.connectAuthor(onMessage, onError));
            return;
          }

          // 解码数据
          buffer += decoder.decode(value, { stream: true });
          
          // 按行分割处理 SSE 消息
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.substring(5).trim();
            } else if (line === '') {
              // 空行表示一个事件结束
              if (eventData) {
                try {
                  const data = JSON.parse(eventData);
                  if (eventType === 'connected') {
                    console.log('作者 SSE 连接已建立');
                    this.currentDelay = this.reconnectDelay; // 重置重连延迟
                  } else if (eventType !== 'heartbeat') {
                    // 忽略心跳消息
                    onMessage && onMessage(eventType, data);
                  }
                } catch (e) {
                  console.error('解析 SSE 消息失败:', e, eventData);
                }
              }
              eventType = 'message';
              eventData = '';
            }
          }

          // 继续读取
          readStream();
        }).catch(error => {
          if (error.name === 'AbortError') {
            console.log('作者 SSE 连接已取消');
          } else {
            console.error('读取 SSE 流失败:', error);
            this.authorController = null;
            onError && onError(error);
            this.scheduleReconnect(() => this.connectAuthor(onMessage, onError));
          }
        });
      };

      readStream();
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        return; // 用户主动取消，不需要处理
      }
      console.error('建立作者 SSE 连接失败:', error);
      this.authorController = null;
      onError && onError(error);
      this.scheduleReconnect(() => this.connectAuthor(onMessage, onError));
    });
  }

  /**
   * 断开用户 SSE 连接
   */
  disconnectUser() {
    if (this.userController) {
      this.userController.abort();
      this.userController = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 断开作者 SSE 连接
   */
  disconnectAuthor() {
    if (this.authorController) {
      this.authorController.abort();
      this.authorController = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 断开所有连接
   */
  disconnectAll() {
    this.disconnectUser();
    this.disconnectAuthor();
  }

  /**
   * 调度重连
   * @param {Function} reconnectFn 重连函数
   */
  scheduleReconnect(reconnectFn) {
    if (this.reconnectTimer) {
      return; // 已有重连任务
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      reconnectFn();
      // 指数退避，但不超过最大值
      this.currentDelay = Math.min(this.currentDelay * 2, this.maxReconnectDelay);
    }, this.currentDelay);
  }

  /**
   * 获取认证 Token
   */
  getToken() {
    // 从 localStorage 或 cookie 中获取 token
    // 根据你的项目实际情况修改
    try {
      const { getToken } = require('@/utils/auth');
      return getToken();
    } catch (e) {
      return localStorage.getItem('token') || '';
    }
  }
}

// 创建单例
const sseManager = new SseManager();

export default sseManager;

