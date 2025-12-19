import request from '../utils/request'

export function getImgVerifyCode() {
    return request.get('/front/resource/img_verify_code');
}

export function uploadImage(params) {
    return request.post('/front/resource/image', params);
}

// 新增：图片URL转存接口
export function uploadImageFromUrl(url) {
    return request.post('/front/resource/image/url', null, {
        params: { url }
    });
}
