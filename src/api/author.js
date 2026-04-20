import request from '../utils/request'
import { postJsonSse } from '../utils/postJsonSse'

export function getAuthorStatus() {
    return request.get('/author/status');
}

export function register(params) {
    return request.post('/author/register', params);
}

export function listBooks(params) {
    return request.get('/author/books', { params });
}

export function publishBook(params) {
    return request.post('/author/book', params);
}

export function listChapters(bookId, params) {
    return request.get(`/author/book/chapters/${bookId}`, { params });
}

export function publishChapter(bookId,params) {
    return request.post(`/author/book/chapter/${bookId}`, params);
}

export function getChapter(bookId, chapterNum) {
    return request.get(`/author/book/chapter/${bookId}/${chapterNum}`);
}

export function updateChapter(bookId, chapterNum, params) {
    return request.put(`/author/book/chapter_update/${bookId}/${chapterNum}`, params);
}

export function deleteChapter(bookId, chapterNum) {
    return request.post(`/author/book/chapter/delete/${bookId}/${chapterNum}`);
}

export function deleteBook(bookId) {
    return request.delete(`/author/book/${bookId}`);
}

export function updateBook(bookId, params) {
    return request.put(`/author/book/${bookId}`, params);
}

export function getBookById(bookId) {
    return request.get(`/author/book/${bookId}`);
}

// 获取作家未读消息数量
export function getAuthorUnReadCount() {
    return request.get('/author/message/unread_count');
}

// 获取作家消息列表
export function listAuthorMessages(params) {
    return request.post('/author/message/list', params);
}

// 标记消息已读
export function readAuthorMessage(id) {
    return request.put(`/author/message/read/${id}`);
}

// 删除消息
export function deleteAuthorMessage(id) {
    return request.delete(`/author/message/${id}`);
}

// 批量标记已读
export function batchReadAuthorMessages(ids) {
    return request.put('/author/message/batch_read', ids);
}

// 批量删除
export function batchDeleteAuthorMessages(ids) {
    return request.post('/author/message/batch_delete', ids);
}

// 全部标记已读
export function allReadAuthorMessages() {
    return request.put('/author/message/all_read');
}

// 全部删除
export function allDeleteAuthorMessages() {
    return request.post('/author/message/all_delete');
}

/* ***************** AI 服务接口 ***************** */

// AI 审核 (含扣分逻辑)
export function aiAudit(params) {
    return request.post('/author/ai/audit', params, { timeout: 180000 });
}

// AI 润色 (含扣分逻辑，同步返回 JSON)
export function aiPolish(params) {
    return request.post('/author/ai/polish', params, { timeout: 180000 });
}

/**
 * AI 润色 SSE 流式（先扣分；事件 delta=正文片段、done=结束、error=业务错误 JSON）
 * @param {object} params AuthorPointsConsumeReqDto
 * @param {{ onDelta?: (chunk: string) => void, onDone?: () => void, signal?: AbortSignal }} callbacks
 */
export function streamAiPolish(params, callbacks = {}) {
    const { onDelta, onDone, signal } = callbacks
    return postJsonSse(
        '/author/ai/polish/stream',
        params,
        (eventName, raw) => {
            if (eventName === 'delta') {
                onDelta && onDelta(raw)
            } else if (eventName === 'done') {
                onDone && onDone()
            }
        },
        { signal }
    )
}

// AI 封面生成 (含扣分逻辑；异步任务，立即返回 jobId)
export function aiCover(params) {
    return request.post('/author/ai/cover', params, { timeout: 60000 });
}

// 查询异步封面生图任务状态
export function getCoverJob(jobId) {
    return request.get(`/author/ai/cover/jobs/${encodeURIComponent(jobId)}`, { timeout: 30000 });
}

// AI 封面提示词生成 (不扣分，仅生成提示词)
export function aiCoverPrompt(params) {
    return request.post('/author/ai/cover-prompt', params, { timeout: 60000 });
}

/* ***************** 积分充值接口 ***************** */

// 创建积分充值订单
export function createRechargeOrder(params) {
    return request.post('/payment/recharge', params);
}
