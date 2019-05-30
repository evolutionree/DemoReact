import request from '../../utils/request';

export async function getucodelist(params) {
  return request('api/entitypro/getucodelist', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function getucodedetail(params) {
  return request('api/entitypro/getucodedetail', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
