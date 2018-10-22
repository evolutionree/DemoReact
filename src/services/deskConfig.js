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
 * 获取工作台组件布局
 * {
"DesktopName":""
"status":1
}
 * @returns {Promise.<Object>}
 */
export async function getactualdesktopcom(desktopid) {
  return request('/api/desktop/getactualdesktopcom', {
    method: 'post',
    body: JSON.stringify({ desktopid })
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
 * 保存工作台组件
 * @returns {Promise.<Object>}
 */
export async function saveactualdesktopcom(params) {
  return request('/api/desktop/saveactualdesktopcom', {
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
 * 绑定工作台角色
 * [{
"desktopid":"8c189af8-3dca-4982-a28d-90b6dbd7cf45",
"roleid":"63dd2a9d-7f75-42ff-a696-7cc841e884e7"
}]
 * @returns {Promise.<Object>}
 */
export async function savedesktoprolerelate(params) {
  return request('api/desktop/savedesktoprolerelate', {
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
