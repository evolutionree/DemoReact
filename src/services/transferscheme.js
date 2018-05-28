/**
 * Created by 0291 on 2018/5/28.
 */
import request from '../utils/request';

/**
 * 设置业务对象转移方案
 * @param params
 *
 * @returns {Promise.<object>}
 */
export async function savetransferscheme(params) {
  return request('/api/TransferScheme/savetransferscheme', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *获取业务对象转移方案列表
 * @param params
 *{
	"SearchName":"a",
	"RecStatus":0
}
 * @returns {Promise.<object>}
 */
export async function transferschemelist(params) {
  return request('/api/TransferScheme/transferschemelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *修改状态
 * @param params
 *{
    "RecIds": "",
    "Status": 1    1启用/0禁用
}
 * @returns {Promise.<object>}
 */
export async function setstatus(params) {
  return request('/api/TransferScheme/setstatus', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

