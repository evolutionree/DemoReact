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
 * 查询系统支持的语言环境
 * @returns {Promise.<Array>}
 */
export async function querylanglist() {
  return request('/api/MoreLanguage/morelanglist', {
    method: 'post',
    body: JSON.stringify({})
  });
}

/**
 * 用户登出
 * @returns {Promise.<Array>}
 */
export async function loginout(params) {
  return request('api/account/loginout', {
    method: 'post',
    body: JSON.stringify(params)
  });
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

export async function setUser(params) {
  return request('/api/account/setiscrm', {
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
      recStatus: 1,
      iscrmuser: -1
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

/**
 * 通讯录
 * @param params
 * { type: 0|1, userid: xx, pagesize, pageindex, searchkey } // 0最近联系人 1星标联系人
 * @returns {Promise}
 */
export async function queryContacts(params) {
  const type = params.type;
  delete params.type;
  if (type === 0) {
    return request('/api/contact/getrecentcall', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  } else {
    return request('/api/contact/getflaglinkman', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}

/**
 * 标记星标联系人
 * @param params
 * { flag, userid }
 * @returns {Promise.<Object>}
 */
export async function flagContact(params) {
  return request('/api/contact/flaglinkman', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 密码失效
 * @param params
 * [userid1, userid2]
 * @returns {Promise.<Object>}
 */
export async function passwordvalid(params) {
  return request('/api/account/passwordvalid', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 注销设备
 * @param params
 * [{userid: 1, ForceType: 0 }]
 * @returns {Promise.<Object>}
 */
export async function forcelogout(params) {
  return request('/api/account/forcelogout', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询部门及用户
 * @param params
 * DeptId
 * @returns {Promise.<Object>}
 */
export async function getlistsub(DeptId) {
  return request('/api/Department/listsub', {
    method: 'post',
    body: JSON.stringify({ DeptId })
  });
}

/**
 * 查询所有用户
 * @param params
 * searchkey
 * @returns {Promise.<Object>}
 */
export async function getuserlist(searchkey) {
  return request('/api/chat/userlist', {
    method: 'post',
    body: JSON.stringify({ searchkey })
  });
}

/**
 * 查询最近聊天
 * @returns {Promise.<Object>}
 */
export async function getrecentchat() {
  return request('api/chat/recentchat', {
    method: 'post',
    body: JSON.stringify({})
  });
}


/**
 * 查询个人/群组 聊天记录
 * {groupid: '00000000-0000-0000-0000-000000000000',friendid: '', ishistory: 0, recversion: 0}
 * @returns {Promise.<Object>}
 */
export async function getchatlist(params) {
  return request('api/chat/list', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取用户信息
 * {UserId:111}
 * @returns {Promise.<Object>}
 */
export async function getuserinfo(UserId) {
  return request('api/account/getuserinfo', {
    method: 'post',
    body: JSON.stringify({ UserId })
  });
}

/**
 * 查询群组 成员
 * {groupid: ''}
 * @returns {Promise.<Object>}
 */
export async function getmembers(groupid) {
  return request('api/chat/getmembers', {
    method: 'post',
    body: JSON.stringify({ groupid })
  });
}

/**
 * 查询所有群组列表
 * @returns {Promise.<Object>}
 */
export async function getgrouplist() {
  return request('api/chat/grouplist', {
    method: 'post',
    body: JSON.stringify({ GroupType: 1 })
  });
}

/**
 * 新增群组
 * {GroupName:"xxx",GroupType:1,GroupIcon:"",MemberIds:[1,2,3],DeptIds:["xxxxx","yyyyy"]}
 * @returns {Promise.<Object>}
 */
export async function addgroup(params) {
  return request('api/chat/addgroup', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新群组
 * {GroupId:"xx",MemberIds:[1,2,3,4],DeptIds:["xxxx","yyyy"]， GroupName： }
 * @returns {Promise.<Object>}
 */
export async function updategroup(params) {
  return request('api/chat/updatemembers', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新群组名称
 * {GroupId:"xxxx",GroupName:"xxxx"}
 * @returns {Promise.<Object>}
 */
export async function updategroupName(params) {
  return request('api/chat/updategroup', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 查询暂存列表
 * {
 "cacheid" : “fsdfasdfasfdsadfsafsa” //不传 cacheid ,则取所有的暂存列表
}
 * @returns {Promise.<Object>}
 */
export async function gettemporarylist(params) {
  return request('api/dynamicentity/gettemporarylist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 删除暂存列表
 * {
 "cacheid" : “fsdfasdfasfdsadfsafsa”
}
 * @returns {Promise.<Object>}
 */
export async function deletetemporarylist(CacheIds) {
  return request('api/dynamicentity/deletetemporarylist', {
    method: 'post',
    body: JSON.stringify({ CacheIds })
  });
}

/**
 * 获取用户登录信息
 * {
 "UserId" : “fsdfasdfasfdsadfsafsa”
}
 * @returns {Promise.<Object>}
 */
export async function getLoginInfoList(UserId) {
  return request('api/SystemStatistic/userlogininfo', {
    method: 'post',
    body: JSON.stringify({ UserId })
  });
}

/**
 * 获取用户登录信息
 * [
  {
    UserId:1,
    ForceType:3,
    DeviceId:'xxxxxx'
  }
]
 * @returns {Promise.<Object>}
 */
export async function forceDeviceLogout(params) {
  return request('api/account/forcelogout', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
