import request from '../../utils/request';

export async function getpgcodelist(params) {
  return request('api/entitypro/getpgcodelist', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function getpgcodedetail(params) {
  return request('api/entitypro/getpgcodedetail', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
