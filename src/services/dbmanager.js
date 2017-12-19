import request from '../utils/request';

/**
 * 添加产品系列
 * @param params
 * {
    "SeriesName": "sub",
    "TopSeriesId": "xxx"
  }
 * @returns {Promise.<Object>}
 */
export async function listDirs(params) {
  return request('/api/dbmanage/listdir', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
export async function listObjects(params) {
  return request('/api/dbmanage/listobjects', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function saveobjectforbase(params) {
  return request('/api/dbmanage/saveobjectforbase', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/*
 {"ObjId":"c2b59ead-6b63-4e76-a92f-82fc36b1f799","StructOrData":1}
 1=初始化结构，2=初始化数据
 */
export async function getobjectsql(params) {
  return request('/api/dbmanage/getobjectsql', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function saveobjectsql(params) {
  return request('/api/dbmanage/saveobjectsql', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
