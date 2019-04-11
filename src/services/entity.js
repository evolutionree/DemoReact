import request from '../utils/request';

/**
 * 查询实体列表
 * @param params
 * {
    "EntityName":"",
    "TypeId":0, // 0独立实体1嵌套实体2应用实体3动态实体';
    "pageindex":1,
    "pagesize":10,
    "status":1
  }
 * @returns {Promise.<object>}
 */
export async function query(params) {
  return request('/api/EntityPro/queryentitypro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询实体v2
 * @param params
 * modeltype 为-1拿全部
   searchdata:{字典}要什么，把键值写入
 * @returns {Promise.<Object>}
 */
export async function queryV2(params) {
  return request('/api/dynamicentity/entitylist', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询实体详情  实体类型
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryEntityDetail(entityId) {
  return request('/api/EntityPro/queryentityproinfo', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 保存实体新增表单
 * @param params
 * {
      "EntityName": "21313",
      "EntityTable": "table1487582449882",
      "Icons": "",
      "Remark": "12313",
      "Styles": "",
      "TypeId": 1001
  }
 * @returns {Promise.<object>}
 */
export async function save(params) {
  return request('/api/EntityPro/insertentitypro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 禁用/删除实体
 * @param params
 * {
    "entityid":"",
    "status":0
    }
 * @returns {Promise.<Object>}
 */
export async function disableEntity(params) {
  return request('/api/EntityPro/disabledentitypro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除有数据的实体
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function deleteEntity(entityid) {
  return request('/api/EntityPro/deleteentitydata', {
    method: 'post',
    body: JSON.stringify({ entityid })
  });
}

/**
 * 编辑实体
 * @param params
 * {
      "entityid":"2644d788-9720-4437-bd53-81098d339275",
      "EntityName": "全能实体",
      "Remark": "111",
      "TypeId": 1001
  }
 * @returns {Promise.<Object>}
 */
export async function update(params) {
  return request('/api/EntityPro/updateentitypro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体下的类型（配置页面）
 * @param entityId
 * @param [getAllStatus] {boolean}
 * @returns {Promise.<object>}
 */
export async function queryTypes({ entityId, getAllStatus }) {
  return request('/api/EntityPro/queryentitytype', {
    method: 'post',
    body: JSON.stringify({ entityId })
  }).then(result => {
    if (getAllStatus) {
      return result;
    } else {
      return {
        data: {
          entitytypepros: result.data.entitytypepros.filter(item => item.recstatus === 1)
        }
      };
    }
  });
}

/**
 * 实体下新增类型
 * @param params
    { typeName, entityId }
 * @returns {Promise.<object>}
 */
export async function createType(params) {
  return request('/api/EntityPro/insertentitytype', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 禁用启用类型
 * @param params
 * {
    "RecStatus":1,
    "CategoryId":"123123"
  }
 * @returns {Promise.<Object>}
 */
export async function disableType(params) {
  return request('/api/EntityPro/disabledentitytypepro', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 编辑类型名称
 * @param params
 * {
    "CategoryId":"1312",
    "CategoryName":"13123"
    }
 * @returns {Promise.<Object>}
 */
export async function updateType(params) {
  return request('/api/EntityPro/updateentitytype', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 排序实体类型
 * [{
    "CategoryId":"asdas",
    "recorder":1
    }]
 * @param params
 * @returns {Promise.<Object>}
 */
export async function orderType(params) {
  return request('/api/EntityPro/orderbyentitytype', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体下字段
 * @param entityId
 * @returns {Promise.<object>}
 */
export async function queryFields(entityId) {
  return request('/api/EntityPro/queryentityfield', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 获取数据源关联实体下的字段
 * @param Fieldid
 * @returns {Promise.<object>}
 */
export async function getreffieldsbyfield(fieldId) {
  return request('/api/EntityPro/getreffieldsbyfield', {
    method: 'post',
    body: JSON.stringify({ fieldId })
  });
}

/**
 * 新增实体字段
 * @param params
 * @returns {Promise.<Object>}
 */
export async function saveField(params) {
  return request('/api/EntityPro/insertentityfield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 更新实体字段
 * @param params
 * @returns {Promise.<Object>}
 */
export async function updateField(params) {
  return request('/api/EntityPro/updateentityfield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存实体字段扩展脚本
 * @param params
 * public string FieldId { get; set; }
   public string ExpandJS { get; set; }
 * @returns {Promise.<Object>}
 */
export async function updateFieldExpandJS(params) {
  return request('/api/EntityPro/updateentityfieldexpandjs', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存实体字段扩展过滤脚本
 * @param params
 * public string FieldId { get; set; }
   public string FilterJS { get; set; }
 * @returns {Promise.<Object>}
 */
export async function updateFieldExpandFilterJS(params) {
  return request('/api/EntityPro/updateentityfieldfilterjs', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 删除字段
 * @param filedId
 * @returns {Promise.<Object>}
 */
export async function delField(filedId) {
  return request('/api/EntityPro/disabledentityfield', {
    method: 'post',
    body: JSON.stringify({
      fieldid: filedId,
      recstatus: 2
    })
  });
}

/**
 * 字段排序
 * @param params
 * [
    {
      "fieldid":"",
      "recorder":1
    }
  ]
 * @returns {Promise.<Object>}
 */
export async function sortField(params) {
  return request('/api/EntityPro/orderbyentityfield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查看web列表显示字段
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryWebFieldVisible(entityId) {
  return request('/api/EntityPro/querywebfieldvisible', {
    method: 'post',
    body: JSON.stringify({
      entityId
    })
  });
}

/**
 * 保存web列表显示字段
 * @param params
 * [
      {
          "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
          "viewtype": 0,
          "fieldid": "fc978c06-1dd8-42a0-80a3-28ffdf6dc11c"
      },
      {
          "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
          "viewtype": 0,
          "fieldid": "de5ba784-c6f9-4af8-b7b4-fe7a02d69a44"
      }
  ]
 * @returns {Promise.<Object>}
 */
export async function saveWebFieldVisible(params) {
  return request('/api/EntityPro/savewebfieldvisble', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询手机端列表显示
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryMobFieldVisible(entityId) {
  return request('/api/EntityPro/querymobfieldvisible', {
    method: 'post',
    body: JSON.stringify({
      entityId
    })
  });
}

/**
 * 新增手机端显示的
 * @param params
 * {
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "viewtype":1,
    "fieldids":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c,de5ba784-c6f9-4af8-b7b4-fe7a02d69a44",
    "viewstyleid":1,
    "FieldKeys":"opportips,opporname",
    "fonts":"#0000ff,#0010ff,#0000aa",
    "colors":"12,13,16"
  }
 * @returns {Promise.<Object>}
 */
export async function addMobFieldVisible(params) {
  return request('/api/EntityPro/insertmobfieldvisble', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑手机端显示的
 * @param params
 * {
    "ViewConfId":"cf3f4977-1aa4-46b8-90f5-2a6a4ebc3bee",
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "viewtype":1,
    "fieldids":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c,de5ba784-c6f9-4af8-b7b4-fe7a02d69a44",
    "viewstyleid":1,
    "FieldKeys":"opportips,opporname",
    "fonts":"#0000ff,#0010ff,#0000aa",
    "colors":"12,13,16"
  }
 * @returns {Promise.<Object>}
 */
export async function editMobFieldVisible(params) {
  return request('/api/EntityPro/updatemobfieldvisble', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体下字段显示规则
 * @param params
    { entityId, typeId, useType }
 * @returns {Promise.<Object>}
 */
export async function queryRules(params) {
  return request('/api/EntityPro/queryentityfieldrules', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体下字段显示规则
 * @param params
    { entityId, vocationid }
 * @returns {Promise.<Object>}
 */
export async function queryRulesByVocation(params) {
  return request('/api/EntityPro/queryentityfieldrulesvo', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存字段显示规则
 * @param params
 * @returns {Promise.<Object>}
 */
export async function saveRules(params) {
  return request('/api/EntityPro/saveentityfieldrules', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存字段显示规则
 * @param params
 * {
        "entityid": "",//实体Id
        "FieldRules": [
            {
                "FieldLabel": "",//字段名称
                "VocationId": "",//职能ID
                "FieldId": "",//字段ID
                "RecStatus": "",//是否启用
                "Rules": [
                    {
                        "FieldRulesId":"",//职能规则Id
                        "OperateType":0,//操作类型 新增 编辑 查看分别是0 1 2';
                        "IsVisible":0,//0看不见 1看得见
                        "IsReadOnly":0,//0只读 1非只读
                    }
                ]
            }
        ]
    }
 * @returns {Promise.<Object>}
 */
export async function saveRulesByVocation(params) {
  return request('/api/EntityPro/saveentityfieldrulesvo', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询实体主页，顶部显示配置字段
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function queryPageConfigInfo(entityid) {
  return request('/api/EntityPro/querypageconfiginfo', {
    method: 'post',
    body: JSON.stringify({ entityid })
  });
}

/**
 * 保存实体主页顶部字段
 * @param params
 * {
    "entityid":"",
    "TitlefieldId":"",
    "TitlefieldName":"",
    "SubfieldIds":"",
    "SubfieldNames":"",
    "Modules":"",
    "RelentityId":"",
    "RelfieldId":"",
    "RelfieldName":""
   }
 * @returns {Promise.<Object>}
 */
export async function savePageConfig(params) {
  return request('/api/EntityPro/savepageconfig', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询动态摘要字段
 * @param params
 * {
    "typeid":"b2b29fe8-cbb4-4e9f-bb4a-1e2c3da02c0d",
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
  }
 * @returns {Promise.<Object>}
 */
export async function queryDynamicConfig(params) {
  return request('/api/dynamic/selectdynamicabstract', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 保存动态摘要字段
 * @param params
 * {
    "typeid":"b2b29fe8-cbb4-4e9f-bb4a-1e2c3da02c0d",
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
      "fieldids":[
        "fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
        "0dbeac84-fa9b-425b-a359-003b252e4927",
        "d4d5aded-bad3-456e-941d-65e2c061b40f",
        "b09be667-5b4f-4f0e-83dd-c38bc3a5a3a2",
        "f0fd483d-ed5e-4d90-9d10-efc8a4105fa3"
      ]
    }
 * @returns {Promise.<Object>}
 */
export async function saveDynamicConfig(params) {
  return request('/api/dynamic/savedynamicabstract', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询筛选条件设置
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function queryListFilter(entityid) {
  return request('/api/EntityPro/fieldsfilterlist', {
    method: 'post',
    body: JSON.stringify({ entityid })
  });
}

/**
 * 设置筛选条件
 * @param params
 * {
    // "SimpleSearchField":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
    "ViewType":1,
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "fields":[{
      "FieldId":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
      "controltype":1
    }]
  }
 * @returns {Promise.<Object>}
 */
export async function saveListFilter(params) {
  return request('/api/EntityPro/updatefieldsfilter', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 设置实体数据的查询筛选规则
 * @param params
 * {
    "typeid": 0 // 0角色，1菜单，2 动态实体规则
    "RuleName":"我创建的规则",
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "RuleItems":[{
        "itemname":"规则1",
        "fieldid":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
        "Operate":"ilike",//操作符
        "RuleData":"{\"dataval\":"123123",\"datatype\":0}",//datatype 0原生字段 1为关联实体名字查询
        "ruletype":1,
        "usetype":0,//0 实体 1 用户
        "Relation":{
            "userid":0,//上面usetype=0 则为0 其他则为用户id
            "rolesub":1,//现在先写1
            "paramindex":1
        }
        }],
    "RuleSet":{
        "ruleset":"",
        "userid":0,//上面usetype=0 则为0 其他则为用户id
        "ruleformat":""
    }
  }
 * @returns {Promise.<Object>}
 */
export async function saveEntityQueryRule(params) {
  if (params.ruleitems && params.ruleitems.length) {
    params.ruleitems.forEach(item => {
      if (item.ruletype === 2) item.fieldid = null;
    });
  }
  return request('api/rule/saverule', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询筛选菜单配置
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryMenus(entityId) {
  return request('/api/rule/queryrulemenu', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 查询菜单规则详情
 * @param menuid
 * @returns {Promise.<Object>}
 */
export async function queryMenuRule(menuid) {
  return request('/api/rule/querymenuruleinfo', {
    method: 'post',
    body: JSON.stringify({ menuid })
  });
}

/**
 * 查询动态可见规则
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryDynamicRuleInfo(entityId) {
  return request('/api/rule/querydynamicruleinfo', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 删除菜单
 * @param menuid
 * @returns {Promise.<Object>}
 */
export async function delMenu(menuid) {
  return request('/api/rule/disabledmenu', {
    method: 'post',
    body: JSON.stringify({ menuid })
  });
}

// /**
//  * 保存下拉菜单配置
//  * @param params
//  * @returns {Promise.<Object>}
//  */
// export async function saveMenu(params) {
//   return request('/api/EntityPro/saveentitymenus', {
//     method: 'post',
//     body: JSON.stringify(params)
//   });
// }

/**
 * 查询实体入口设置
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryEntries(entityId) {
  return request('/api/EntityPro/queryentrancegroup', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 保存实体入口设置
 * @param params
 * [{
    "entryname":"商机模型A3",
    "entrytype":1,
    "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
    "isgroup":1,
    "recorder":1
  }]
 * @returns {Promise.<Object>}
 */
export async function saveEntries(params) {
  return request('/api/EntityPro/saveentrancegroup', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询客户基础资料字段
 * @param entityId
 * @param CommEntityId  客户基础资料实体id(ac051b46-7a20-4848-9072-3b108f1de9b0)

 * @returns {Promise.<Object>}
 */
export async function querybasefield(entityId) {
  return request('api/entitypro/querybasefield', {
    method: 'post',
    body: JSON.stringify({
      entityId,
      commEntityId : 'ac051b46-7a20-4848-9072-3b108f1de9b0'
    })
  });
}


/**
 * 查询查重字段
 * @param entityId
 * @returns {Promise.<Object>}
 */
export async function queryentitycondition(entityId) {
  return request('api/DynamicEntity/queryentitycondition', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 保存客户基础资料字段
 * @param params
 * [
 {
     "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
     "fieldid": "fc978c06-1dd8-42a0-80a3-28ffdf6dc11c"
 },
 {
     "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
     "fieldid": "de5ba784-c6f9-4af8-b7b4-fe7a02d69a44"
 }
 ]
 * @returns {Promise.<Object>}
 */
export async function saveCustomBasicConfig(params) {
  return request('/api/entitypro/saveentitybasedata', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 保存字段查重
 * @param params
 * @returns {Promise.<Object>}
 */
export async function updateentitycondition(params) {
  return request('/api/DynamicEntity/updateentitycondition', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 查询邮件客户信息字段（通用）
 * @param params
 * { entityid, commentityid }
 * @returns {Promise.<Object>}
 */
export async function queryCommonRelField(params) {
  return request('api/entitypro/querybasefield', {
    method: 'post',
    body: JSON.stringify(params)
  });
}
/**
 * 保存邮件客户信息字段（通用）
 * @param params
 * [
 {
     "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
     "fieldid": "fc978c06-1dd8-42a0-80a3-28ffdf6dc11c"
 },
 {
     "EntityId": "e0771780-9883-456a-98b9-372d9888e0ac",
     "fieldid": "de5ba784-c6f9-4af8-b7b4-fe7a02d69a44"
 }
 ]
 * @returns {Promise.<Object>}
 */
export async function saveCommonRelField(params) {
  return request('/api/entitypro/saveentitybasedata', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 获取页签设置列表数据
 *
 */
export async function queryreltablist(entityId) {
  return request('api/dynamicentity/queryreltablist', {
    method: 'post',
    body: JSON.stringify({entityId})
  });
}

/**
 * 调整常用筛选列表顺序
 */
export async function savemenuorderby(params) {
  return request('api/rule/savemenuorderby', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 调整页签设置列表顺序
 */
export async function orderbyreltab(RelIds) {
  return request('api/dynamicentity/orderbyreltab', {
    method: 'post',
    body: JSON.stringify({
       "RelIds": RelIds.toString()
    })
  });
}

/**
 * 获取页签绑定的实体列表
 * @param  {[type]} entityId [description]
 * @return {[type]}          [description]
 */
export async function getreltabentity(entityId) {
  return request('api/dynamicentity/getreltabentity', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 获取配置实体
 * @param  {[type]} entityId [description]
 * @return {[type]}          [description]
 */
export async function getrelconfigentity(entityId) {
  return request('api/dynamicentity/getrelconfigentity', {
    method: 'post',
    body: JSON.stringify({ entityId })
  });
}

/**
 * 获取关联实体计算字段
 * @param  {[type]} relentityid [description]
 * @return {[type]}          [description]
 */
export async function getrelconfigfields(relentityid) {
  return request('api/dynamicentity/getrelconfigfields', {
    method: 'post',
    body: JSON.stringify({ relentityid })
  });
}

/**
 * 获取关联实体的字段
 * @param  {[type]} entityId    [description]
 * @param  {[type]} RelEntityId [description]
 * @return {[type]}             [description]
 */
export async function getrelentityfields(entityId, relEntityId) {
  return request('api/dynamicentity/getrelentityfields', {
    method: 'post',
    body: JSON.stringify({entityId,relEntityId})
  });
}

/**
 * 新增页签
 * @param  {[type]} entityId    [description]
 * @param  {[type]} fieldId     [description]
 * @param  {[type]} icon        [description]
 * @param  {[type]} relEntityId [description]
 * @param  {[type]} relName     [description]
 * @return {[type]}             [description]
 */
export async function addreltab(params) {
  return request('api/dynamicentity/addreltab', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 修改页签
 */
export async function editreltab(params) {
  return request('api/dynamicentity/editreltab', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 禁用页签
 * @param  {[type]} RelId [description]
 * @return {[type]}       [description]
 */
export async function disabledreltab(RelId) {
  return request('api/dynamicentity/disabledreltab', {
    method: 'post',
    body: JSON.stringify({RelId})
  });
}

/**
 * 获取功能按钮配置的列表
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function queryFunctionButtons(entityid) {
  return request('api/entitypro/functionbtnlist', {
    method: 'POST',
    body: JSON.stringify({ entityid })
  });
}

/**
 * 保存页签统计配置
 * @param
 * @returns {Promise.<Object>}
 */
export async function saverelconfig(params) {
  return request('api/dynamicentity/saverelconfig', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取统计配置信息
 * @param RelId
 * @returns {Promise.<Object>}
 */
export async function getrelconfig(RelId) {
  return request('api/dynamicentity/getrelconfig', {
    method: 'POST',
    body: JSON.stringify({ RelId })
  });
}

/**
 * 新增实体功能按钮
 * @param params
 * ButtonCode	按钮的code，由配置人员与开发人员约定	string	@mock=test
  DisplayPosition	按钮的显示位置（int数组）：web列表=0，web详情=1，手机列表=100，手机详情=101	array<number>	@mock=$order(0,1)
  EntityId	实体id	string	@mock=db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b
  Icon	按钮的图标	string	@mock=00000000-0000-0000-0000-200000000008
  IsRefreshPage	调用后是否刷新页面	number	@mock=1
  Name	按钮名称	string	@mock=test
  RoutePath	按钮关联的url服务	string	@mock=api/dynamicentity/add
  SelectType	数据选择范围：0=全部数据，1=单选，2=多选	number	@mock=0
  Title	按钮title	string	@mock=
 * @returns {Promise.<Object>}
 */
export async function addFunctionButton(params) {
  return request('api/entitypro/addfunctionbtn', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑实体功能按钮
 * @param params { id, ... }
 */
export async function editFunctionButton(params) {
  return request('api/entitypro/editfunctionbtn', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 删除实体功能按钮
 * @param params { id, EntityId }
 */
export async function delFunctionButton(params) {
  return request('api/entitypro/deletefunctionbtn', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 实体功能按钮排序
 * @param params { OrderMapper, EntityId }
 */
export async function sortFunctionButton(params) {
  return request('api/entitypro/sortfunctionbtn', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 保存实体表单js
 * @param params { newload, checkload, editload, entityid }
 * @returns {Promise.<Object>}
 */
export async function saveEntityScripts(params) {
  return request('/api/entitypro/saveentityglobaljs', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取实体表单js
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryEntityScripts(params) {
  return Promise.resolve({ data: 'var a = 5;' });
  // return request('/api/entitypro/entityglobaljs', {
  //   method: 'POST',
  //   body: JSON.stringify(params)
  // });
}


/**
 * 获取特别页面入口清单
 * @param entityid
 * @returns {Promise.<Object>}
 */
export async function queryEntryPages(entityid) {
  return request('api/entitypro/getentrypages', {
    method: 'POST',
    body: JSON.stringify({ entityid })
  });
}

/**
 * 保存页面入口信息
 * @param params
 * @returns {Promise.<Object>}
 */
export async function saveEntryPages(params) {
  return request('api/entitypro/saveentrypages', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}


/**
 * 云拨号
 *  {
    "subject": {
      "called": "18819390642",//被叫人手机号码
      "caller": ""//主叫人手机号码（Web可以不传，服务自行查询）
    },
    "info": {
      "appID": "eb9977aee4cce6fea895091c10f1ec00"//应用ID,暂时写死
    },
    "timestamp": "1505792472000"//当前时间戳
  }
 * @returns {Promise.<Object>}
 */
export async function DJCloudCall(params) {
  return request('api/DJCloud/call', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/*
  获取实体function列表
  {
 EntityId
  }
 */
export async function functionlist(params) {
  return request('api/EntityPro/functionlist', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/*
 保存function列表
 */
export async function savefunctions(params) {
  return request('api/EntityPro/savefunctions', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/*
 获取扩展配置数据
 */
export async function getfunctionconfig(entityId) {
  return request('/api/EntityPro/getfunctionconfig', {
    method: 'POST',
    body: JSON.stringify({ entityId })
  });
}

/*
 更新扩展配置数据
 */
export async function updatefuncconfig(params) {
  return request('/api/EntityPro/updatefuncconfig', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}


/*
  获取实体下 含有数据源的 实体
 */
export async function querywithdatasource() {
  return request('/api/EntityPro/querywithdatasource', {
    method: 'POST',
    body: JSON.stringify({})
  });
}


/*
 获取数据转移方案
 */
export async function getlistschemebyentity(entityid) {
  return request('api/TransferScheme/listschemebyentity', {
    method: 'POST',
    body: JSON.stringify({ entityid })
  });
}


/*
 获取动态实体详情
 */
export async function getDynamicDetail(params) {
  return request('api/dynamic/dynamicdetailbybizid', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
