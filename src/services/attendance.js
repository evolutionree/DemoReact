import request from '../utils/request';

/**
 * 获取考勤列表
 * @param params
 * {
    "ListType":0,    0是我的打卡，1是除了我下属打卡
    "SearchName":"",   --用户名搜索
    "PageIndex":1,
    "PageSize":10
  }
 * @returns {Promise.<Object>}
 */
export async function queryAttendanceList(params) {
  return request('/api/attendance/signlist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取考勤组设置列表
 * @param params
 * {
    "deptId":'',    部门id
    "userName":"",   --用户名搜索
    "PageIndex":1,
    "PageSize":10
  }
 * @returns {Promise.<Object>}
 */
export async function querygroupuser(params) {
  return request('/api/attendance/querygroupuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 班组人员绑定
 * @param params
 * {
    "DeptSelect":[{id, name}],    部门id
    "UserSelect":[{id, name}],   --用户名搜索
    "ScheduleGroup":{id, name},
  }
 * @returns {Promise.<Object>}
 */
export async function addgroupuser(params) {
  return request('/api/attendance/addgroupuser', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
