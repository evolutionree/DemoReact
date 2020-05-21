import _ from 'lodash';
import request from '../utils/request';
import { queryFields, queryListFilter } from './entity';

/**
 * 获取协议
 * @param params
 * {
     TypeId: 'xxx', // entityid
     operatetype: 0 // 0新增 1编辑 2查看
  }
 * @returns {Promise.<Object>}
 */
export async function getGeneralProtocol(params) {
  return request('/api/dynamicentity/generalprotocol', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取动态协议
 * @param params
 * * {
     TypeId: 'xxx', // entityid
     operatetype: 0 // 0新增 1编辑 2查看
  }
 * @returns {Promise.<Object>}
 */
export async function getGenralDynawebProtocol(params) {
  return request('/api/dynamicentity/generaldynwebprotocol', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取页面操作按钮
 * @param params
 * {"entityid":"f9db9d79-e94b-4678-a5cc-aa6e281c1246",
 *  "RecIds":["734834eb-7403-4638-bba2-b1f70cf60848"]}
 * @returns {Promise.<Object>}
 */
export async function getFunctionbutton(params) {
  return request('/api/dynamicentity/functionbutton', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 自定义请求
 * @param params url
 * @returns {Promise.<Object>}
 */
export async function dynamicRequest(url, params) {
  return request(url, {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取嵌套实体协议
 * @param params {TypeId，EntityId，OperateType}
 * @returns {Promise.<Object>}
 */
export async function getGeneralProtocolForGrid(params) {
  return request('/api/dynamicentity/generalprotocolforgrid', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取列表协议
 * @param params
 * {
    //"entityid":"",
    "typeid":""
    }
 * @returns {Promise.<Object>}
 */
export async function getGeneralListProtocol(params) {
  return request('/api/dynamicentity/generalwebprotocol', {
    method: 'post',
    body: JSON.stringify({
      operatetype: 2,
      ...params
    })
  });
}

/**
 * 获取动态列表协议
 * @param params
 * {
    //"entityid":"",
    "typeid":""
    }
 * @returns {Promise.<Object>}
 */
export async function getDynamicListProtocol(params) {
  return request('/api/dynamicentity/generaldynwebprotocol', {
    method: 'post',
    body: JSON.stringify({
      operatetype: 2,
      ...params
    })
  });
}

/**
 * 获取高级搜索协议
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function getAdvanceSearchProtocol(entityid) {
  function formatField(field, allFields) {
    const match = _.find(allFields, ['fieldid', field.fieldid]);
    if (match) {
      return {
        ...match,
        controltype: field.islike ? 1 : match.controltype
      };
    }
  }
  return Promise.all([queryFields(entityid), queryListFilter(entityid)]).then(([result1, result2]) => {
    const allFields = result1.data.entityfieldpros;
    const searchFields = result2.data.fieldssearch.map(field => formatField(field, allFields)).filter(field => !!field);
    return { data: searchFields };
  });
}

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
export async function getListData(params) {
  return request('/api/dynamicentity/list', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 暂存新增表单
 * @param params
 * @returns {Promise.<Object>}
 */
export async function temporarysave(params) {
  return request('/api/dynamicentity/temporarysave', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 提交新增表单
 * @param params
 * {
     TypeId: '', // 类型id
     FieldData: {} // 表单数据
 }
 * @returns {Promise.<Object>}
 */
export async function addEntcomm(params) {
  return request('/api/dynamicentity/add', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 提交编辑表单
 * @param params
 * {
     TypeId: '', // 类型id
     recid: '', // 记录id
     FieldData: {} // 表单数据
 }
 * @returns {Promise.<Object>}
 */
export async function editEntcomm(params) {
  return request('/api/dynamicentity/edit', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除实体数据
 * @param params
 * public Guid EntityId { get; set; }
  public string RecId { get; set; }
 * @returns {Promise.<Object>}
 */
export async function delEntcomm(params) {
  return request('/api/dynamicentity/delete', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 转移实体数据负责人
 * @param params
 * public Guid EntityId { get; set; }
    public string RecId { get; set; }
    public int Manager { get; set; }
 * @returns {Promise.<Object>}
 */
export async function transferEntcomm(params) {
  return request('/api/dynamicentity/transfer', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 转移实体数据
 * @param params
 *  public DynamicEntityListModel DataFilter { get; set; }
 //优先recids
 public string RecIds { get; set; }
 public Guid  SchemeId{get;set;}
 public Guid FieldId { get; set; }
 public Guid EntityId { get; set; }
 public int NewUserId { get; set; }
 * @returns {Promise.<Object>}
 */
export async function transferdata(params) {
  return request('api/DynamicEntity/transfer_pro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 记录详情
 * @param params
 * {
 *    EntityId: '',
 *    RecId: '',
 *    NeedPower: ''
 * }
 * @returns {Promise.<Object>}
 */
export async function getEntcommDetail(params) {
  return request('/api/dynamicentity/detail', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取动态列表
 * @param params
 * {
    "businessid":"429ceecb-c3b7-4e6e-8d5a-e2a6e9634b31",
    "dynamictypes":[0,1,2],
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "recversion":0,
    "pageindex":1,
    "pagesize":20
  }
 * @returns {Promise.<Object>}
 */
export async function getEntcommAtivities(params) {
  return request('/api/dynamic/dynamiclist', {
    method: 'post',
    body: JSON.stringify({ requesttype: 1, ...params })
  });
}

/**
 * 获取某个动态详情
 * @param dynamicid
 * @returns {Promise.<Object>}
 */
export async function getActivityDetail(dynamicid) {
  return request('/api/dynamic/dynamicdetail', {
    method: 'post',
    body: JSON.stringify({ dynamicid })
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
export async function commentEntcommActivity(params) {
  return request('/api/dynamic/addcomments', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 动态点赞
 * @param dynamicid
 * @returns {Promise.<Object>}
 */
export async function likeEntcommActivity(dynamicid) {
  return request('/api/dynamic/addpraise', {
    method: 'post',
    body: JSON.stringify({ dynamicid })
  });
}

export async function queryPlugins({ entityid, recid }) {
  function queryDynamicEntities() {
    const params = {
      method: 'post',
      body: JSON.stringify({
        entityname: '',
        pageindex: 1,
        pagesize: 999,
        status: 1,
        typeid: 3
      })
    };
    return request('/api/EntityPro/queryentitypro', params).then(result =>
      result.data.pagedata.filter(item => item.relentityid === entityid)
    );
  }

  function queryPluginVisible() {
    const params = {
      method: 'post',
      body: JSON.stringify({ entityid, recid })
    };
    return request('/api/dynamicentity/pluginvisible', params).then(result => result.data);
  }

  function queryFunctionButton() {
    const params = {
      method: 'post',
      body: JSON.stringify({ entityid, RecIds: [recid] })
    };
    return request('/api/dynamicentity/functionbutton', params).then(result => {
      return result.data.filter(item => {
        return item.displayposition.indexOf(1) !== -1;
      });
    });
  }

  return Promise.all([queryDynamicEntities(), queryPluginVisible(), queryFunctionButton()]).then(result => {
    const [dynamicEntities, pluginVisibleData, buttons] = result;
    const { entityaudit, flow, relflow, viewhidden } = pluginVisibleData;
    const hideIds = (viewhidden[0] && viewhidden[0].pluginids) || [];

    const visibleEntities = dynamicEntities.filter(item => hideIds.indexOf(item.entityid) === -1);
    const plugins = visibleEntities
      .map(entity => {
        const plugin = {
          type: 'normal',
          entity
        };
        const matchFlow = _.find(flow, ['entityid', entity.entityid]);
        if (matchFlow) {
          plugin.type = 'flow';
          plugin.flowid = matchFlow.flowid;
        }
        if (entity.flowid && !matchFlow) {
          return null;
        }
        plugin.name = entity.entityname;
        plugin.name_lang = entity.entityname_lang;
        plugin.icon = entity.icons;
        return plugin;
      })
      .filter(item => !!item);

    relflow.forEach(item => {
      plugins.push({
        type: 'flow',
        flowid: item.flowid,
        name: item.flowname,
        name_lang: item.flowname_lang,
        icon: item.icons,
        recid: item.recid,
        entity: {
          entityid: item.entityid
        }
      });
    });

    entityaudit.forEach(item => {
      plugins.push({
        type: 'audit',
        flowid: item.flowid,
        name: item.flowname,
        name_lang: item.flowname_lang,
        icon: item.icons
      });
    });

    buttons.forEach(item => {
      if (item.buttoncode === 'CallService') {
        plugins.push({
          type: 'CallService',
          name: item.title,
          name_lang: item.title_lang,
          icon: item.icon,
          routepath: item.routepath,
          entity: item
        });
      } else if (item.buttoncode === 'PrintEntity') {
        plugins.push({
          type: 'FunctionButton',
          code: 'PrintEntity',
          name: item.title,
          name_lang: item.title_lang,
          icon: item.icon,
          entity: item
        });
      } else if (item.buttoncode === 'EntityDataOpenH5') {
        plugins.push({
          type: 'EntityDataOpenH5',
          name: item.title,
          name_lang: item.title_lang,
          icon: item.icon,
          routepath: item.routepath,
          entity: item
        });
      } else if (item.buttoncode === 'AddRelEntityData') {
        const entity = item.extradata && typeof item.extradata === 'object' ? { ...item, ...item.extradata } : item;
        plugins.push({
          type: 'AddRelEntityData',
          name: item.title,
          name_lang: item.title_lang,
          icon: item.icon,
          routepath: item.routepath,
          entity
        });
      } else if (item.buttoncode === 'ShowQRcode') {
        const entity = item.extradata && typeof item.extradata === 'object' ? { ...item, ...item.extradata } : item;
        plugins.push({
          type: 'ShowQRcode',
          name: item.title,
          name_lang: item.title_lang,
          icon: item.icon,
          routepath: item.routepath,
          entity
        });
      } else if (item.extradata) {
        if (item.extradata.type === 'transform') {
          plugins.push({
            type: 'transform',
            name: item.title,
            name_lang: item.title_lang,
            icon: item.icon,
            entity: item
          });
        } else if (item.extradata.type === 'upatebutton') {
          plugins.push({
            type: 'upatebutton',
            name: item.title,
            name_lang: item.title_lang,
            icon: item.icon,
            entity: item
          });
        } else if (item.extradata.type === 'copybutton') {
          plugins.push({
            type: 'copybutton',
            name: item.title,
            name_lang: item.title_lang,
            icon: item.icon,
            entity: item
          });
        }
      }
    });
    return plugins;
  });
}

/**
 * 获取页签tab
 * { entityId, recid }
 */
export async function queryTabs(params) {
  return request('/api/dynamicentity/queryreltablistbyrole', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 客户端获取统计值
 * @param RecId
 * @param RelId
 * @returns {Promise.<Object>}
 */
export async function queryreldatasource(params) {
  return request('/api/dynamicentity/queryreldatasource', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取主页顶部显示字段配置
 * @param params
 * { entityid, typeid }
 * @returns {Promise.<Object>}
 */
export async function queryMainFields(params) {
  const { entityid, typeid } = params;

  return Promise.all([queryConfig(), queryProtocols()]).then(result => {
    const [config, protocols] = result;
    const retResult = {};
    if (!config) return retResult;
    if (config.titlefieldid) {
      retResult.titleField = _.find(protocols, ['fieldid', config.titlefieldid]);
    }
    if (config.subfieldids) {
      retResult.subFields = [];
      config.subfieldids.split(',').forEach(fieldId => {
        if (fieldId) {
          const field = _.find(protocols, ['fieldid', fieldId]);
          if (field) retResult.subFields.push(field);
        }
      });
    }
    if (config.relfieldid && config.relentityid) {
      const relField = _.find(protocols, ['fieldid', config.relfieldid]);
      if (relField) {
        relField.fieldconfig.entityId = config.relentityid;
        retResult.subFields = [relField, ...(retResult.subFields || [])];
      }
    }
    return retResult;
  });

  function queryConfig() {
    return request('/api/basicdata/syncview', {
      method: 'post',
      body: JSON.stringify({
        VersionKey: { entitypageconfigsync: 0 }
      })
    }).then(result => {
      const config = _.find(result.data.entitypageconf, ['entityid', entityid]);
      return config;
    });
  }
  function queryProtocols() {
    // return request('/api/dynamicentity/generalprotocol', {
    //   method: 'post',
    //   body: JSON.stringify({
    //     typeid,
    //     operatetype: 2
    //   })
    // }).then(result => result.data);
    return queryFields(entityid).then(result => result.data.entityfieldpros);
  }
}

/**
 * 获取关联实体列表（如客户下商机）
 * @param params
 *  public Guid RecId { get; set; } 记录id
    public Guid RelId { get; set; } tab的relid
    public Guid RelEntityId { get; set; } tab的relentityid
    public string keyWord { get; set; }
    public int ViewType { get; set; } web传0 手机传1

    public int PageIndex { get; set; }
    public int PageSize { get; set; }
 * @returns {Promise.<Object>}
 */
export async function queryTabsList(params) {
  return request('/api/dynamicentity/reltablist', {
    method: 'post',
    body: JSON.stringify({
      keyword: '',
      viewtype: 0,
      pageindex: 1,
      pagesize: 9999,
      ...params
    })
  });
}

/**
 * 获取实体阶段推进数据
 * @param entityTypeId
 * @returns {Promise.<Object>}
 */
export async function queryEntityStage(entityTypeId) {
  return request('/api/salesstage/querysalesstage', {
    method: 'post',
    body: JSON.stringify({
      SalesstageTypeId: entityTypeId
    })
  });
}

/**
 * 获取阶段详情数据
 * @param params
 * {
      "SalesStageTypeId": "77e5732d-434d-4edc-a801-8a79e5e51b9e",
      "recid": "eda01599-d55e-40fd-a3aa-c5ae0ae5465b",
      "SalesStageId": "ffd0f472-29a6-11e7-8a37-005056ae7f49"
  }
 * @returns {Promise.<Object>}
 */
export async function queryStageInfo(params) {
  return request('/api/salesstage/querysalesstagestepinfo', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存阶段详情数据
 * @param params
 * {
      "recid": "04d53e44-26c5-4719-88d4-aa13717ca4ad",
      "typeid": "77e5732d-434d-4edc-a801-8a79e5e51b9e",
      "salesstageids": "ffd0f472-29a6-11e7-8a37-005056ae7f49",
      "SalesStageFlag": 0,
      "isweb": 0,
      "info": {
          "typeid": "77e5732d-434d-4edc-a801-8a79e5e51b9e",
          "fielddata": {
              "startdate": "2017-05-04 17:03:02"
          }
      },
      "Event": [
          {
              "eventsetid": "a679c970-29a7-11e7-be5b-005056ae7f49",
              "isfinish": 0
          },
          {
              "eventsetid": "bdf17954-29a7-11e7-a239-005056ae7f49",
              "isfinish": 1
          }
      ],
      "dynentity": {
          "TypeId": "fa2bc5f3-b916-47b3-8b7d-3deab1f8e236",
          "FieldData": {
              "recname": "",
              "recmanager": "12",
              "ueqfwo": "fff",
              "ysloul": "2017-05-08"
          }
      }
  }
 * @returns {Promise.<Object>}
 */
export async function saveStageData(params) {
  return request('/api/salesstage/savesalesstageinfo', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
/***
 * 重启商机
 * @param params
 * @returns {Promise.<Object>}
 */
export async function restartSaleStage(params) {
  return request('/api/salesstage/salesstagerestart ', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 阶段推进
 * @param params
 * {
    "Recid":"71389dcb-f8f1-47c1-a379-0093098fda6b",
    "SalesStageIds":"037bc8fb-978f-4052-b6e9-77078cebd95d,e7c1bdd0-c84c-4851-8470-0904c93fdb3d,6bf00a96-e573-4240-85c2-13f1f24b3c5d",
    "typeid":"33dfbfdb-fd3b-4288-a423-40abffe6084e"
  }
 * @returns {Promise.<Object>}
 */
export async function pushStage(params) {
  return request('/api/salesstage/checkallowpushsalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 阶段回退
 * @param params
 * {
    "recid":"71389dcb-f8f1-47c1-a379-0093098fda6b",
    "typeid":"33dfbfdb-fd3b-4288-a423-40abffe6084e",
    "SalesStageId":""
  }
 * @returns {Promise.<Object>}
 */
export async function backStage(params) {
  return request('/api/salesstage/checkallowreturnsalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 检查对数据是否有权限
 * @param params
 * {
    "recid":"71389dcb-f8f1-47c1-a379-0093098fda6b",
    "entityid":"33dfbfdb-fd3b-4288-a423-40abffe6084e"
  }
 * @returns {Promise.<Object>}
 */
export async function checkHasPermission(params) {
  return request('/api/dynamicentity/ishaspermission', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 关注实体
 * @param params
 * {
    "recid":"",
    "entityid":"",
    "isfollow":"",
    "rectype":""
  }
 * @returns {Promise.<Object>}
 */
export async function follow(params) {
  return request('/api/dynamicentity/follow', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 商机下联系人，新增获取备选列表数据
 * @param params
 * { recid: '', relid: '' }
 * @returns {Promise.<Object>}
 */
export async function queryRelAddList(params) {
  return request('/api/dynamicentity/reltabsrclist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 商机下联系人，删除数据
 * @param params
 * { recid: '', relid: '', relrecid: '' }
 * @returns {Promise.<Object>}
 */
export async function delRelItem(params) {
  return request('/api/dynamicentity/deleterelation', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 商机下联系人，通过备选列表数据新增
 * @param params
 * {
    relid: ''
    "recid":""联系人id
    "idstr":""商机id
  }
 * @returns {Promise.<Object>}
 */
export async function addRelByList(params) {
  return request('/api/dynamicentity/addreltabreldatasrc', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *
 * @returns {Promise.<Object>}
 */
export async function extraToolbarClickSendData(url, params) {
  return request(url, {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *NewUserId
  RecIds
 * @returns {Promise.<Object>}
 */
export async function savemailowner(params) {
  return request('/api/mailset/savemailowner', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取获取个人列定义协议
 * @param params
 * {
     EntityId: 'xxx', // 实体的id
  }
 * @returns {Promise.<Object>}
 */
export async function getCustomHeaders(params) {
  return request('/api/DynamicEntity/getweblistcolumnsforpersonal', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存个人列定义接口
 * @param params
 * {
     EntityId: 'xxx', // 实体的id
     viewconfig: {
      Columns: [
        {
        FieldId:
        IsDisplay:
        Seq:
        width:
        }
      ]
     },
     FixedColumnCount:
  }
 * @returns {Promise.<Object>}
 */
export async function saveCustomHeaders(params) {
  return request('/api/DynamicEntity/saveweblistcolumnsforpersonal', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体动态页签下 新增表单中动态字段
 * @param params
 * {
 * "EntityId":"f9db9d79-e94b-4678-a5cc-aa6e281c1246",
 * "RecId":"2306b7da-292b-4f3e-ac02-c2f79a06ac8f",
 * "FieldId":"699eebb9-60bf-46dd-9925-e4023931fe7d"
 * }
 * @returns {Promise.<Object>}
 */
export async function queryvaluefornewdata(params) {
  return request('/api/dynamicentity/queryvaluefornewdata', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体审批流
 * @param params
 * {
 * "EntityId":"f9db9d79-e94b-4678-a5cc-aa6e281c1246"
 * }
 * @returns {Promise.<Object>}
 */
export async function queryWorkflow(EntityId) {
  return request('/api/workflow/workflowidbyentityid', {
    method: 'post',
    body: JSON.stringify({ EntityId })
  });
}
