import request from '../utils/request'

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

export function updateBook(bookId, params) {
    return request.put(`/author/book/${bookId}`, params);
}

export function deleteBook(bookId) {
    return request.delete(`/author/book/${bookId}`);
}

export function listChapters(bookId, params) {
    return request.get(`/author/book/chapters/${bookId}`, { params });
}

export function publishChapter(bookId,params) {
    return request.post(`/author/book/chapter/${bookId}`, params);
}

export function aiGenerate(action,params) {
    // 修改为发送 JSON 格式，适配后端 @RequestBody
    return request.post(`/front/ai/${action}`, params, {
        timeout: 60000
    });
}

// 新增：AI生成图片接口（使用FormData格式或查询参数）
export function aiGenerateImage(prompt) {
    return request.post(`/front/ai/generate-image`, null, {
        params: { prompt },
        timeout: 60000
    });
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

// === Message API ===
export function listAuthorMessages(params) {
    return request.post('/author/message/list', params);
}

export function readAuthorMessage(id) {
    return request.put(`/author/message/read/${id}`);
}

export function deleteAuthorMessage(id) {
    return request.delete(`/author/message/${id}`);
}

export function batchReadAuthorMessages(ids) {
    return request.put('/author/message/batch_read', ids);
}

export function batchDeleteAuthorMessages(ids) {
    return request.post('/author/message/batch_delete', ids);
}

export function allReadAuthorMessages() {
    return request.put('/author/message/all_read');
}

export function allDeleteAuthorMessages() {
    return request.post('/author/message/all_delete');
}

export function getAuthorUnReadCount() {
    return request.get('/author/message/unread_count');
}
