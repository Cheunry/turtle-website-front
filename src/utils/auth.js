
const TokenKey = 'Authorization'

const nickNameKey = 'nickName'

const uidKey = 'uid'


export const getToken = () => {
    return localStorage.getItem(TokenKey);
}

export const setToken = (token) => {
  return localStorage.setItem(TokenKey, token)
}

export const removeToken = () =>  {
  return localStorage.removeItem(TokenKey)
}

export const removeNickName = () =>  {
  return localStorage.removeItem(nickNameKey)
}

export const setNickName = (nickName) => {
  localStorage.setItem(nickNameKey, nickName);
  window.dispatchEvent(new Event('nickname-updated'));
}

export const getNickName = () => {
  return localStorage.getItem(nickNameKey);
}

export const setUid = (uid) => {
  return localStorage.setItem(uidKey, uid)
}

export const getUid = () => {
  return localStorage.getItem(uidKey);
}

export const removeUid = () =>  {
  return localStorage.removeItem(uidKey)
}

/**
 * 检查Token是否过期
 * @returns {boolean} true-已过期，false-未过期
 */
export const isTokenExpired = () => {
  const token = getToken()
  if (!token) {
    return true
  }
  
  try {
    // JWT格式: header.payload.signature
    // 解析payload部分
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // JWT exp是秒，转换为毫秒
    const now = Date.now()
    // 提前5分钟认为过期，给刷新留出时间
    return now >= (exp - 5 * 60 * 1000)
  } catch (e) {
    console.error('Token解析失败:', e)
    return true
  }
}

/**
 * 获取Token的过期时间
 * @returns {number|null} 过期时间（毫秒时间戳），解析失败返回null
 */
export const getTokenExpirationTime = () => {
  const token = getToken()
  if (!token) {
    return null
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch (e) {
    console.error('Token解析失败:', e)
    return null
  }
}

/**
 * 获取Token剩余有效时间（毫秒）
 * @returns {number|null} 剩余时间（毫秒），已过期或解析失败返回null
 */
export const getTokenRemainingTime = () => {
  const expTime = getTokenExpirationTime()
  if (!expTime) {
    return null
  }
  
  const remaining = expTime - Date.now()
  return remaining > 0 ? remaining : null
}
