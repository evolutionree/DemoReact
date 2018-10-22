import request from '../utils/request';

/**
 * 查询列表
 * @param params
 *  {
    "datasourcename":"",
    "recstatus":1
    "pageindex":1,
    "pagesize":10
  }
 * @returns {Object}
 */
export async function queryList(params) {
  return request('/api/datasource/querydatasource', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存
 * @param params
 * {
    "datasourcename":"ceshi测试1",
    "srctype":0,
    "entityid":"",
    "srcmark":"asdasd",
    "RecStatus":0
  }
 * @returns {Object}
 */
export async function save(params) {
  return request('/api/datasource/insertdatasource', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新
 * @param params
 * {
    "datasourceid":"3bf9acdb-6b87-479a-bb14-6e69b4f79490",
    "datasourcename":"fdgd1111fgf",
    "srctype":0,
    "srcmark":"asdasd",
    "RecStatus":0
  }
 * @returns {Object}
 */
export async function update(params) {
  return request('/api/datasource/updatedatasource', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除数据源
 * @param datasourceid
 */
export async function del(datasourceid) {
  return request('/api/datasource/deletedatasource', {
    method: 'post',
    body: JSON.stringify({ DataSrcId: datasourceid })
  });
}

/**
 * 保存详情
 * @param params
 * {
    "datasourceid":"3bf9acdb-6b87-479a-bb14-6e69b4f79490",
    "rulesql":"select 1 from asdasd",
    "viewstyleid":1,
    "colnames": '',
    "fonts":"[11,12,13]",
    "colors":"[1111,1111,1111]"
  }
 * @returns {Object}
 */
export async function saveDetail(params) {
  return request('/api/datasource/insertdatasourcedetail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新详情
 * @param params
 * {
    "DataConfigId":"5800e6c0-d9ec-4196-8988-3af86abc888f",
    "rulesql":"select 1 from asdasd",
    "viewstyleid":1,
    "colnames":"[\"a\",\"b\",\"c\"]",
    "fonts":"[11,12,13]",
    "colors":"[1111,1111,1111]"
  }
 * @returns {Object}
 */
export async function updateDetail(params) {
  return request('/api/datasource/updatedatasourcedetail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询详情
 * @param dataSourceId
 * @returns {Promise.<object>}
 */
export async function queryDetail(dataSourceId) {
  return request('/api/datasource/querydatasourcedetail', {
    method: 'post',
    body: JSON.stringify({ dataSourceId })
  });
}

/**
 * 数据源控件，查数据源数据列表
 * @param params
 * {"sourceid":"45197360-d054-49d6-9f3c-5de10f0cca45","keyword":"","pageindex":1,"pagesize":20}
 * @returns {Promise.<Object>}
 */
export async function queryDataSourceData(params) {
  return request('/api/datasource/querydynamicdatasrc', {
    method: 'post',
    body: JSON.stringify(params)
  });
}



/**
 * 保存详情
 * @param params
 * {
    "EntityId":"ac051b46-7a20-4848-9072-3b108f1de9b0",
    "CheckName":"客户名称",
    "Exact":0,//模糊查询
    "searchdata": {}
  }
 * @returns {Object}
 */
export async function searchcustomerrepeat(params) {
  return request('/api/dynamicentity/searchrepeat', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 查询数据源关联实体ID
 * @param params
 * {
    "EntityId":"ac051b46-7a20-4848-9072-3b108f1de9b0",
    "CheckName":"客户名称",
    "Exact":0,//模糊查询
    "searchdata": {}
  }
 * @returns {Object}
 */
export async function queryDatasourceInfo(datasourceid) {
  return request('/api/datasource/getfieldrelation', {
    method: 'post',
    body: JSON.stringify({ datasourceid })
  });
}
