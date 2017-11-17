/**
 * Created by 0291 on 2017/7/27.
 */
import request from '../utils/request';

/**
 * 查询销售阶段
 * @param params
 * {
    "SalesstageTypeId":"",
  }
 * @returns {Promise.<object>}
 */
export async function querysalesstage(params) {
  return request('/api/salesstage/querysalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 * 增加销售阶段
 * @param params
 * {
    "SalesstageTypeId":"",
    StageName：“” //销售阶段名称
    WinRate ：0.1 //盈率
  }
 * @returns {Promise.<object>}
 */
export async function insertsalesstage(params) {
  return request('/api/salesstage/insertsalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 编辑销售阶段
 * @param params
 * {
    "SalesstageTypeId":"",
    StageName：“” //销售阶段名称
    WinRate ：0.1 //盈率
  }
 * @returns {Promise.<object>}
 */
export async function updatesalesstage(params) {
  return request('/api/salesstage/updatesalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 * 启用 禁用 销售阶段
 * @param params
 * {
    SalesStageId
  }
 * @returns {Promise.<object>}
 */
export async function disabledsalesstage(params) {
  return request('/api/salesstage/disabledsalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}



/**
 * 销售阶段排序
 * @param params
 * {
   SalesStageIds:""
  }
 * @returns {Promise.<object>}
 */
export async function orderbysalesstage(params) {
  return request('/api/salesstage/orderbysalesstage', {
    method: 'post',
    body: JSON.stringify(params)
  });
}



/**
 * 开启销售阶段高级模式
 * @param params
 * {
    TypeId:"",
        IsOpenHighSetting:1
  }
 * @returns {Promise.<object>}
 */
export async function openhighsetting(params) {
  return request('/api/salesstage/openhighsetting', {
    method: 'post',
    body: JSON.stringify(params)
  });
}




/**
 *  查询销售阶段详情
 * @param params
 * {
    SalesStageId:""
  }
 * @returns {Promise.<object>}
 */
export async function querysalesstageset(params) {
  return request('/api/salesstage/querysalesstageset', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 *  增加销售阶段事件设置
 * @param params
 * {
     EventName:""

      IsNeedUpFile:1

       SalesStageId:""
  }
 * @returns {Promise.<object>}
 */
export async function insertsalesstageeventset(params) {
  return request('/api/salesstage/insertsalesstageeventset', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *  更新销售阶段事件设置
 * @param params
 * {
    EventSetId :""
       EventName :""

        IsNeedUpFile :1

        SalesStageId  :""
  }
 * @returns {Promise.<object>}
 */
export async function updatesalesstageeventset(params) {
  return request('/api/salesstage/updatesalesstageeventset', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *  删除销售阶段事件设置
 * @param params
 * {
    EventSetId :""
  }
 * @returns {Promise.<object>}
 */
export async function disabledsalesstageeventset(params) {
  return request('/api/salesstage/disabledsalesstageeventset', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *  查询关联商机字段信息
 * @param params
 * {
    EntityId :""
       SalesStageId :""
        SalesStageTypeId:""
  }
 * @returns {Promise.<object>}
 */
export async function querysalesstageinfofields(params) {
  return request('/api/salesstage/querysalesstageinfofields', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *  保存关联商机字段信息
 * @param params
 * {
    EntityId ：“”

         FieldIds  ：“”

         SalesStageId ：“”
  }
 * @returns {Promise.<object>}
 */
export async function savesalesstageoppinfosetting(params) {
  return request('/api/salesstage/savesalesstageoppinfosetting', {
    method: 'post',
    body: JSON.stringify(params)
  });
}


/**
 *  查询自定义表单数据
 * @param params
 * {

  }
 * @returns {Promise.<object>}
 */
export async function querysalesstagerelentity(params) {
  return request('/api/salesstage/querysalesstagerelentity', {
    method: 'post',
    body: JSON.stringify(params)
  });
}

/**
 *  增加自定义表单数据
 * @param params
 * {
RelEntityId:""
         SalesStageId:""
  }
 * @returns {Promise.<object>}
 */
export async function addsalesstagedyentitysetting(params) {
  return request('/api/salesstage/addsalesstagedyentitysetting', {
    method: 'post',
    body: JSON.stringify(params)
  });
}






