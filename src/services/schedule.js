import request from '../utils/request';

/**
 * 获取消息
 *
 1001	销售记录
 1002	工作报告
 1004	任务提醒
 1005	公告通知
 1006	审批通知
 1007	实时动态
 1008	实时聊天
 * @param {"Direction":0,"MsgGroupIds":[1001],"PageSize":20,"RecVersion":0}
 * @returns {Promise.<Object>}
 */
export async function getvertionmsglist(params) {
  return request('/api/notify/vertionmsglist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
