import request from '../../utils/request';

export async function queryWebApiList(params) {
  return request('api/UKWebApi/listapi', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function SaveApiInfo(params) {
  return request('api/UKWebApi/saveapi', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
