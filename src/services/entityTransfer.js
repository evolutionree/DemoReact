import request from '../utils/request';
/**
 * 获取实体转换规则
 * @param params
    { DstCategoryId, DstEntityId, SrcCategoryId,SrcEntityId,SrcRecId }
 * @returns {Promise.<Object>}
 */
export async function queryrules(params) {
  return request(' /api/EntityTransfer/queryrules', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 转换单据，返回详细信息
 * @param params
    { RuleId, SrcEntityId, SrcRecId }
 * @returns {Promise.<Object>}
 */
export async function trnasfer(params) {
  return request(' /api/EntityTransfer/trnasfer', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

