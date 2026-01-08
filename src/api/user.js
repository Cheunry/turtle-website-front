import request from '../utils/request'

export function register(params) {
    return request.post('/front/user/register', params);
}

export function login(params) {
    return request.post('/front/user/login', params);
}

export function logout() {
    return request.post('/front/user/logout');
}

export function submitFeedBack(params) {
    return request.post('/front/user/feedback', params);
}

export function comment(params) {
    return request.post('/front/user/comment',params);
}

export function deleteComment(id) {
    return request.delete(`/front/user/comment/${id}`);
}

export function updateComment(id,content) {
    return request.putForm(`/front/user/comment/${id}`,content);
}

export function getUserinfo() {
    return request.get('/front/user');
}

export function updateUserInfo(userInfo) {
    return request.put('/front/user',userInfo);
}


export function addToBookshelf(bookId) {
    return request.post(`/front/user/bookshelf?bookId=${bookId}`);
}

export function listBookshelf() {
    return request.get('/front/user/bookshelf');
}

export function deleteBookshelf(bookId) {
    return request.delete(`/front/user/bookshelf?bookId=${bookId}`);
}

export function updateBookshelfProcess(bookId, chapterNum) {
    return request.put(`/front/user/bookshelf/process?bookId=${bookId}&chapterNum=${chapterNum}`);
}

// === Message API ===

export function listMessages(params) {
    return request.get('/front/user/message', { params });
}

export function readMessage(id) {
    return request.put(`/front/user/message/read/${id}`);
}

export function deleteMessage(id) {
    return request.delete(`/front/user/message/${id}`);
}

export function batchReadMessages(ids) {
    return request.put('/front/user/message/batch_read', ids);
}

export function batchDeleteMessages(ids) {
    return request.post('/front/user/message/batch_delete', ids);
}

export function allReadMessages() {
    return request.put('/front/user/message/all_read');
}

export function allDeleteMessages() {
    return request.post('/front/user/message/all_delete');
}

export function countUnreadMessages() {
    return request.get('/front/user/message/unread_count?t=' + new Date().getTime());
}
