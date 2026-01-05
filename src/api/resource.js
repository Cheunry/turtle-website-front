import request from '../utils/request'

/**
 * 获取图片验证码
 */
export function getImgVerifyCode() {
    return request.get('/front/resource/img_verify_code');
}

/**
 * 获取图片上传凭证（前端直传模式）
 * @param {string} ext - 文件扩展名，如 'jpg', 'png'
 * @returns {Promise} 返回预签名上传URL
 */
export function getUploadCredential(ext) {
    return request.get('/front/resource/image/credential', {
        params: { ext }
    });
}

/**
 * 图片上传接口（兼容旧代码，后端转发模式）
 * 注意：建议使用前端直传模式（getUploadCredential + 直接PUT到COS）
 * @param {FormData} formData - 包含文件的FormData
 */
export function uploadImage(formData) {
    return request.post('/front/resource/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 图片URL转存接口（将外部URL的图片转存到COS）
 * @param {string} url - 图片URL
 */
export function uploadImageFromUrl(url) {
    return request.post('/front/resource/image/url', null, {
        params: { url }
    });
}

/**
 * 前端直传：上传文件到COS
 * @param {File|Blob} file - 要上传的文件
 * @returns {Promise<string>} 返回COS访问URL
 */
export async function uploadImageDirect(file) {
    try {
        // 1. 获取文件扩展名
        const fileName = file.name || 'upload.jpg';
        const ext = fileName.split('.').pop().toLowerCase() || 'jpg';
        console.log('开始上传，文件名:', fileName, '扩展名:', ext);
        
        // 2. 获取上传凭证（包含预签名URL和最终URL）
        console.log('正在获取上传凭证...');
        const credentialResponse = await getUploadCredential(ext);
        console.log('凭证响应:', credentialResponse);
        
        if (!credentialResponse || !credentialResponse.data) {
            throw new Error('获取上传凭证失败：响应数据为空');
        }
        
        const { presignedUrl, finalUrl } = credentialResponse.data;
        if (!presignedUrl || !finalUrl) {
            console.error('凭证数据不完整:', credentialResponse.data);
            throw new Error('获取上传凭证失败：返回数据格式不正确，缺少 presignedUrl 或 finalUrl');
        }
        
        console.log('预签名URL:', presignedUrl.substring(0, 100) + '...');
        console.log('最终URL:', finalUrl);
        
        // 3. 直接PUT文件到COS
        console.log('开始上传文件到COS，文件大小:', file.size, 'bytes');
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type || 'image/jpeg'
            }
        });
        
        console.log('上传响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '无法读取错误信息');
            console.error('上传失败详情:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText
            });
            throw new Error(`上传失败: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        }
        
        console.log('上传成功，最终URL:', finalUrl);
        // 4. 返回最终访问URL（后端已计算好）
        return { data: finalUrl };
    } catch (error) {
        console.error('前端直传失败，完整错误信息:', error);
        // 如果是网络错误，提供更友好的提示
        if (error.message && error.message.includes('Failed to fetch')) {
            throw new Error('网络连接失败，可能是CORS问题或COS服务不可用，请检查浏览器控制台');
        }
        throw error;
    }
}
