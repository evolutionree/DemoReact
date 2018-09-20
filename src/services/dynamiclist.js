import request from '../utils/request';

/**
 * 获取审批通知列表
 * @param params
 *
{
  "DataRangeType":1,
  "DepartmetnId":"1dea13f3-06dd-406c-b780-c3e5a3ca471f",
  "UserIds":{},
  "TimeRangeType":1,
  "SpecialYear":2018,
  "StartTime":"2018-08-01",
  "EndTime":'"2018-08-31",
  "MainEntityId":"1dea13f3-06dd-406c-b780-c3e5a3ca471f",
  "SearchKey":"",
  "RelatedEntityId":"1dea13f3-06dd-406c-b780-c3e5a3ca471f",
  "PageSize":10,
  "PageIndex":1
}
 * @returns {Promise.<Object>}
 */
export async function queryDynamiclist (params) {
  return request('/api/desktop/dynamiclist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取主实体列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryMainTypeList (params) {
  return request('/api/desktop/entitylist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取关联实体列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryRelatedEntityList (params) {
  return request('/api/desktop/relatedentitylist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
queryRelatedEntityList