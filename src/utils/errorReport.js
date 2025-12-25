/**
 * 错误上报工具
 * 用于上报非用户操作导致的错误（如网络错误、服务器错误等）
 * 用户操作导致的错误（如输入验证）不需要上报
 */

/**
 * 上报错误到后端
 * @param {Error|Object} error - 错误对象
 * @param {string} context - 错误上下文（如：'BookEdit.saveBook'）
 * @param {Object} extraData - 额外数据
 */
export function reportError(error, context = '', extraData = {}) {
  try {
    // 只上报非用户操作导致的错误
    // 用户操作错误（如输入验证）不需要上报
    
    // 判断是否为需要上报的错误类型
    const shouldReport = 
      // 网络错误
      error.code === 'ECONNABORTED' || 
      error.message?.includes('timeout') ||
      !error.response ||
      // 服务器错误（5xx）
      (error.response && error.response.status >= 500) ||
      // 未知错误
      (!error.message && !error.errorMessage);
    
    if (!shouldReport) {
      // 用户操作错误或业务错误，不需要上报
      return;
    }
    
    // 构建错误信息
    const errorInfo = {
      context, // 错误上下文
      message: error.message || error.errorMessage || '未知错误',
      stack: error.stack,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...extraData
    };
    
    // 这里可以调用后端API上报错误
    // 暂时只记录到控制台，后续可以接入错误监控系统
    console.error('[错误上报]', errorInfo);
    
    // TODO: 调用后端错误上报接口
    // await axios.post('/api/error/report', errorInfo);
    
  } catch (e) {
    // 错误上报本身失败，避免无限循环
    console.error('错误上报失败:', e);
  }
}

