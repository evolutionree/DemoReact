import request from '../utils/request';

/**
 * 查询套打模板列表
 * @param params
 * { entityid, recstate } // recstate: 0=已停用，1=启用，-1=全部
 * @returns {Promise.<Object>}
 */
export async function queryPrintTemplates(params) {
  return request('/api/PrintForm/gettemplatelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取某条数据拥有的打印模板
 * @param params
 * { entityid, RecId }
 * @returns {Promise.<Object>}
 */
export async function queryRecPrintTemplates(params) {
  return request('/api/PrintForm/getrectemplatelist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 新增套打模板
 * @param params
 * {
 *  DataSourceFunc, // 数据源处理接口:数据库函数名或者内部服务接口的命名空间
 *  DataSourceType, // 数据源类型：0=实体Detail接口、1=数据库函数、2=内部服务接口
 *  Description, // 模板备注
 *  EntityId, // 关联的实体id
 *  ExtJs, // 数据源扩展处理JS
 *  FileId, // 模板文件ID
 *  RuleDesc, // 适用范围说明
 *  RuleId, // 适用范围RuleId
 *  TemplateName, // 模板名称
 *  TemplateType // 模板类型：0=Excel、1=word
 * }
 * @returns {Promise.<Object>}
 */
export async function addPrintTemplates(params) {
  return request('/api/PrintForm/inserttemplate', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新套打模板
 * @param params
 * {
 *  DataSourceFunc, // 数据源处理接口:数据库函数名或者内部服务接口的命名空间
 *  DataSourceType, // 数据源类型：0=实体Detail接口、1=数据库函数、2=内部服务接口
 *  Description, // 模板备注
 *  RecId,
 *  ExtJs, // 数据源扩展处理JS
 *  FileId, // 模板文件ID
 *  RuleDesc, // 适用范围说明
 *  RuleId, // 适用范围RuleId
 *  TemplateName, // 模板名称
 *  TemplateType // 模板类型：0=Excel、1=word
 * }
 * @returns {Promise.<Object>}
 */
export async function updatePrintTemplates(params) {
  return request('/api/PrintForm/updatetemplate', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 停用/启用套打模板
 * @param params
 * { RecIds, RecState } // recstate: 0=已停用，1=启用
 * @returns {Promise.<Object>}
 */
export async function togglePrintTemplatesStatus(params) {
  return request('/api/PrintForm/settemplatestatus', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 删除套打模板
 * @param params
 * { RecIds } // recstate: 0=已停用，1=启用
 * @returns {Promise.<Object>}
 */
export async function deletePrintTemplates(params) {
  return request('/api/PrintForm/deletetemplate', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 生成实体pdf文件
 * @param params
 * { EntityId, RecId, TemplateId }
 * @returns {Promise.<Object>}
 */
export async function printEntity(params) {
  return request('/api/PrintForm/printentity', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 配置js保存接口
 * @param params
 * { recid, ucode }
 */
export async function saveConfigJS(params) {
  return request('api/printform/updateucode', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 校验ucode按钮权限接口
 * @param params
 * {}
 */
export async function haspaaspermission(params) {
  return request('api/account/haspaaspermission', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

