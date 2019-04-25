import request from '../utils/request';

export async function getvertionmsglist(params) {
  return request('/api/notify/vertionmsglist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
