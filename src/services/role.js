import _ from 'lodash';
import request from '../utils/request';

// ======= 角色分类 ========

/**
 * 获取角色分类
 * @returns {Promise.<Object>}
 */
export async function queryGroups() {
  return request('/api/role/queryrolegroup', {
    method: 'post'
  });
}

/**
 * 新增角色分类
 * @param params
 * {
    groupname: 'asdf'
  }
 * @returns {Promise.<Object>}
 */
export async function saveGroup(params) {
  return request('/api/role/insertrolegroup', {
    method: 'post',
    body: JSON.stringify({ ...params, grouptype: 1 })
  });
}

/**
 * 更新角色分类
 * @param params
 * {
    groupname: 'asdf',
    RoleGroupId: 'xxx'
  }
 * @returns {Promise.<Object>}
 */
export async function updateGroup(params) {
  return request('/api/role/updaterolegroup', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 排序角色分类
 * @param params
 * [{
    "RoleGroupId":""
  }]
 * @returns {Promise.<Object>}
 */
export async function orderGroup(params) {
  return request('/api/role/orderbyrolegroup', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除角色分类
 * @param {String} groupId
 * @returns {Promise.<Object>}
 */
export async function delGroup(groupId) {
  return request('/api/role/disabledrolegroup', {
    method: 'post',
    body: JSON.stringify({ RoleGroupId: groupId })
  });
}

/**
 * 获取角色分页数据
 * @param params
 * {"pageIndex":1,"pageSize":10,"roleName":"","groupId":""}
 * @returns {Promise.<Object>}
 */
export async function queryRoles(params) {
  return request('/api/role/queryrole', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// /**
//  * 获取单个角色数据
//  * @param roleId
//  * @returns {Promise.<Object>}
//  */
// export async function queryRole({ roleId }) {
//   return request('/api/role/getrole', {
//     method: 'post',
//     body: JSON.stringify({ roleId })
//   });
// }

/**
 * 保存角色
 * @param params
 * {
    "rolename":"",
    "roleremark":""，
    ”rolegroupid": "",
    "roletype":0 or 1,
    "rolepriority":0,角色特权 主要用于多角色时，区分等级';暂时随便传
   }
 * @returns {Promise.<Object>}
 */
export async function addRole(params) {
  return request('/api/role/insertrole', {
    method: 'post',
    body: JSON.stringify({
      ...params,
      roletype: 1,
      rolepriority: 0
    })
  });
}

/**
 * 更新角色
 * @param params
 * {
    "roleid":""
    "rolename":"",
    "roleremark":""，
    ”rolegroupid": "",
    "roletype":0 or 1,
    "rolepriority":0,角色特权 主要用于多角色时，区分等级';暂时随便传
   }
 * @returns {Promise.<Object>}
 */
export async function updateRole(params) {
  return request('/api/role/updaterole', {
    method: 'post',
    body: JSON.stringify({
      ...params,
      roletype: 1,
      rolepriority: 0
    })
  });
}


/**
 * 复制角色
 * @param params
 * {
    "roleid":""
    "rolename":"",
    "roleremark":""，
    ”rolegroupid": "",
    "roletype":0 or 1,
    "rolepriority":0,角色特权 主要用于多角色时，区分等级';暂时随便传
   }
 * @returns {Promise.<Object>}
 */
export async function copyRole(params) {
  return request('/api/role/copyrole', {
    method: 'post',
    body: JSON.stringify({
      ...params,
      roletype: 1,
      rolepriority: 0
    })
  });
}

/**
 * 删除角色
 * @param roleid
 * @returns {Promise.<Object>}
 */
export async function delRole(roleid) {
  return request('/api/role/deletedrole', {
    method: 'post',
    body: JSON.stringify({ roleids: roleid })
  });
}

/**
 * 查询角色下的
 * @param params
 * {
     "roleid":"",
     "entityid":""
   }
 * @returns {Promise.<Object>}
 */
export async function queryRoleRule(params) {
  return request('/api/rule/queryroleruleinfo', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
/**
 * 设置角色在实体下的数据权限规则
 * @param params
 * {
    "roleid": "",
    "RuleName":"我创建的规则",
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "RuleItems":[{
        "itemname":"规则1",
        "fieldid":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
        "Operate":"ilike",//操作符
        "RuleData":"{\"dataval\":"123123",\"datatype\":0}",//datatype 0原生字段 1为关联实体名字查询
        "ruletype":1,
        "usetype":0,//0 实体 1 用户
        "Relation":{
            "userid":0,//上面usetype=0 则为0 其他则为用户id
            "rolesub":1,//现在先写1
            "paramindex":1
        }
        }],
    "RuleSet":{
        "ruleset":"",
        "userid":0,//上面usetype=0 则为0 其他则为用户id
        "ruleformat":""
    }
  }
 * @returns {Promise.<Object>}
 */
export async function saveRoleRule(params) {
  return request('/api/rule/saverolerule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询角色下的用户
 * @param params
 * {
    "deptid":"",
    "rolelid":"",
    "username":"",
    "pageindex":1,
    "pagesize":10
   }
 * @returns {Promise.<Object>}
 */
export async function queryRoleUsers(params) {
  return request('/api/role/queryroleuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 从角色列表移除用户
 * @param params
 * {
    "userids":"1,2",
    "roleid":""
   }
 * @returns {Promise.<Object>}
 */
export async function delRoleUsers(params) {
  return request('/api/role/deleteroleuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
