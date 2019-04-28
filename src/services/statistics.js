import request from '../utils/request';

export async function getstatistics(params) {
  return request('/api/StatisticsSetting/getstatistics', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// {
//   "AnaFuncName":"asd",
//   "MoreFlag":1,
//   "CountFunc":"sads",
//   "MoreFunc":"asdsad",
//   "EntityId":"9bab9d63-c1bc-44fe-86a7-bf7099672fc0",
//   "AllowInto":0,
//   "AnaFuncName_Lang":"{}"
//  }
export async function addstatistics(params) {
  return request('/api/StatisticsSetting/addstatistics', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// {
//   "anafuncid":"14f659f6-1050-4927-85f5-81d85938df61",
//   "AnaFuncName":"asd",
//   "MoreFlag":1,
//   "CountFunc":"sads",
//   "MoreFunc":"asdsad",
//   "EntityId":"9bab9d63-c1bc-44fe-86a7-bf7099672fc0",
//   "AllowInto":0,
//   "AnaFuncName_Lang":"{}"
//  }
export async function updatestatistics(params) {
  return request('/api/StatisticsSetting/updatestatistics', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// {
//   "AnaFuncIds":["14f659f6-1050-4927-85f5-81d85938df61"]
//  }
export async function deletestatistics(params) {
  return request('/api/StatisticsSetting/deletestatistics', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// {
//   "AnaFuncIds":["14f659f6-1050-4927-85f5-81d85938df61"]，
//  "recstatus":
//  }
export async function disabledstatistics(params) {
  return request('/api/StatisticsSetting/disabledstatistics', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


// ==============================

// {
//   "AnaFuncName":"{NOW}当月统计"
//  }
export async function getstatisticsdetaildata(params) {
  return request('/api/StatisticsSetting/getstatisticsdetaildata', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

// {
//   "AnaFuncName":""
//  }
export async function getstatisticsdata(params) {
  return request('/api/StatisticsSetting/getstatisticsdata', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
