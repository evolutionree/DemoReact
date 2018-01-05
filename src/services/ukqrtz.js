import request from '../utils/request';


export async function listTriggers(params) {
  return request('/api/qrtz/listtrigger', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
export async function addTrigger(params) {
  return request('/api/qrtz/add', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function getTriggerDetail(params) {
  return request('/api/qrtz/detail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function updateTrigger(params) {
  return request('/api/qrtz/update', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function changeTriggerStatus(params) {
  return request('/api/qrtz/status', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

export async function listTriggerInstances(params) {
  return request('/api/qrtz/instances', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
