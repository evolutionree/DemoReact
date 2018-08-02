/**
 * Created by 0291 on 2018/8/2.
 */
import request from '../utils/request';

/**
 * 保存工作台组件
 * @returns {Promise.<Object>}
 */
export async function getdeskcomponentlist() {
  return request('/api/desktop/componentlist', {
    method: 'post',
    body: JSON.stringify({})
  });
}


/**
 * 保存工作台组件
 * @returns {Promise.<Object>}
 */
export async function deskcomponentsave(params) {
  return request('/api/desktop/componentsave', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
