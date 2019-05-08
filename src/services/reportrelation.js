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

// {
//   "ReportRelationIds":[
//    "b0df3992-100a-4963-9c1d-0ff370b447e6"
//    ],
//    "recstatus":0
//  }
export async function deletereportrelation(params) {
  return request('api/ReportRelation/deletereportrelation', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

// {
//   "ReportRelationIds":[
//    "b0df3992-100a-4963-9c1d-0ff370b447e6"
//    ],
//    "recstatus":0
//  }
export async function deletereportreldetail(params) {
  return request('api/ReportRelation/deletereportreldetail', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

