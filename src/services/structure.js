import * as _ from 'lodash';
import request from '../utils/request';
import { encryptPassword } from '../services/authentication';

/**
 * 查询用户列表
 * @param params
 * @returns {Promise.<Object>}
 */
let lastParams = null;
let lastRequest = { timestamp: 0, promise: null };
const life = 1000; // 缓存1秒
export async function queryUsers(params) {
  if (_.isEqual(params, lastParams) && (+new Date() - lastRequest.timestamp) < life && lastRequest.promise) {
    return lastRequest.promise;
  }
  const recStatus = +params.recStatus;
  const requestPromise = request('/api/account/userpowerlist', {
    method: 'post',
    body: JSON.stringify({
      ...params,
      recStatus
    })
  });
  lastParams = _.cloneDeep(params);
  lastRequest = {
    timestamp: +new Date(),
    promise: requestPromise
  };
  return requestPromise;
}

/**
 * 重置密码
 * @param userid
 * @returns {Promise.<Object>}
 */
export async function revertPassword(userid) {
  return request('/api/account/reconvertpwd', {
    method: 'post',
    body: JSON.stringify({ userid })
  });
}
export async function batchhRevertPassword(userids, newpassword) {
  return encryptPassword(newpassword).then(result => {
    return request('/api/account/reconvertpwd', {
      method: 'post',
      body: JSON.stringify({ userid: userids, pwd: result, encrypttype: 1 })
    });
  });
}

/**
 * 设为领导
 * @param params
 * { userid, isleader }
 * @returns {Promise.<Object>}
 */
export async function setLeader(params) {
  return request('/api/account/setleader', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 注册用户
 * @param params
 * {
    "AccountName":"10888008001",
    "AccountPwd":"999999",
    "UserName":"系统管理员",
    "AccessType":"00",
    "UserIcon":"ICON",
    "UserPhone":"10000000000",
    "UserJob":"最高级管理员",
    "DeptId":"7f74192d-b937-403f-ac2a-8be34714278b"
  }
 * @returns {Promise.<Object>}
 */
// export async function registerUser(params) {
//   return request('/api/account/regist', {
//     method: 'post',
//     body: JSON.stringify(params)
//   });
// }

/**
 * 编辑用户信息
 * @param params
 * {
    "AccountId":1,
    "AccountName":"10888008001",
    "UserName":"系统管理员",
    "AccessType":"01",
    "UserIcon":"ICON",
    "UserPhone":"10000000000",
    "UserJob":"最高级管理员",
    "DeptId":"7f74192d-b937-403f-ac2a-8be34714278b"
  }
 * @returns {Promise.<Object>}
 */
export async function updateUser(params) {
  return request('/api/account/edit', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取用户信息
 * @returns {Promise.<Object>}
 */
export async function queryUserInfo() {
  return request('/api/account/userinfo', {
    method: 'post'
  });
}

/**
 * 获取部门信息
 * @param raw true数组，false树形
 * @param status 0 全部 1启用的
 * @returns {Promise<Promise<R>|Promise<R2|R1>|Promise.<TResult>>}
 */
export async function queryDepartmentData(option) {
  let status = 1;
  if (option && option.status === 0) status = 0;
  const params = {
    DeptId: '7f74192d-b937-403f-ac2a-8be34714278b',
    Direction: 1,
    status
  };
  return request('/api/basicdata/deptpower', {
    method: 'post',
    body: JSON.stringify(params)
  }).then(result => {
    if (status === 1) {
      result.data = result.data.filter(item => item.recstatus === 1);
    }
    return (option && option.raw) ? result : Promise.resolve({
      data: transformDepartmentData(result.data)
    });
  });
}
function transformDepartmentData(data) {
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes, parent) {
    nodes.forEach((node, index) => {
      // node.path = parent ? (parent.path + '.' + node.deptname) : node.deptname;
      node.path = parent ? [...parent.path, node.deptname] : [node.deptname];
      const id = node.deptid;
      const children = data.filter(item => item.ancestor === id);
      nodes[index].children = children;
      loopChildren(children, node);
    });
  }
}

/**
 * 创建部门
 * @param params
 * {
    "PDeptId":"839f6217-d847-4dae-b230-c9cd8229cc1e",
    "DeptName":"金牌代理团队",
    "OgLevel":5
  }
 * @returns {Promise.<Object>}
 */
export async function createDepartment(params) {
  return request('/api/department/add', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑团队
 * @param params
 * {
    "DeptId":"cd775967-2faa-4675-a8ca-34a9a77fd875",
    "DeptName":"金牌A代理团队",
    "OgLevel":3 // 团队级别 0:顶级(如集团), 1: 分公司, 2: 事业群, 3事业部 4分管区域 5部门
  }
 * @returns {Promise.<Object>}
 */
export async function updateDepartment(params) {
  return request('/api/department/edit', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 部门排序
 * @param params
 * public string ChangeDeptId { get; set; }
  public string DeptId { get; set; }
 * @returns {Promise.<Object>}
 */
export async function orderDepartment(params) {
  return request('/api/account/orderbydept', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

const cached = {
  allUsers: {
    lastFetchTS: null,
    expired: 30000,
    data: null
  }
};
export async function getAllUsersInCached() {
  const { allUsers } = cached;
  const { lastFetchTS, expired, data } = allUsers;
  const shouldFetch = !lastFetchTS || (new Date().getTime() - lastFetchTS > expired) || !data;
  if (!shouldFetch) {
    return Promise.resolve({ data });
  } else {
    const params = {
      userName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      userPhone: '',
      pageSize: 9999,
      pageIndex: 1,
      recStatus: 1
    };
    return queryUsers(params);
  }
}

/**
 * 分配角色
 * @param params
 * {
    "userids":1,
    "roleids":"23be37e3-1975-4c41-b5a9-bf699337b1ea,1df3576b-ec5e-46b7-865a-cdaed29ba495"
  }
 * @returns {Promise.<Object>}
 */
export async function assignRoleUser(params) {
  return request('api/role/assigneroleuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 用户状态 启用停用
 * @param params
 * {
    "userid":22,
    "status":1
  }
 * @returns {Promise.<Object>}
 */
export async function updateUserStatus(params) {
  return request('/api/account/updateaccstatus', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 部门 启用停用
 * @param params
 * {
    "deptid":'xxx',
    "recstatus":1
  }
 * @returns {Promise.<Object>}
 */
export async function updateDeptStatus(params) {
  return request('/api/account/disableddept', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 更改部门
 * @param params
 * {
    "userid":22,
    "deptid":1
  }
 * @returns {Promise.<Object>}
 */
export async function updateUserDept(params) {
  return request('/api/account/updateaccdept', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
