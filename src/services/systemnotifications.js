import request from '../utils/request';

export async function getData(params) {
  return request('/api/reminder/configlist', {
    method: 'post',
  });
}

export async function saveConfig(configList) {
  return request('/api/reminder/SaveConfig', {
    method: 'post',
    body: JSON.stringify({ configList })
  });
}

export async function saveItemConfig(ConfigList,setTypeList) {
  return request('/api/reminder/saveitemconfig', {
    method: 'post',
    body: JSON.stringify({ ConfigList,setTypeList })
  });
}

