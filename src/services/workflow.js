import request from '../utils/request';

/**
 * 查询列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryList(params) {
  return request('/api/workflow/flowlist', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取流程图json数据
 * @param flowid
 * @returns {Promise.<Object>}
 */
export async function queryFlowJSON(flowid) {
  return request('/api/workflow/nodelinesinfo', {
    method: 'POST',
    body: JSON.stringify({ flowid })
  });
}

/**
 * 获取流程图json数据
 * @param flowid
 * @returns {Promise.<Object>}
 */
export async function queryFlowJSONv2(flowid) {
  return request('/api/workflow/getnodelinesinfo', {
    method: 'POST',
    body: JSON.stringify({ flowid })
  });
}

/**
 * 获取流程分支条件
 * @param ruleid
 * @returns {Promise.<Object>}
 */
export async function queryBranchRule(ruleid) {
  return request('/api/rule/getrule', {
    method: 'POST',
    body: JSON.stringify({ ruleid })
  });
}

/**
 * 保存流程json
 * @param params
 * {
      nodes: [{
        nodename: '',
        nodenum: 1,
        auditnum: 1,
        nodetype: 0,
        steptypeid: 1,
        ruleconfig: {},
        columnconfig: {},
        auditsucc: 1
      }],
      lines: [{
        fromnode: 1,
        endnode: 2,
        ruleid: null
      }]
  }
 * @returns {Promise.<Object>}
 */
export async function saveFlowJSON(params) {
  return request('/api/workflow/savenodesconfig', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 新增审批流程
 * @param params
 * {
    "FlowName":"测试流程A",
    "FlowType":0,
    "BackFlag":1,
    "ResetFlag":1,
    "ExpireDay":"5",
    "Remark":"测试",
    "EntityId":"aec01e47-3396-420f-9566-f16e173944ec",
    "SkipFlag":0
  }
 * @returns {Promise.<Object>}
 */
export async function addFlow(params) {
  return request('/api/workflow/add', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 更新审批流程
 * @param params
 * {
    "FLowId":"e507679c-06bd-4ebf-a266-13fe414c4057",
    "FlowName":"测试流程B",
    "BackFlag":1,
    "ResetFlag":1,
    "ExpireDay":"5",
    "Remark":"测试",
    "SkipFlag":0
  }
 * @returns {Promise.<Object>}
 */
export async function updateFlow(params) {
  return request('/api/workflow/update', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 停用工作流
 * @param params
 * @returns {Promise.<Object>}
 */
export async function updateFlowStatus(params) {
  return request('/api/workflow/delete', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
/**
 * 启用工作流，会检验启用逻辑
 * @param params
 * @returns {Promise.<Object>}
 */
export async function unDeleteWorkFlow(params){
  return request('/api/workflow/undelete', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 获取下一节点信息（审批人等）
 * @param caseId
 * @returns {Promise.<Object>}
 */
export async function queryNextNodeData(caseId) {
  return request('/api/workflow/getnextnode', {
    method: 'POST',
    body: JSON.stringify({ caseId })
  });
}

/**
 * 选人之后，提交审批明细数据
 * @param params
 * {
    "CaseId": "46b47980-0d47-4b1f-8ee3-22e947cb2b36",
    "NodeNum":9, // nodenum,handleuser都为-1 表示自由流程关闭
    "HandleUser":"1"
  }
 * @returns {Promise.<Object>}
 */
export async function addCaseItem(params) {
  return request('/api/workflow/addcaseitem', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 选人之后，提交审批明细数据
 * @param params
 * {
    "CaseId": ["3deac3ff-f1b4-479d-b7bb-f6aae2255935","501fc454-6f89-47f2-88fc-bfcfee5f57df"],
    "NodeNum":9, // nodenum,handleuser都为-1 表示自由流程关闭
    "HandleUser":"1"
  }
 * @returns {Promise.<Object>}
 */
export async function addCaseItemMultiple(params) {
  return request('/api/workflow/addmultiplecaseitem', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 将实体记录接入流程
 * @param params
 *  public Guid FlowId { get; set; }
    public Guid EntityId { get; set; }
    public Guid RecId { get; set; }
    public Guid? RelEntityId { get; set; }
    public Guid? RelRecId { get; set; }
    public Dictionary<string,object> CaseData { get; set; }
 * @returns {Promise.<Object>}
 */
export async function addCase(params) {
  return request('/api/workflow/addcase', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 将实体记录接入流程
 * @param params
 *  {
 *    CaseModel // DataType=1时，必填，原addcase接口的参数对象
 *    DataType // 数据类型：0=实体数据（原add接口），1=流程数据（原addcase接口）
 *    EntityModel // DataType=0时，必填，原add接口的参数对象
 *  }
 * @returns {Promise.<Object>}
 */
export async function preAddCase(params) {
  return request('/api/workflow/preaddcase', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 将实体记录接入流程
 * @param params
 *  public Guid FlowId { get; set; }
    public Guid EntityId { get; set; }
    public Guid RecId { get; set; } 数组
    public Guid? RelEntityId { get; set; }
    public Guid? RelRecId { get; set; }
    public Dictionary<string,object> CaseData { get; set; }
 * @returns {Promise.<Object>}
 */
export async function addCaseMultiple(params) {
  return request('/api/workflow/addmultiplecase', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 提交审批意见
 * @param params
 * {
    "CaseId": "46b47980-0d47-4b1f-8ee3-22e947cb2b36",
    "NodeNum":9,
    "Suggest":"1",
    ChoiceStatus: 'allow'
  }
 * @returns {Promise.<Object>}
 */
export async function auditCaseItem(params) {
  return request('/api/workflow/auditcaseitem', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 选人之后，提交审批意见和审批人数据等(新接口)
 * @param params
 * {
    "CaseId": "46b47980-0d47-4b1f-8ee3-22e947cb2b36",
    "NodeId": "xxx-xxx",
    "NodeNum":9, // nodenum,handleuser都为-1 表示自由流程关闭
    "ChoiceStatus": 1, // 审批操作类型， 0拒绝 1通过 2退回 3中止 4编辑发起
    "Suggest": "xxx",
    "HandleUser":"1",
    "CopyUser": "1",
    "CaseData": {} // 流程数据，字典对象
  }
 * @returns {Promise.<Object>}
 */
export async function submitCaseItem(params) {
  return request('/api/workflow/submitaudit', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

/**
 * 预提交
 * @param params
 * @returns {Promise.<Object>}
 */
export async function submitPreCaseItem(params) {
  return request('/api/workflow/submitpreaudit', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}


/**
 * 获取审批详情
 * @param caseId
 * @returns {Promise.<Object>}
 */
export async function queryCaseDetail(caseId) {
  return request('/api/workflow/casedetail', {
    method: 'POST',
    body: JSON.stringify({ caseId })
  });
}

/**
 * 审批步骤明细列表
 * @param caseId
 * @returns {Promise.<Object>}
 */
export async function queryCaseItem(caseId) {
  return request('/api/workflow/caseitemlist', {
    method: 'POST',
    body: JSON.stringify({ caseId })
  });
}
