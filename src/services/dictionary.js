import request from '../utils/request';

/**
 * 查询字典列表
 * @returns {Promise.<Object>}
 */
export async function queryDicTypes() {
  return request('/api/datasource/queryfieldopt', {
    method: 'post',
    body: JSON.stringify({ })
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
    body: JSON.stringify({ ...params, dicremark: '' })
  });
}

/**
 * 查询字典分类详情
 * @param params
 * {
    dictypeid: 'asdf',
  }
 * @returns {Promise.<Object>}
 */
export async function dictypedetail(params) {
  return request('api/DataSource/dictypedetail', {
    method: 'post',
    body: JSON.stringify(params)
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


/**
 * 获取字典类型配置接口
 * @param params
 *  "dictypeid":"" //-1查全局
 * @returns {Promise.<Object>}
 */
export async function getfieldconfig(dictypeid) {
  return request('api/DataSource/getfieldconfig', {
    method: 'post',
    body: JSON.stringify({ dictypeid })
  });
}










/**
 * 获取字典值列表
 * @param params
 *  "dictypeid":""
 * @returns {Promise.<Object>}
 */
export async function queryfielddicvalue(dictypeid) {
  return request('api/DataSource/queryfielddicvalue', {
    method: 'post',
    body: JSON.stringify({ dictypeid })
  });
}

/**
 * 新增字典值
 * @param params
 *  {
    "DicTypeId": "1235",
    "DataId": "1",
    "DataVal": "测试312",
    "RecOrder": 2,
    "RecStatus": 1,
    "RelateDataId": "",
    "ExtField1": 123,   // ExtField2、ExtField3、ExtField4 ...
}
 * @returns {Promise.<Object>}
 */
export async function savedictionary(params) {
  return request('/api/DataSource/savedictionary', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 字典排序
 * @param params
 * @returns {Promise.<Object>}
 */
export async function orderbydictionary(params) {
  return request('/api/DataSource/orderbydictionary', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

