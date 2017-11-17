/**
 * Created by 0291 on 2017/8/2.
 */

import request from '../utils/request';
/**
 * 获取销售指标列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function getnormtypelist(params) {
  return request('api/salestarget/getnormtypelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 新增销售指标
 * @param params
 * @returns {Promise.<Object>}
 */
export async function savenormtype(params) {
  return request('api/salestarget/savenormtype', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除销售指标
 * @param params
 * {
 * "id":"b34a1aad-dc24-429c-9fd1-832c2f9d1987"
 * }
 * @returns {Promise.<Object>}
 */
export async function deletenormtype(params) {
  return request('api/salestarget/deletenormtype', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取实体
 * @param params
 * @returns {Promise.<object>}
 */
export async function getentitylist(params) {
  return request('api/salestarget/getentitylist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取统计字段
 * @param params
 * {
  "entityId":"eac98282-17e4-4599-9a16-0c3080ec43f2"
}
 * @returns {Promise.<object>}
 */
export async function queryentityfield(params) {
  return request('api/salestarget/getentityfield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取统计字段
 * @param params
 * {
  "entityId":"eac98282-17e4-4599-9a16-0c3080ec43f2"
}
 * @returns {Promise.<object>}
 */
export async function queryentityProfield(params) {
  return request('api/EntityPro/queryentityfield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}




/**
 * 新增指标统计规则
 * @param params
 * {
  "entityId":"eac98282-17e4-4599-9a16-0c3080ec43f2"
}
 * @returns {Promise.<object>}
 */
export async function savenormtyperule(params) {
  return request('api/salestarget/savenormtyperule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取指标统计规则
 * @param params
 * {
  "Id":"7593bedc-b842-4208-8f33-5852610f54b5"
}
 * @returns {Promise.<object>}
 */
export async function getnormtyperule(params) {
  return request('api/salestarget/getnormtyperule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


