import request from '../utils/request';

/**
 * 保存智能提醒
 * @param params
 *  cronstring 自定义重复提醒频次字符串 string
    endityid  实体id  string
    isrepeat  是否重复提醒  boolean 0 不重复，1重复
    recstatus 是否启用  boolean 0 不启用, 1 启用
    rectype 数据l类型 number  0 智能提醒， 1 回收机制
    remark  备注信息  string
    reminderid  提醒iid string  null 新增， 非null 编辑
    remindername  提醒名称  string
    repeattype  重复提醒频次    日 0， 周 1， 月 2 ，年 3 ，自定义 4
 * @returns {Promise.<Object>}
 */
export async function saveReminder(params) {
  return request('api/reminder/savereminder', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 保存智能提醒规则详情
 * @param params
 *  {
 *    content: '',
 *    contentparam: [],
 *    receiver: [{ itemtype, departmentfield, departmentid, userfield, userid }],
 *    receiverrange: 0, // 0 部门领导，1 全部人,
 *    reminderid: 'xxx',
 *    ruleitems: [],
 *    rulename: '',
 *    ruleset: {},
 *    title: '',
 *    typeid: ''
 *  } // 0 固定人，1表单中人，2 固定部门，3 表单中部门
 * @returns {Promise.<Object>}
 */
export async function saveReminderDetail(params) {
  return request('api/reminder/savereminderrule', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取智能提醒列表
 * @param params
 *  {
      pageindex: 1,
      pagesize: 10,
      recstatus: 1,
      rectype: 0,
      remindername: ''
    }
 * @returns {Promise.<Object>}
 */
export async function queryReminderList(params) {
  return request('api/reminder/listreminder', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取智能提醒规则详情
 * @param reminderid
 * @returns {Promise.<Object>}
 */
export async function queryReminderDetail(reminderid) {
  return request('api/reminder/getreminderrule', {
    method: 'POST',
    body: JSON.stringify({ reminderid })
  });
}

/**
 * 获取智能提醒信息
 * @param reminderid
 * @returns {Promise.<Object>}
 */
export async function queryReminderInfo(reminderid) {
  return request('api/reminder/getreminder', {
    method: 'POST',
    body: JSON.stringify({ reminderid })
  });
}

/**
 * 不再提醒
 * @param params
 * {
    "ReminderId":"8fa94404-b6c5-4b1c-bed9-dd093fc38a0a",
    "EntityRecId":"8fa94404-b6c5-4b1c-bed9-dd093fc38a0a",
    "ReminderStatus":0  //0 open 1 close
  }
 * @returns {Promise.<Object>}
 */
export async function disableReminder(params) {
  return request('api/reminder/disablereminder', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 立即提醒
 * @param reminderid
 * @returns {Promise.<Object>}
 */
export async function activateReminder(reminderid) {
  return request('api/reminder/activate', {
    method: 'POST',
    body: JSON.stringify({ remindid: reminderid })
  });
}
