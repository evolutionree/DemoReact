import _ from 'lodash';
import request from '../utils/request';

// ======= 角色分类 ========

/**
 * 获取职能列表
 * {"pageIndex":1,"pageSize":10,"vocationName":""}
 * @returns {Promise.<Object>}
 */
export async function queryVocations(params) {
  return request('/api/vocation/getvocations', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function addVocation(params) {
  return request('/api/vocation/savevocation', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function updateVocation(params) {
  return request('/api/vocation/savevocation', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function copyVocation(params) {
  return request('/api/vocation/copyvocation', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除角色
 * @param vocations
 * @returns {Promise.<Object>}
 */
export async function delVocations(vocations) {
  return request('/api/vocation/deletevocation', {
    method: 'post',
    body: JSON.stringify({ vocationids: vocations })
  });
}

export async function queryAllFunctions() {
  return request('/api/vocation/getfunctions', {
    method: 'post',
    body: JSON.stringify({ funcid: '', vocationid: '', direction: '' })
  });
}
export async function queryVocationUsers(params) {
  return request('/api/vocation/getuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
export async function delVocationUsers(params) {
  return request('/api/vocation/deleteuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function queryFunctions() {
  return request('/api/vocation/getfunctiontree', {
    method: 'post',
    body: JSON.stringify({ topfuncid: '1fc3a304-9e5c-4f8e-852b-ef947645aa98', direction: 1 })
  });
}
export async function queryVocationFunctions(vocationid) {
  return request('/api/vocation/getfunctions', {
    method: 'post',
    body: JSON.stringify({ FuncId: '1fc3a304-9e5c-4f8e-852b-ef947645aa98', VocationId: vocationid, direction: 1 })
  });
}
export async function saveVocationFunctions(params) {
  return request('/api/vocation/editfunctions', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询function数据规则
 * @param params
 *  VocationId：""
   FunctionId :""
   EntityId :""
 * @returns {Promise.<Object>}
 */
export async function queryFunctionRule(params) {
  return request('/api/vocation/getrule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存function数据规则
 * @param params
 * {
    VocationId:"",
    FunctionId:"",
    entityid:"",
    rule:
    {
        "entityid":"",
        "RuleName":"",
        "RuleSql":"",
        "RuleId":null
    },
    "ruleset":{"ruleset":"$1","userid":0,"ruleformat":""},
    "ruleitems":[]
    }
 * @returns {Promise.<Object>}
 */
export async function saveFunctionRule(params) {
  return request('/api/vocation/saverule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取用户的功能列表
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function queryPermission(entityid) {
  return request(' api/vocation/getuserfunctionlist', {
    method: 'post',
    body: JSON.stringify({ entityid })
  });
}
