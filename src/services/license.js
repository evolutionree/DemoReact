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


/**
 * 钉钉后台 免登系统
 * {
  "code":"3b7d5c2374773d8faec0ea6676413663"
}
 * @returns {Promise.<Object>}
 */
export async function apploginwithdingtalk(params) {
  return request('api/dingding/apploginwithdingtalk', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
