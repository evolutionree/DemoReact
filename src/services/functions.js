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

/**
 * {  
	"RelTabId": "46c74054-af12-474e-8e33-1dbd752e962f",
	"entityid": "f9db9d79-e94b-4678-a5cc-aa6e281c1246",
	"rule": {
		"ruleid": "bd5843a4-ca92-4bd8-a4f8-b0f31fbefb3e",
		"entityid": "f9db9d79-e94b-4678-a5cc-aa6e281c1246",
		"rulename": "",
		"rulesql": ""
	},
	"ruleset": {
		"ruleset": "",
		"userid": 0,
		"ruleformat": ""
	},
	"ruleitems": [{
		"itemid": "c20c221d-af67-4183-a606-6f33b20a2d5b",
		"itemname": "规则1",
		"entityid": "f9db9d79-e94b-4678-a5cc-aa6e281c1246",
		"fieldid": "00000000-0000-0000-0000-000000000000",
		"operate": "",
		"ruledata": "{\"dataVal\":\"1=2\"}",
		"ruletype": 2,
		"usetype": 0,
		"relation": {
			"itemid": "c20c221d-af67-4183-a606-6f33b20a2d5b",
			"userid": 0,
			"rolesub": 1,
			"paramindex": 1
		}
	}]
}
 */
export async function savereltabrule(params) {
  return request('/api/vocation/savereltabrule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 { 
	"EntityId": "f9db9d79-e94b-4678-a5cc-aa6e281c1246",
	"RelTabId": "46c74054-af12-474e-8e33-1dbd752e962f"
  }
 */
export async function getreltabrule(params) {
  return request('/api/vocation/getreltabrule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

