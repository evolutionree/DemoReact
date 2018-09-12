import request from '../utils/request';

/**
 * 获取审批通知列表
 * @param params
 * {
    "entityId": String,
    "isAdvanceQuery": 1,
    "menuId": String,
    "pageindex": 1,
    "pagesize": 10,
    "searchData": {auditstatus: -1},
    "searchOrder": "",
    "viewType": Number
  }
 * @returns {Promise.<Object>}
 */
export async function queryNoticeList(params) {
  return request('/api/dynamicentity/list', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
