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
