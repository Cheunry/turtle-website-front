import request from '../utils/request'

export function listCategorys(params) {
    return request.get('/front/book/category/list', { params });
}

export function searchBooks(params) {
    return request.get('/front/search/books', { params });
}

export function getBookById(bookId) {
    return request.get(`/front/book/${bookId}`);
}

export function addVisitCount(params) {
    return request.post('/front/book/visit', params);
}

export function getLastChapterAbout(params) {
    return request.get('/front/book/last_chapter/about', { params });
}

export function listRecBooks(params) {
    return request.get('/front/book/rec_list', { params });
}

export function listChapters(params) {
    return request.get('/front/book/chapter/list', { params });
}

export function getBookContent(bookId, chapterNum) {
    return request.get(`/front/book/content/${bookId}/${chapterNum}`);
}

// export function getPreChapterId(chapterId) {
//     return request.get(`/front/book/pre_chapter_id/${chapterId}`);
// }

export function getPreChapterId(bookId, chapterNum) {
    return request.get(`/front/book/pre_chapter_id/${bookId}/${chapterNum}`);
}

// export function getNextChapterId(chapterId) {
//     return request.get(`/front/book/next_chapter_id/${chapterId}`);
// }

export function getNextChapterId(bookId, chapterNum) {
    // 构造新的 URL 路径，将 bookId 和 chapterId 都放在路径中
    return request.get(`/front/book/next_chapter_id/${bookId}/${chapterNum}`);
}


/** 排行榜页：点击榜表格 */
export function listVisitRankBooks() {
    return request.get('/front/book/visit_rank');
}

/** 首页侧栏：点击榜（仅第一名含封面、简介预览） */
export function listVisitRankBooksHome() {
    return request.get('/front/book/visit_rank/home');
}

/** 排行榜页：新书榜表格 */
export function listNewestRankBooks() {
    return request.get('/front/book/newest_rank');
}

/** 首页侧栏：新书榜 */
export function listNewestRankBooksHome() {
    return request.get('/front/book/newest_rank/home');
}

/** 排行榜页：更新榜表格 */
export function listUpdateRankBooks() {
    return request.get('/front/book/update_rank');
}

/** 首页侧栏：更新榜 */
export function listUpdateRankBooksHome() {
    return request.get('/front/book/update_rank/home');
}

/** 首页「最新更新」表格 */
export function listHomeLatestUpdates() {
    return request.get('/front/book/home/latest_updates');
}

export function listCommentByPage(params) {
    return request.get('/front/book/comment/list_page',{ params });
}

