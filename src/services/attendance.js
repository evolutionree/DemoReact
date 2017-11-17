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
