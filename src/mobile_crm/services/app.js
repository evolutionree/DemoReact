/**
 * Created by 0291 on 2017/7/11.
 */
import request from '../utils/request';

/**
 * 查询菜单列表
 * @param params
 * @returns {Promise.<object>}
 */
export async function getentrance() {
  return request('api/dingding/getentrance', {
    method: 'post',
    body: JSON.stringify({})
  });
}

/**
 * 查询实体协议
 * @param params
 * @returns {Promise.<object>}
 */
export async function querymobfieldvisible(entityId) {
  return request('api/EntityPro/querymobfieldvisible', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 查询筛选菜单配置
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryMenus(entityId) {
  return request('/api/rule/queryrulemenu', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

export async function getListData(params) {
  return request('/api/dynamicentity/list', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 记录详情
 * @param params
 * {
 *    EntityId: '',
 *    RecId: '',
 *    NeedPower: ''
 * }
 * @returns {Promise.<Object>}
 */
export async function getEntcommDetail(params) {
  return request('/api/dynamicentity/detail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取协议
 * @param params
 * {
     TypeId: 'xxx', // entityid
     operatetype: 0 // 0新增 1编辑 2查看
  }
 * @returns {Promise.<Object>}
 */
export async function getGeneralProtocol(params) {
  return request('/api/dynamicentity/generalprotocol', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 获取跳转原生APP参数
 * @param params
 * @returns {Promise.<Object>}
 */
export async function savecachemsg(params) {
  return request('/api/dingding/savecachemsg', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
