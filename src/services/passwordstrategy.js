import request from '../utils/request';

/**
 * 保存密码策略配置
 * @param params
 *
 * @returns {Promise.<Object>}
 */
export async function savepwdpolicy(params) {
  return request('/api/Account/savepwdpolicy', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取密码策略配置
 * @param params
 *
 * @returns {Promise.<Object>}
 */
export async function getpwdpolicy(params) {
  return request('/api/Account/getpwdpolicy', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

