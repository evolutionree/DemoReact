import request from '../utils/request';

/**
 * 添加文档
 * @param params
 * {
    "documenttype":0,
    "entityid":"461ac598-f71b-11e6-94f8-005056ae7f49",
    "businessid":"",
    "folderid":"",
    "fileid":"461ac598-f71b-11e6-94f8-005056ae7f49",
    "filename":"sdfas.jpg",
    "filelength":100990
  }
 * @returns {Promise.<Object>} 返回文档数据的记录ID
 */
export async function addDocument(params) {
  return request('/api/documents/adddocument', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取文档的列表数据
 * @param params
 * {
    "documenttype":0,
    "entityid":"461ac598-f71b-11e6-94f8-005056ae7f49",
    "businessid":"00000000-0000-0000-0000-000000000000",
    "folderid":"8520dc0d-2135-4435-bc33-42fa8793d868",
    "datacategory":2,
    "pageindex":1,
    "pagesize":10
  }
 * @returns {Promise.<Object>}
 */
export async function queryDocumentList(params) {
  return request('/api/documents/documentlist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询文档目录列表
 * @param params
 * {
    "documenttype":0,
    "entityid":"461ac598-f71b-11e6-94f8-005056ae7f49", // 可缺省
    "folderid":""
  }
 * @returns {Promise.<Object>}
 */
export async function queryFolderList(params) {
  return request('/api/documents/folderlist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 添加文档目录
 * @param params
 * {
    "documenttype":1,
    "entityid":"461ac598-f71b-11e6-94f8-005056ae7f49",
    "foldername":"sdfsd",
    "pfolderid":""
  }
 * @returns {Promise.<Object>}
 */
export async function addFolder(params) {
  return request('/api/documents/addfolder', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新文档目录
 * @param params
 * {
    "foldername":"新目录",
    "folderid":"2e9304bf-134b-4ddc-b4b6-e4d96eb70c32"
  }
 * @returns {Promise.<Object>}
 */
export async function updateFolder(params) {
  return request('/api/documents/updatefolder', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除文档
 * @param documentid  'xxx,xxx'
 * @returns {Promise.<Object>}
 */
export async function delDocument(documentid) {
  const arrId = documentid.split(',');
  if (arrId.length > 1) {
    return request('/api/documents/deletedocumentlist', {
      method: 'post',
      body: JSON.stringify({ DocumentIds: arrId })
    });
  }
  return request('/api/documents/deletedocument', {
    method: 'post',
    body: JSON.stringify({ documentid })
  });
}

/**
 * 删除目录
 * @param folderid
 * @returns {Promise.<Object>}
 */
export async function delFolder(folderid) {
  return request('/api/documents/deletefolder', {
    method: 'post',
    body: JSON.stringify({ folderid })
  });
}

/**
 * 叠加文档下载次数
 * @param documentid
 * @returns {Promise.<Object>}
 */
export async function updateDocumentDownloadCount(documentid) {
  return request('/api/documents/updatedownloadcount', {
    method: 'post',
    body: JSON.stringify({ documentid })
  });
}

export async function addDocumentCase(params) {
  return request('/api/documents/addcase', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

