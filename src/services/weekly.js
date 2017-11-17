/**
 * Created by 0291 on 2017/9/25.
 */
import request from '../utils/request';
import { getEntcommDetail } from './entcomm';
/**
 * 获取列表数据
 * @param params
 * {
      EntityId: 'xxx',
      MenuId: '',
      viewtype: 0,
      searchData: '',
      searchorder: '',
      pageindex: 1,
      pagesize: 10
  }
 * @returns {Promise.<Object>}
 */
export async function getListDetailData(params, entityId = '0b81d536-3817-4cbc-b882-bc3e935db845') {
  return request('/api/dynamicentity/list', {
    method: 'post',
    body: JSON.stringify(params)
  }).then((result) => {
    return Promise.all(
      result.data.pagedata.map((item) => { //遍历请求 详情数据 是因为后端接口设计不合理   需要遍历获取到当前数据对应的dynamicid
        return getEntcommDetail({
          EntityId: entityId, //周计划的实体Id (0b81d536-3817-4cbc-b882-bc3e935db845)   日报实体ID（601cb738-a829-4a7b-a3d9-f8914a5d90f2）
          RecId: item.recid,
          NeedPower: 0
        }).then(result => result).catch( e => { console.error(e); return { data: { detail: null } }});
      })
    ).then((arrResult) => {
      const returnData = result.data.pagedata;
      if (returnData.length === arrResult.length) {
        returnData.map((item, index) => {
          if (entityId === '0b81d536-3817-4cbc-b882-bc3e935db845') {
            //weektype === 1 周总结 取summary
            item.detail = item.weektype === 1 ? arrResult[index].data.summary : arrResult[index].data.detail;
          } else { //日报
            item.detail = arrResult[index].data.detail;
          }
        })
        return {
          pagecount: result.data.pagecount,
          pagedata: returnData
        };
      } else {
        console.error('请求有误');
        return [];
      }
    });
  });
}


/**
 * 评论动态
 * @param params
 * {
    "dynamicid":"e043c869-0bde-476d-8f4f-a82f37218e82",
    "pcommentsid":null,
    "comments":"评论内容"
  }
 * @returns {Promise.<Object>}
 */
export async function addcomments(params) {
  return request('/api/dynamic/addcomments', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * @param params
 * {{"EntityId":"0b81d536-3817-4cbc-b882-bc3e935db845","typeid":"0b81d536-3817-4cbc-b882-bc3e935db845"}
 * @returns {Promise.<Object>}
 */
export async function selectdynamicabstract(params) {
  return request('/api/Dynamic/selectdynamicabstract', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * @param params
 * {
    "viewType": 0,
    "searchOrder": "",
    "entityId": "0b81d536-3817-4cbc-b882-bc3e935db845",
    "pageIndex": 1,
    "pageSize": 10,
    "menuId": "0ad557e0-c709-447e-bf85-89455ec9ae1b",
    "isAdvanceQuery": 1,
    "searchData": {
        "fromdate": "2018-02-26",
        "todate": "2018-02-26",
        "dept": "7f74192d-b937-403f-ac2a-8be34714278b"
    },
    "ExtraData": {

    }
}
 * @returns {Promise.<Object>}
 */
export async function getTableListData(params) {
  return request('/api/workReport/list', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

