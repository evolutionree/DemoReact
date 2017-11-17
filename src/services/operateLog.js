import request from '../utils/request';

/**
 * 获取操作日志记录
 * @param params
 * {
    "DeptId":"7f74192d-b937-403f-ac2a-8be34714278b",
    "UserName":"李",
    "SearchBegin":"",
    "SearchEnd":"",
    "PageIndex":1,
    "PageSize":10
    }
 * @returns {Promise.<Object>}
 */
export async function queryRecordList(params) {
  return request('/api/operatelog/recordlist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
