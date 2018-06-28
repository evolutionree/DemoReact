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
