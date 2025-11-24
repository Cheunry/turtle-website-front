
export const goToAnchor = (id) => {
  var anchor = document.getElementById(id);
  // chrome
  document.body.scrollTop = anchor.offsetTop;
  // firefox
  document.documentElement.scrollTop = anchor.offsetTop;
  // safari
  window.pageYOffset = anchor.offsetTop;
}

export const getQueryObject = (url) => {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

export const getQueryString = (name) => {
  return getQueryObject(window.location.href)[name];
}

export const getLocal = (name) => {
  return localStorage.getItem(name)
}

export const setLocal = (name, value) => {
  localStorage.setItem(name, value)
}

export const addDay = (days) => {
  //创建date
  let nowDate = new Date();
  //添加天数
  nowDate.setDate(nowDate.getDate() + days);
  //返回
  return nowDate
}

export const addMonth= (months) => {
  //创建date
  let nowDate = new Date();
  //添加周数
  nowDate.setMonth(nowDate.getMonth() + months);
  //返回
  return nowDate
}

export const addYear= (years) => {
  //创建date
  let nowDate = new Date();
  //添加年数
  nowDate.setMonth(nowDate.getYear() + years);
  //返回
  return nowDate
}

export const dateFormat = (fmt, date) => {
  let ret;
  const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
  };
  return fmt;
}

/**
 * 获取图片完整URL
 * 如果图片路径已经是完整URL（以http://或https://开头），则直接返回
 * 否则拼接imgBaseUrl前缀
 * @param {string} imagePath - 图片路径（可能是相对路径或完整URL）
 * @param {string} imgBaseUrl - 图片服务器基础URL（环境变量VUE_APP_BASE_IMG_URL）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imagePath, imgBaseUrl) => {
  if (!imagePath) {
    return '';
  }
  // 如果已经是完整URL（以http://或https://开头），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // 否则拼接imgBaseUrl前缀
  return imgBaseUrl ? imgBaseUrl + imagePath : imagePath;
}

