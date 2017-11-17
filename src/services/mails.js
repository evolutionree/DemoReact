import request from '../utils/request';

/**
 * 获取邮箱目录树
 * @param params
 * { searchuserid }
 * @returns {Promise.<Object>}
 */
export async function queryMailCatalog(params) {
  return request('api/mailset/catalogtree', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取邮件所有联系人
 * @returns {Promise.<Object>}
 */
export async function queryMailContacts() {
  return request('/api/mail/getcontactbykeyword', {
    method: 'post',
    body: JSON.stringify({ keyword: '', count: 9999 })
  });
}


/**
 * 获取部门下属邮箱目录树
 * @param params
 * { treeid }
 * @returns {Promise.<Object>}
 */
export async function queryDeptMailCatalog(params) {
  return request('api/mailset/getorgandstafftreebylevel', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 新增目录文件夹
 * @param params
 * { pid, recname }
 * @returns {Promise.<Object>}
 */
export async function saveMailCatalog(params) {
  return request('api/mailset/insertpersonalcatalog', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑目录文件夹
 * @param params
 * { recid, recname }
 * @returns {Promise.<Object>}
 */
export async function updateMailCatalog(params) {
  return request('api/mailset/updatepersonalcatalog', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 排序目录文件夹
 * @param params
 * { recid, dotype } // dotype 0下移 1上移
 * @returns {Promise.<Object>}
 */
export async function orderMailCatalog(params) {
  return request('api/mailset/toordercatalog', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除目录文件夹
 * @param recid
 * @returns {Promise.<Object>}
 */
export async function delMailCatalog(recid) {
  return request('api/mailset/delpersonalcatalog', {
    method: 'post',
    body: JSON.stringify({ recid })
  });
}

/**
 * 获取邮件列表
 * @param params
 * { advancesearch, catalog, fetchuserid, pageIndex, pageSize, searchkey }
 * @returns {Promise.<Object>}
 */
export async function queryMailList(params) {
  return request('api/mail/listmail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除邮件
 * @param params
 * { IsTruncate, mailids, recstatus }
 * @returns {Promise.<Object>}
 */
export async function delMails(params) {
  return request('api/mail/deletemail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除邮件
 * @param mailid
 * @returns {Promise.<Object>}
 */
export async function queryMailDetail(mailid) {
  return request('api/mail/maildetail', {
    method: 'post',
    body: JSON.stringify({ mailid })
  });
}

/**
 * 移动邮件
 * @param params
 * { mailids, catalogid }
 * @returns {Promise.<Object>}
 */
export async function moveMails(params) {
  return request('api/mail/movemail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 标记邮件
 * @param params
 * { mailids, mark } // mark: 0取消星标 1星标 2设置未读 3设置已读
 * @returns {Promise.<Object>}
 */
export async function markMails(params) {
  const { mailids, mark } = params;
  if (mark === 0 || mark === 1) {
    return request('api/mail/tagmail', {
      method: 'post',
      body: JSON.stringify({ mailids, actiontype: mark })
    });
  } else if (mark === 2 || mark === 3) {
    return request('api/mail/readmail', {
      method: 'post',
      body: JSON.stringify({ mailids, recstatus: mark === 2 ? 0 : 1 })
    });
  }
  return Promise.reject('参数错误');
}

/**
 * 获取用户页面布局
 * @returns {Promise.<Object>}
 */
export async function queryMailLayout() {
  return request('api/mailset/getwebmaillayout', {
    method: 'post'
  });
}

/**
 * 保存用户页面布局
 * @param params
 * { bottomprecent, leftprecent, rightprecent, showbottom, showright }
 * @returns {Promise.<Object>}
 */
export async function saveMailLayout(params) {
  return request('api/mailset/savewebmaillayout', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取我的邮箱列表
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function queryMailBoxList() {
  return request('api/mailset/getmailboxlist', {
    method: 'post',
    body: JSON.stringify({})
  });
}


/**
 * 获取客户联系人
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function queryCustomerContact() {
  return request('api/mail/getcustomercontact', {
    method: 'post',
    body: JSON.stringify({ PageIndex: 1, pageSize: 999999 })
  });
}

/**
 * 获取企业内部通讯录
 * @param params
 * { treeid }  //部门id
 * @returns {Promise.<Object>}
 */
export async function queryInnerContact(params) {
  return request('api/mail/getinnercontact', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 发送邮箱
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function sendemail(params) {
  return request('api/Mail/sendemail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

