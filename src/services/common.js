import request from '../utils/request';
/**
 * 自定义请求
 * @param params url
 * @returns {Promise.<Object>}
 */
export async function dynamicRequest(url, params) {
  return request(url, {
    method: 'post',
    body: JSON.stringify(params)
  });
}
