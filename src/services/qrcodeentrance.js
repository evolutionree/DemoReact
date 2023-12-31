/**
 * Created by 0291 on 2018/6/27.
 */
import request from '../utils/request';

/**
 * 查询二维码入口列表
 * @returns {Promise.<Object>}
 */
export async function queryqrcodelist() {
  return request('api/qrcode/list', {
    method: 'post',
    body: JSON.stringify({ IsShowDisabled: false })
  });
}

/**
 * 新增二维码入口
 * @returns {Promise.<Object>}
 */
export async function addqrcodelist(params) {
  return request('api/qrcode/add', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑二维码入口
 * @returns {Promise.<Object>}
 */
export async function editqrcodelist(params) {
  return request('api/qrcode/edit', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 二维码入口列表排序
 * RecIds: 按顺序的ids，逗号分隔
 * @returns {Promise.<Object>}
 */
export async function orderbyrule(params) {
  return request('api/qrcode/orderrule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取匹配定义详情
 * RecId
 * @returns {Promise.<Object>}
 */
export async function getmatchparam(recid) {
  return request('api/qrcode/getmatchparam', {
    method: 'post',
    body: JSON.stringify({ recid })
  });
}

/**
 * 更新匹配定义详情
 * RecId
 * @returns {Promise.<Object>}
 */
export async function updatematchparam(params) {
  return request('api/qrcode/updatematchparam', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取智能入口定义详情
 * RecId
 * @returns {Promise.<Object>}
 */
export async function getdealparam(recid) {
  return request('api/qrcode/getdealparam', {
    method: 'post',
    body: JSON.stringify({ recid })
  });
}

/**
 * 更新智能入口定义详情
 * RecId
 * @returns {Promise.<Object>}
 */
export async function updatedealparam(params) {
  return request('api/qrcode/updatedealparam', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
