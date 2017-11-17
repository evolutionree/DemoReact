import request from '../utils/request';

/**
 * 获取导入任务列表
 * @param params
  * {
    "taskIds":[ "6ce55dbd-6cd7-4d60-9b9e-e8ae9c4c102a"]
  }
 * @returns {Promise.<Object>}
 */
export async function getTaskList(params) {
    return request('/api/excel/tasklist', {
        method: 'post',
        body: JSON.stringify(params)
    });
}

/**
 * 启动导入任务
 * @param params
 * {
    "taskid": "6ce55dbd-6cd7-4d60-9b9e-e8ae9c4c102a"
 * }
 * @returns {Promise.<Object>}
 */
export async function taskStart(params) {
    return request('/api/excel/taskstart', {
        method: 'post',
        body: JSON.stringify(params)
    });
}
