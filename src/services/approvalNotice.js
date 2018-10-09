import request from '../utils/request';

/**
 * 获取审批通知列表
 * @param params
 * {
    "pageindex": 1,
    "pagesize": 10,
  }
 * @returns {Promise.<Object>}
 */
export async function queryGetunmsglist(params) {
  return request('/api/notify/getunmsglist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function queryGetwflist(params) {
  return request('/api/notify/getwflist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}