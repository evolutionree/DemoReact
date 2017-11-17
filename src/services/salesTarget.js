/**
 * Created by 0291 on 2017/8/7.
 */
import request from '../utils/request';

/**
 * 查询销售指标
 * @param params
 * @returns {Promise.<object>}
 */
export async function getnormtypelist(params) {
  return request('api/salestarget/getnormtypelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取年度销售目标
 * @param params
 * {
    "departmentid":"7f74192d-b937-403f-ac2a-8be34714278b",
    "year":2017,
    "normtypeid":"11ac5cad-a364-4409-bf3a-693751d9a640"
  }
 * @returns {Promise.<object>}
 */
export async function getyeartarget(params) {
  return request('api/salestarget/getyeartarget', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取下级团队和人员
 * @param params
 * {

  "DepartmentId":"186a0268-cb4d-48fc-a935-9fb1b2562f24"

}
 * @returns {Promise.<object>}
 */
export async function getdepartment(params) {
  return request('api/salestarget/getdepartment', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存年度销售目标
 * @param params
 * @returns {Promise.<object>}
 */
export async function saveyeartarget(params) {
  return request('api/salestarget/saveyeartarget', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取销售目标
 * @param params
 * {
    "departmentid":"786f41c3-a4ca-4f84-a007-5a5608ccc67f"
    "userid":"",
    "normtypeid":"5061d49e-9aa5-47cf-8650-56c71efdba80",
    "isgrouptarget":"",
    "year":""
 }
 * @returns {Promise.<object>}
 */
export async function gettargetdetail(params) {
  return request('api/salestarget/gettargetdetail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存销售目标
 * @param params
 * @returns {Promise.<object>}
 */
export async function savetarget(params) {
  return request('api/salestarget/savetarget', {
    method: 'post',
    body: JSON.stringify(params)
  });
}



