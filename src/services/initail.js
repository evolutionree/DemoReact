import { message } from 'antd';
import request from '../utils/request';
import { queryEntityDetail, queryTypes, queryMenus, queryListFilter, getlistschemebyentity } from './entity';
import { getGeneralListProtocol, getFunctionbutton } from './entcomm';

const handleMessage = (msg, type = 'error') => {
  if (['error', 'success', 'info', 'warn', 'warning', 'loading'].includes(type)) {
    setTimeout(() => message[type](msg), 0);
    if (type === 'error') console.error(msg);
  }
  return { data: msg };
};

export const isObject = data => !!(data && typeof data === 'object');

// entcommList init data
export async function queryInitail(params) {
  const { entityId } = params;
  return Promise.all([
    queryEntityDetail(entityId).then(res => res.data).catch(e => handleMessage(e.message)),
    queryTypes(params).then(res => res.data).catch(e => handleMessage(e.message)),
    getGeneralListProtocol({ typeId: entityId }).then(res => res.data).catch(e => handleMessage(e.message)),
    queryMenus(entityId).then(res => res.data).catch(e => handleMessage(e.message)),
    queryListFilter(entityId).then(res => res.data).catch(e => handleMessage(e.message)),
    getlistschemebyentity(entityId).then(res => res.data).catch(e => handleMessage(e.message)),
    getFunctionbutton({ entityid: entityId, RecIds: [] }).then(res => res.data).catch(e => handleMessage(e.message))
  ]).then(data => ({ data }));
}

// entcommApplication init data
export async function querySimpleInitail(params) {
  const { entityId } = params;
  return Promise.all([
    queryEntityDetail(entityId).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    queryTypes(params).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    getGeneralListProtocol({ typeId: entityId }).then(res => isObject(res.data) ? res.data : []).catch(e => handleMessage(e.message)),
    queryMenus(entityId).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    queryListFilter(entityId).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    getFunctionbutton({ entityid: entityId, RecIds: [] }).then(res => isObject(res.data) ? res.data : []).catch(e => handleMessage(e.message))
  ]).then(data => ({ data }));
}

// entcommDynamic init data
export async function queryDynamicInitail(params) {
  const { entityId } = params;
  return Promise.all([
    queryEntityDetail(entityId).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    queryTypes(params).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message)),
    getDynamicListProtocol({ typeId: entityId }).then(res => isObject(res.data) ? res.data : []).catch(e => handleMessage(e.message)),
    queryListFilter(entityId).then(res => isObject(res.data) ? res.data : {}).catch(e => handleMessage(e.message))
  ]).then(data => ({ data }));
}