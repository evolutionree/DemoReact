import request from '../utils/request';

/**
 * 获取考勤列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function authCompany() {
    return request('/api/account/authcompany', {
        method: 'post'
    });
}

/**
 * 获取许可信息
 * @param params
 * @returns {Promise.<Object>}
 */
export async function authLicenseInfo() {
    return request('/api/account/authlicenseinfo', {
        method: 'post'
    });
}