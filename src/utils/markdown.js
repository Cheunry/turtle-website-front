import MarkdownIt from 'markdown-it';

// 创建 markdown-it 实例
// 配置选项：
// - html: true 允许 HTML 标签
// - breaks: true 将单个换行符转换为 <br>
// - linkify: true 自动将 URL 转换为链接
const md = new MarkdownIt({
  html: true,        // 允许 HTML 标签
  breaks: true,      // 将单个换行符转换为 <br>（支持 \n\n 等格式）
  linkify: true,     // 自动将 URL 转换为链接
});

/**
 * 将转义字符转换为真正的字符
 * 例如：将字符串 "\n" 转换为真正的换行符
 * @param {string} text - 包含转义字符的文本
 * @returns {string} 转换后的文本
 */
const unescapeString = (text) => {
  if (!text) {
    return '';
  }
  // 将字符串中的转义字符转换为真正的字符
  // \n -> 换行符
  // \t -> 制表符
  // \r -> 回车符
  // \\ -> 反斜杠
  return text
    .replace(/\\n/g, '\n')      // 将 \n 字符串转换为换行符
    .replace(/\\r/g, '\r')      // 将 \r 字符串转换为回车符
    .replace(/\\t/g, '\t')      // 将 \t 字符串转换为制表符
    .replace(/\\\\/g, '\\');    // 将 \\ 转换为单个反斜杠（需要最后处理）
};

/**
 * 将 Markdown 文本渲染为 HTML
 * @param {string} markdown - Markdown 格式的文本
 * @returns {string} 渲染后的 HTML 字符串
 */
export const renderMarkdown = (markdown) => {
  if (!markdown) {
    return '';
  }
  // 先将转义字符转换为真正的字符，然后再进行 Markdown 渲染
  const unescapedText = unescapeString(markdown);
  return md.render(unescapedText);
};

/**
 * 将 Markdown 文本渲染为内联 HTML（不包含段落标签）
 * @param {string} markdown - Markdown 格式的文本
 * @returns {string} 渲染后的 HTML 字符串
 */
export const renderMarkdownInline = (markdown) => {
  if (!markdown) {
    return '';
  }
  // 先将转义字符转换为真正的字符，然后再进行 Markdown 渲染
  const unescapedText = unescapeString(markdown);
  return md.renderInline(unescapedText);
};

export default md;

