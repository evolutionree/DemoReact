import request from '../utils/request';

// {
//   reportrelationname: '',
//   reportremark: '',
// }
export async function addreportrelation(params) {
  return request('api/ReportRelation/addreportrelation', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function getreportrelation(params) {
  return request('api/ReportRelation/getreportrelation', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function getreportreldetail(params) {
  return request('api/ReportRelation/getreportreldetail', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
