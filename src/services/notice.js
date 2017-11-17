import request from '../utils/request';

/**
 * 获取公告通知列表
 * @param params
 * {
    "noticetype": 0,
    "keyword": "hand",
    "pageindex": 1,
    "noticesendstatus": -1,
    "pagesize": 20
  }
 * @returns {Promise.<Object>}
 */
export async function queryNoticeList(params) {
  return request('/api/Notice/querynotice', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取公告通知详情
 * @param noticeid
 * @returns {Promise.<Object>}
 */
export async function queryNoticeInfo(noticeid) {
  return request('/api/Notice/querynoticeinfo', {
    method: 'post',
    body: JSON.stringify({ noticeid })
  });
}

/**
 * 公告通知新增
 * @param params
 * {
    "noticetype":0,//0代表公告通知
    "noticetitle":"123123",
    "headimg":"sadsad",
    "HeadRemark":"asdasd",
    "msgcontent":"asdasd",
    "noticeurl":"12313"
  }
 * @returns {Promise.<Object>}
 */
export async function createNotice(params) {
  return request('/api/Notice/insertnotice', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新公告
 * @param params
 * {
    "noticeid":"88549ca5-67b5-46d1-9f31-72e45ddad608",
    "noticetype":1,
    "noticetitle":"1",
    "headimg":"1",
    "HeadRemark":"1",
    "msgcontent":"1",
    "noticeurl":"1"
  }
 * @returns {Promise.<Object>}
 */
export async function updateNotice(params) {
  return request('/api/Notice/updatenotice', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除公告通知
 * @param noticeids
 * @returns {Promise.<Object>}
 */
export async function delNotice(noticeids) {
  const params = {
    noticeids,
    RecStatus: 0
  };
  return request('/api/Notice/disablednotice', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 发送公告通知
 * @param params
 * {
    "noticeid":"6959c6a4-d087-466b-87d7-39a69f0496f5",
    "departmentids":"",
    "userids":"11,22,33",
    "ispopup":1
  }
 * @returns {Promise.<Object>}
 */
export async function sendNotice(params) {
  return request('/api/Notice/sendnotice', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取通知公告发送记录
 * @param params
 * {
        "noticeid": "7d4d2108-44a4-41a6-af22-06f21319158c",
        "readstatus":-1,
        "deptid":"7f74192d-b937-403f-ac2a-8be34714278b",
        "keyword":"",
        "pageindex":1,
        "pagesize":10
    }

 * @returns {Promise.<Object>}
 */
export async function queryNoticeSendRecord(params) {
  return request('/api/notice/querynoticesendrecord', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
