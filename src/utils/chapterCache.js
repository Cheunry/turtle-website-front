/**
 * 章节本地缓存工具
 *
 * 功能：
 * 1. 将章节内容缓存到 localStorage，减少服务器请求
 * 2. 预加载当前章节的前后章节，提升阅读体验
 *
 * 缓存策略：
 * - 最多缓存 5 章（当前章 + 前2章 + 后2章）
 * - 缓存有效期：1 小时
 * - 使用 LRU 清理策略
 */

const CHAPTER_CACHE_PREFIX = 'chapter_cache_';
const MAX_CACHED_CHAPTERS = 5;
const CACHE_EXPIRE_TIME = 3600000; // 1小时（毫秒）

/**
 * 生成章节缓存的 key
 * @param {string|number} bookId - 书籍ID
 * @param {number} chapterNum - 章节号
 * @returns {string} 缓存 key
 */
function getCacheKey(bookId, chapterNum) {
    return `${CHAPTER_CACHE_PREFIX}${bookId}_${chapterNum}`;
}

/**
 * 获取章节缓存
 * @param {string|number} bookId - 书籍ID
 * @param {number} chapterNum - 章节号
 * @returns {object|null} 缓存的章节数据，未过期返回数据，否则返回 null
 */
function getChapterFromCache(bookId, chapterNum) {
    const key = getCacheKey(bookId, chapterNum);
    const cached = localStorage.getItem(key);

    if (!cached) {
        return null;
    }

    try {
        const { content, chapterInfo, updateTime } = JSON.parse(cached);
        const now = Date.now();

        // 检查缓存是否过期
        if (now - updateTime > CACHE_EXPIRE_TIME) {
            localStorage.removeItem(key);
            return null;
        }

        return { content, chapterInfo };
    } catch (e) {
        // JSON 解析失败，删除无效缓存
        localStorage.removeItem(key);
        return null;
    }
}

/**
 * 保存章节到缓存
 * @param {string|number} bookId - 书籍ID
 * @param {number} chapterNum - 章节号
 * @param {object} data - 章节数据，包含 content 和 chapterInfo
 */
function saveChapterToCache(bookId, chapterNum, data) {
    if (!bookId || !chapterNum || !data) {
        return;
    }

    const key = getCacheKey(bookId, chapterNum);
    const cacheData = {
        content: data.bookContent || data.content,
        chapterInfo: data.chapterInfo,
        updateTime: Date.now()
    };

    try {
        localStorage.setItem(key, JSON.stringify(cacheData));
        // 清理旧缓存
        cleanupOldCache(bookId);
    } catch (e) {
        // 如果存储失败（空间不足），清理所有该书籍的缓存
        console.warn('章节缓存存储失败，可能空间不足');
        clearBookCache(bookId);
    }
}

/**
 * 清理指定书籍的旧缓存，保留最近访问的章节
 * 使用 LRU（最近最少使用）策略
 * @param {string|number} bookId - 书籍ID
 */
function cleanupOldCache(bookId) {
    const prefix = `${CHAPTER_CACHE_PREFIX}${bookId}_`;

    // 收集所有该书籍的缓存 key
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keys.push(key);
        }
    }

    // 如果缓存数量未超过上限，不需清理
    if (keys.length <= MAX_CACHED_CHAPTERS) {
        return;
    }

    // 按更新时间排序，删除最旧的
    const cacheList = keys.map(key => {
        try {
            const cached = JSON.parse(localStorage.getItem(key));
            return {
                key,
                updateTime: cached.updateTime || 0
            };
        } catch (e) {
            return { key, updateTime: 0 };
        }
    });

    cacheList.sort((a, b) => a.updateTime - b.updateTime);

    // 删除多余的缓存
    const deleteCount = keys.length - MAX_CACHED_CHAPTERS;
    for (let i = 0; i < deleteCount; i++) {
        localStorage.removeItem(cacheList[i].key);
    }
}

/**
 * 清除指定书籍的所有缓存
 * @param {string|number} bookId - 书籍ID
 */
function clearBookCache(bookId) {
    const prefix = `${CHAPTER_CACHE_PREFIX}${bookId}_`;
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
}

/**
 * 清除所有章节缓存
 */
function clearAllChapterCache() {
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CHAPTER_CACHE_PREFIX)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
}

export {
    getCacheKey,
    getChapterFromCache,
    saveChapterToCache,
    cleanupOldCache,
    clearBookCache,
    clearAllChapterCache,
    MAX_CACHED_CHAPTERS,
    CACHE_EXPIRE_TIME
};
