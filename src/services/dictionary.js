import request from '../utils/request';

/**
 * 查询字典列表
 * @returns {Promise.<Object>}
 */
export async function queryDicTypes() {
  return request('/api/datasource/queryfieldopt', {
    method: 'post'
  });
}

/**
 * 保存字典分类
 * @param params
 * {
    dictypeid: 'asdf',
    dictypename: 'xxx'
  }
 * @returns {Promise.<Object>}
 */
export async function saveDicType(params) {
  return request('/api/datasource/savefielddictype', {
    method: 'post',
    body: JSON.stringify({ dictypeid: '', ...params, dicremark: '' })
  });
}

/**
 * 删除字典分类
 * @param dictypeid
 * @returns {Promise.<Object>}
 */
export async function delDicType(dictypeid) {
  return request('/api/datasource/disableddictype', {
    method: 'post',
    body: JSON.stringify({ dictypeid })
  });
}

/**
 * 查询字典选项值
 * @param dictypeid
 * @param showDeleted
 * @returns {Promise.<Object>}
 */
export async function queryDicOptions(dictypeid, showDeleted = false) {
  return request('/api/datasource/queryfielddicvalue', {
    method: 'post',
    body: JSON.stringify({ dictypeid })
  }).then(result => {
    if (!showDeleted) {
      return {
        data: { fielddictypevalue: result.data.fielddictypevalue.filter(item => item.recstatus !== 0) }
      };
    }
    return result;
  });
}

/**
 * 保存字典选项值
 * @param params
 * {
    "dicid":"",
    "dictypeid":"",

    "datavalue":""
  }
 * @returns {Promise.<Object>}
 */
export async function saveDicOption(params) {
  return request('/api/datasource/savefieldoptval', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除字典选项
 * @param dicid
 * @returns {Promise.<Object>}
 */
export async function delDicOption(dicid) {
  return request('/api/datasource/deletefieldoptval', {
    method: 'post',
    body: JSON.stringify({ dicid })
  });
}

/**
 * 排序字典选项值
 * @param params
 *  [{ "dicid":"" },{ "dicid":"" }]
 * @returns {Promise.<Object>}
 */
export async function orderDicOptions(params) {
  return request('/api/datasource/orderbyfieldoptval', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
