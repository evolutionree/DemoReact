/**
 * Created by 0291 on 2018/8/2.
 */
import request from '../utils/request';

/**
 * 获取工作台组件列表
 * {
  "ComName":""
  "status":1
}
 * @returns {Promise.<Object>}
 */
export async function getdeskcomponentlist(params) {
  return request('/api/desktop/getdesktopcoms', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 保存工作台组件
 * @returns {Promise.<Object>}
 */
export async function deskcomponentsave(params) {
  return request('/api/desktop/savedesktopcomponent', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 启用停用工作台组件
 * @returns {Promise.<Object>}
 */
export async function enabledesktopcomponent(params) {
  return request('/api/desktop/enabledesktopcomponent', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取工作台列表
 * {
"DesktopName":""
"status":1
}
 * @returns {Promise.<Object>}
 */
export async function getdesktops(params) {
  return request('/api/desktop/getdesktops', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存工作台
 * @returns {Promise.<Object>}
 */
export async function savedesktop(params) {
  return request('/api/desktop/savedesktop', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 启用停用工作台
 * @returns {Promise.<Object>}
 */
export async function enabledesktop(params) {
  return request('/api/desktop/enabledesktop', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取工作台首页定义
 * @returns {Promise.<Object>}
 */
export async function getdesktop() {
  return request('/api/desktop/getdesktop', {
    method: 'post',
    body: JSON.stringify({})
  });
}
