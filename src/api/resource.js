import request from '../utils/request'

export function getImgVerifyCode() {
    return request.get('/front/resource/img_verify_code');
}

export function uploadImage(params) {
  return request.post('/front/resource/image', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
