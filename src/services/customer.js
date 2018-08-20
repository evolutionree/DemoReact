/**
 * Created by 0291 on 2017/7/11.
 */
import request from '../utils/request';

/**
 * 查询客户关系树
 * @param params
 * {
    "custid":"",//客户id
  }
 * @returns {Promise.<object>}
 */
export async function queryCustomerTree(params) {
  return request('/api/customer/querycustrel', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取待合并的客户列表
 * @param params
 * {
    "MenuId":"",//菜单ID
    SearchKey:"",//查询条件
  }
 * @returns {Promise.<object>}
 */
export async function queryNeedMergelist(params) {
  return request('/api/customer/needmergelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 客户合并
 * @param params
 * {
  "MainCustId":"6ce55dbd-6cd7-4d60-9b9e-e8ae9c4c102a",//合并主客户的recid
  "CustIds":[//待合并的客户recid数组
    "0ce55dbd-6cd7-4d60-9b9e-e8ae9c4c102d",
    "8ce55dbd-6cd7-4d60-9b9e-e8ae9c4c102a"
    ]
  }
 * @returns {Promise.<object>}
 */
export async function customerMerge(params) {
  return request('/api/customer/merge', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 查询联系人关系表
 * @param params
 * {
    "ContactId":"",//联系人id
    Level:1 层级
  }
 * @returns {Promise.<object>}
 */
export async function queryContactrelation(params) {
  return request('/api/dingding/contactrelation', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
