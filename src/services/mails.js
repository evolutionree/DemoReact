import request from '../utils/request';

/**
 * 发起收取邮件请求
 * @returns {Promise.<Object>}
 */
export async function syncMails() {
  return request('api/mail/receiveemail', {
    method: 'post',
    body: JSON.stringify({})
  });
}

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
 * { treeid, keyword }
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
 * { recid, recname, newpid }
 * @returns {Promise.<Object>}
 */
export async function updateMailCatalog(params) {
  return request('api/mailset/movecatalog', {
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
 * 获取邮件详情
 * @param mailid
 * @returns {Promise.<Object>}
 */
export async function queryMailDetail(mailid) {
  //TODO: 2018-9-10 后端性能优化  之前一个接口获取的数据  改由两个接口分别获取
  function queryMailContent() { //获取邮件内容数据
    return request('api/mail/maildetail', {
      method: 'post',
      body: JSON.stringify({ mailid })
    });
  }

  function queryMailOtherInfo() { //获取一些发送人啊  抄送人的这些数据
    return request('api/mail/mailsubdetail', {
      method: 'post',
      body: JSON.stringify({ mailid })
    });
  }

  return Promise.all([
    queryMailContent(),
    queryMailOtherInfo()
  ]).then(([res1, res2]) => {
    return {
      data: {
        maildetail: res1.data,
        ...res2.data
      }
    };
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
      body: JSON.stringify({ mailids, isread: mark === 2 ? 0 : 1 })
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
    body: JSON.stringify({
      PageIndex: 1,
      pageSize: 9999
    })
  });
}


/**
 * 获取最近联系人
 * @param params
 * { PageIndex
  * pageSize}
 * @returns {Promise.<Object>}
 */
export async function queryRecentcontact() {
  return request('api/mail/getrecentcontact', {
    method: 'post',
    body: JSON.stringify({ PageIndex: 1, pageSize: 999999 })
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
 * 获取个性化签名列表
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function querySignature() {
  return request('api/mailset/getsignature', {
    method: 'post',
    body: JSON.stringify({})
  });
}

/**
 * 校验发送邮件白名单
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function validsendmaildata(params) {
  return request('api/mail/validsendmaildata', {
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

/**
 * 保存草稿箱
 * @param params
 * {  }
 * @returns {Promise.<Object>}
 */
export async function savedraft(params) {
  return request('api/mail/savedraft', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取往来邮件
 * @param params
 * { mailid, pageindex, pagesize, relatedMySelf, relatedSendOrReceive }
 *  relatedMySelf 0=仅查看与自己的往来邮件，1=查看与所有用户往来邮件
 *  relatedSendOrReceive 0=查看所有收到与发出的邮件，1=查看收到的邮件，2=查看发出的邮件
 * @returns {Promise.<Object>}
 */
export async function queryRelatedMails(params) {
  return request('api/mail/gettoandfromail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取往来附件
 * @param params
 * { mailid, pageindex, pagesize, relatedMySelf, relatedSendOrReceive }
 *  relatedMySelf 0=仅查看与自己的往来邮件附件，1=查看与所有用户往来邮件附件
 *  relatedSendOrReceive 0=查看所有收到与发出的邮件附件，1=查看收到的邮件附件，2=查看发出的邮件附件
 * @returns {Promise.<Object>}
 */
export async function queryRelatedAttachments(params) {
  return request('api/mail/gettoandfroatt', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取内部分发记录
 * @param params
 * { mailid, pageindex, pagesize }
 * @returns {Promise.<Object>}
 */
export async function queryMailTransferRecords(params) {
  return request('api/mail/transferrecrod', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 内部分发
 * @param params
 * { mailids, deptids, TransferUserIds }
 * @returns {Promise.<Object>}
 */
export async function distributeMails(params) {
  return request('api/mail/innertransfermail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 转移目录
 * @param params
 * { recid, newuserid }
 * @returns {Promise.<Object>}
 */
export async function transferMailCatalog(params) {
  return request('api/mailset/transfercatalog', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取内部往来人员
 * @param keyword
 * @returns {Promise.<Object>}
 */
export async function queryHistoryUsers(keyword) {
  return request('api/mail/getinnertoandfrouser', {
    method: 'post',
    body: JSON.stringify({ keyword })
  });
}

/**
 * 获取内部往来人员邮件
 * @param params
 * { fromuserid, keyword, pageindex, pagesize }
 * @returns {Promise.<Object>}
 */
export async function queryHistoryUserMails(params) {
  return request('api/mail/intoandfrolstmail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 恢复邮件
 * @param params
 * { mailids }
 * @returns {Promise.<Object>}
 */
export async function recoverMails(params) {
  return request('api/mail/reconvermail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 恢复邮件
 * @returns {Promise.<Object>}
 */
export async function validMailPwd() {
  return request('api/mail/validpwd', {
    method: 'post',
    body: JSON.stringify({})
  });
}
