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

export async function ssologinwithdingtalk(params) {
  return request('api/dingding/ssologinwithdingtalk', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
