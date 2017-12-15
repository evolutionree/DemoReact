/**
 * Created by 0291 on 2017/12/13.
 */

import request from '../utils/request';
/**
 *获取恢复邮件列表
 * @returns {Promise.<Object>}
 */
export async function getreconvertmaillst(params) {
  return request('api/Mail/getreconvertmaillst', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *恢复邮件
 * MailIds
 * @returns {Promise.<Object>}
 */
export async function reconvermail(params) {
  return request('api/mail/reconvermail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
