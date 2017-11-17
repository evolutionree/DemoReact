/**
 * Created by 0291 on 2017/6/20.
 */
import request from '../utils/request';

/**
 * 查询合同所有的回款信息，计划信息
 * @param params
 * {
    "contractid":"",//合同id
    "pageindex":1,
    "pagesize":10,
  }
 * @returns {Promise.<object>}
 */
export async function query(params) {
  return request('/api/contract/paymentsandplan', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 删除合同回款计划
 * @param params
 public string RecId { get; set; }
 * @returns {Promise.<Object>}
 */
export async function delPlan(params) {
  return request('/api/dynamicentity/delete', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 删除合同回款记录
 * @param params
 public string RecId { get; set; }
 * @returns {Promise.<Object>}
 */
export async function delRecord(params) {
  return request('/api/dynamicentity/delete', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
