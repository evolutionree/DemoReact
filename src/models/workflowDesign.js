import { message } from 'antd'
import * as _ from 'lodash'
import uuid from 'uuid'
import { queryFlowJSONv2, saveFlowJSON } from '../services/workflow'
import { queryFields, queryEntityDetail } from '../services/entity'
import { getreportrelation } from '../services/reportrelation'
import { getIntlText } from '../components/UKComponent/Form/IntlText'

// 654209d5-3506-48eb-b5d2-0e0ea2ba7c84

/**
 * 格式化服务端数据，并为节点初始化坐标
 * @param data { lines, nodes }
 * @returns {{flowSteps: Array, flowPaths: Array, flowStepsByIdCollection: Object}}
 */
function parseFlowJSON(data) {
  if (!data.nodes || !data.nodes.length) {
    return { flowSteps: [], flowPaths: [], flowStepsByIdCollection: {} }
  }

  const nodesByIdCollection = data.nodes.reduce((collect, curr) => {
    return { ...collect, [curr.nodeid]: curr }
  }, {})

  const nodesByPositionCollection = {}

  // 用 position 标记层级
  const startNode = _.find(data.nodes, node => node.steptypeid === 0)
  startNode.position = 0
  let restLines = data.lines
  let index = 0
  while (restLines.length && index < data.lines.length) {
    restLines = loopRestLines(restLines)
    index++
  }
  Object.keys(nodesByIdCollection).forEach(id => {
    const node = nodesByIdCollection[id]
    const position = node.position
    if (!nodesByPositionCollection[position]) {
      nodesByPositionCollection[position] = []
    }
    nodesByPositionCollection[position].push(node)
  })

  let maxCount = 0
  Object.keys(nodesByPositionCollection).forEach(key => {
    const nodes = nodesByPositionCollection[key]
    const count = nodes.length
    maxCount = Math.max(count, maxCount)
  })

  const nodeHeight = 150
  const nodeWidth = 180
  const nodeWidthSmall = 180
  const nodeVMargin = 20
  const nodeHMargin = 100
  const totalHeight = maxCount * nodeHeight + (maxCount - 1) * nodeVMargin
  Object.keys(nodesByPositionCollection).forEach(key => {
    const nodes = nodesByPositionCollection[key]
    const count = nodes.length
    const firstNodeTopPosition = (totalHeight - count * nodeHeight - (count - 1) * nodeVMargin) / 2
    nodes.forEach((node, index) => {
      if (key === '0') {
        node.x = 0
      } else if (key === '1') {
        node.x = nodeWidthSmall + nodeHMargin
      } else {
        node.x = (node.position - 1) * (nodeWidth + nodeHMargin) + nodeWidthSmall + nodeHMargin
      }
      node.y = firstNodeTopPosition + index * (nodeHeight + nodeVMargin)
    })
  })

  const xOffset = 30
  const yOffset = 80
  data.nodes.forEach(node => {
    if (node.y !== undefined) {
      node.y += yOffset
    }
    if (node.x !== undefined) {
      node.x += xOffset
    }
  })

  function loopRestLines(lines) {
    const nextRest = [...lines]
    let removecount = 0
    lines.forEach((line, index) => {
      const { fromnodeid: fromId, tonodeid: endId } = line
      const fromNode = nodesByIdCollection[fromId]
      const endNode = nodesByIdCollection[endId]
      if (fromNode.position === undefined) return
      endNode.position =
        endNode.position !== undefined ? Math.max(endNode.position, fromNode.position + 1) : fromNode.position + 1
      nextRest.splice(index - removecount, 1)
      removecount++
    })

    return nextRest
  }

  const flowSteps = data.nodes.map(item => ({
    id: item.nodeid,
    name: item.nodename,
    x: (item.nodeconfig && item.nodeconfig.positionX) || item.x,
    y: (item.nodeconfig && item.nodeconfig.positionY) || item.y,
    rawNode: item
  }))
  const flowPaths = data.lines
    .map(item => ({
      from: item.fromnodeid,
      to: item.tonodeid,
      ruleid: item.ruleid
    }))
    .map(markBranch)
  const flowStepsByIdCollection = flowSteps.reduce((collect, curr) => {
    return { ...collect, [curr.id]: curr }
  }, {})
  return { flowSteps, flowPaths, flowStepsByIdCollection }
}
function getInitialFlowJSON() {
  const startNodeId = uuid.v4()
  const endNodeId = uuid.v4()
  const nextNodeId = uuid.v4()
  return {
    nodes: [
      {
        nodename: '发起审批',
        nodeid: startNodeId,
        auditnum: 0,
        nodetype: 0,
        steptypeid: 0,
        ruleconfig: {},
        columnconfig: {},
        auditsucc: 1
      },
      {
        nodename: '结束审批',
        nodeid: endNodeId,
        auditnum: 0,
        nodetype: 0,
        steptypeid: -1,
        ruleconfig: {},
        columnconfig: {},
        auditsucc: 1
      },
      {
        nodename: '审批节点',
        nodeid: nextNodeId,
        auditnum: 1,
        steptypeid: 1,
        notfound: 1,
        nodetype: 0,
        funcname: '',
        columnconfig: {},
        stepcptypeid: 17,
        ruleconfig: { reportrelation: JSON.stringify({ type: 1 }) },
        auditsucc: 1
      }
    ],
    lines: [
      {
        fromnodeid: startNodeId,
        tonodeid: nextNodeId,
        ruleid: null
      },
      {
        fromnodeid: nextNodeId,
        tonodeid: endNodeId,
        ruleid: null
      }
    ]
  }
}

function parseColumnConfig(columnConfig) {
  if (columnConfig && columnConfig.config && columnConfig.config.length) {
    return _.flatMap(columnConfig.config, item => item.fields.map(field => ({ ...field, entityId: item.entityId })))
  }
  return []
}

function formatFieldsToColumnConfig(fields) {
  const config = []
  const collect = {}
  fields.forEach(field => {
    const { entityId, fieldId, isRequired } = field
    let innerFields = collect[entityId]
    if (!innerFields) {
      innerFields = collect[entityId] = []
      config.push({
        entityId,
        fields: innerFields
      })
    }
    innerFields.push({
      fieldId,
      isRequired
    })
  })
  return { config }
}

function markBranch(path, index, allPaths) {
  const isBranch = allPaths.some(p => p.from === path.from && p.to !== path.to)
  return {
    ...path,
    isBranch
  }
}

// 针对 { node1, node2 ... } => { node3, node4 ... } 添加分支辅助节点
function addBranchHelpers({ flowSteps, flowPaths }) {
  let retFlowSteps = [...flowSteps]
  let retFlowPaths = [...flowPaths]
  const nextSteps = {}
  flowSteps.forEach(step => (nextSteps[step.id] = getNextSteps(step.id, flowSteps, flowPaths)))
  const groupBySameNextSteps = _.groupBy(flowSteps, step => {
    return nextSteps[step.id].map(item => item.id).join(',')
  })
  Object.keys(groupBySameNextSteps).forEach(key => {
    const grouped = groupBySameNextSteps[key]
    if (grouped.length <= 1) return
    const nexts = nextSteps[grouped[0].id]
    if (nexts.length <= 1) return

    const helperStepId = '__helper_' + uuid.v4()
    const helperStep = {
      id: helperStepId,
      name: '__helper',
      x: grouped[0].x + 100,
      y: grouped[0].y,
      rawNode: null
    }
    const helperPaths = grouped.map(step => ({ from: step.id, to: helperStepId, ruleid: null }))
    const helperPaths2 = nexts.map(step => ({
      from: helperStepId,
      to: step.id,
      ruleid: _.find(flowPaths, ['to', step.id]).ruleid
    }))
    retFlowPaths = retFlowPaths.filter(path => !_.includes(grouped.map(i => i.id), path.from))
    retFlowPaths = [...retFlowPaths, ...helperPaths, ...helperPaths2]
    retFlowSteps = [...retFlowSteps, helperStep]

    const afterSteps = getAfterSteps(helperStepId, retFlowSteps, retFlowPaths)
    afterSteps.forEach(step => {
      // step.x += 50;
      // step.y += 50;
    })
  })
  return { flowSteps: retFlowSteps, flowPaths: retFlowPaths }
}
function getNextSteps(stepId, flowSteps, flowPaths) {
  const paths = flowPaths.filter(item => item.from === stepId)
  const nextStepsId = paths.map(item => item.to)
  return nextStepsId.map(id => _.find(flowSteps, ['id', id])).filter(item => !!item)
}
function getAfterSteps(stepId, flowSteps, flowPaths) {
  let allNexts = []
  let nextSteps = getNextSteps(stepId, flowSteps, flowPaths)
  while (nextSteps.length) {
    allNexts = [...allNexts, ...nextSteps]
    nextSteps = nextSteps.map(step => getNextSteps(step.id, flowSteps, flowPaths))
    nextSteps = _.flatten(nextSteps)
  }
  return _.uniqBy(allNexts, 'id')
}

function validateFlowSteps(flowSteps, flowPaths) {
  let valid = true
  flowSteps.forEach(step => {
    const { id, rawNode } = step
    if (!rawNode) {
      valid = false
      return
    }
    const { steptypeid } = rawNode
    const hasPathToThis = flowPaths.some(path => path.to === id)
    const hasPathFromThis = flowPaths.some(path => path.from === id)
    if (steptypeid === 0 && !hasPathFromThis) {
      valid = false
    } else if (steptypeid === -1 && !hasPathToThis) {
      valid = false
    } else if (steptypeid !== 0 && steptypeid !== -1 && (!hasPathFromThis || !hasPathToThis)) {
      valid = false
    }
  })
  return valid
}

export default {
  namespace: 'workflowDesign',
  state: {
    rawData: null,
    flowId: '',
    flowSteps: [],
    flowPaths: [],
    flowStepsByIdCollection: {},
    showModals: '',
    editingFlowStepForm: null,
    flowEntities: [],
    editingPath: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/workflow\/([^/]+)\/design/
        const match = location.pathname.match(pathReg)
        if (match) {
          const flowId = match[1]
          dispatch({ type: 'putState', payload: { flowId } })
          dispatch({ type: 'queryFlowJSON' })
        } else {
          dispatch({ type: 'resetState' })
        }
      })
    }
  },
  effects: {
    * queryFlowJSON(action, { select, put, call }) {
      const { flowId } = yield select(state => state.workflowHome)
      try {
        const { data } = yield call(queryFlowJSONv2, flowId)
        const { flowSteps, flowPaths } = parseFlowJSON(data)
        yield put({ type: 'putState', payload: { flowSteps, flowPaths } })

        const flowInfo = data.flow[0]
        yield put({ type: 'queryFlowEntity', payload: flowInfo })
      } catch (e) {
        message.error(e.message || '获取流程数据失败')
      }
    },
    * queryFlowEntity({ payload: flowInfo }, { select, put, call }) {
      try {
        const { entityid, entityname, relentityid, relentityname } = flowInfo
        const { data } = yield call(queryFields, entityid)
        const { data: entityDetail } = yield call(queryEntityDetail, entityid) // 获取实体数据

        const entityproinfo = Array.isArray(entityDetail.entityproinfo)
          ? entityDetail.entityproinfo.map(item => ({ ...item, displayname: getIntlText('entityname', item) }))
          : []

        let entityproinfo2 = []

        if (relentityid && relentityname) {
          // 获取关联实体数据
          const { data: meta20 } = yield call(queryEntityDetail, relentityid)
          entityproinfo2 = Array.isArray(meta20.entityproinfo)
            ? meta20.entityproinfo.map(item => ({ ...item, displayname: getIntlText('entityname', item) }))
            : []
        }
        const forms = [...entityproinfo, ...entityproinfo2]

        const { data: reportrelation } = yield call(getreportrelation, {})
        const reportrelationList = Array.isArray(reportrelation.datalist)
          ? reportrelation.datalist.map(item => ({ ...item, displayname: item.reportrelationname }))
          : []

        const flowEntities = [
          {
            entityid,
            entityname,
            fields: data.entityfieldpros,
            forms,
            reportrelationList
          }
        ]

        if (relentityid && relentityname) {
          const { data: data2 } = yield call(queryFields, relentityid)

          flowEntities.push({
            entityid: relentityid,
            entityname: relentityname,
            fields: data2.entityfieldpros
          })
        }
        yield put({ type: 'putState', payload: { flowEntities } })
      } catch (e) {
        message.error(e.message || '获取流程实体数据失败')
      }
    },
    * generateFlowJSON(action, { select, put, call }) {
      const { flowSteps, flowPaths } = parseFlowJSON(getInitialFlowJSON())
      yield put({ type: 'putState', payload: { flowSteps, flowPaths } })
    },
    * changeStepName(
      {
        payload: { stepId, name }
      },
      { select, put }
    ) {
      const { flowSteps } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', stepId])
      flowStep.name = name
      yield put({
        type: 'putState',
        payload: { flowSteps: [...flowSteps] }
      })
    },
    * openStepModal({ payload: stepId }, { select, put }) {
      const { flowSteps } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', stepId])
      const rawNodeData = flowStep.rawNode || {}

      const endnodeconfig = rawNodeData.ruleconfig && rawNodeData.ruleconfig.endnodeconfig ? (
        typeof rawNodeData.ruleconfig.endnodeconfig === 'string' ? JSON.parse(rawNodeData.ruleconfig.endnodeconfig) : rawNodeData.ruleconfig.endnodeconfig
      ) : {}

      const editingFlowStepForm = {
        stepId: flowStep.id,
        nodeType: rawNodeData.nodetype || 0,
        stepUser: {
          type: rawNodeData.steptypeid !== undefined ? rawNodeData.steptypeid : 1,
          data: {
            ...rawNodeData.ruleconfig,
            reportrelation: rawNodeData.ruleconfig
              ? typeof rawNodeData.ruleconfig.reportrelation === 'string' // 兼容旧数据
                ? JSON.parse(rawNodeData.ruleconfig.reportrelation)
                : rawNodeData.ruleconfig.reportrelation
              : {},
            userid: rawNodeData.ruleconfig ? rawNodeData.ruleconfig.userid : '',
            username: rawNodeData.ruleconfig ? rawNodeData.ruleconfig.username : ''
          }
        },
        cpUser: {
          type: rawNodeData.stepcptypeid !== undefined ? rawNodeData.stepcptypeid : 17,
          data: rawNodeData.ruleconfig || {}
        },
        auditsucc: rawNodeData.auditsucc || 1,
        stepFields: {
          type: rawNodeData.columnconfig ? rawNodeData.columnconfig.stepfieldtype : 1,
          data: {
            stepFields: parseColumnConfig(rawNodeData.columnconfig),
            globaljs: rawNodeData.columnconfig ? rawNodeData.columnconfig.globaljs : ''
          }
        },
        notfound: rawNodeData.notfound || 1,
        funcname: rawNodeData.funcname || '',
        failed: {
          type: (endnodeconfig.failed && endnodeconfig.failed.type) !== undefined ? endnodeconfig.failed.type : 1,
          userids: (endnodeconfig.failed && endnodeconfig.failed.userids) || '',
          spfuncname: (endnodeconfig.failed && endnodeconfig.failed.spfuncname) || '',
          reportrelation: (endnodeconfig.failed && endnodeconfig.failed.reportrelation) || { type: 1 },
          entityid: (endnodeconfig.failed && endnodeconfig.failed.entityid) || '',
          fieldname: (endnodeconfig.failed && endnodeconfig.failed.fieldname) || '',
        },
        approve: {
          type: (endnodeconfig.approve && endnodeconfig.approve.type) !== undefined ? endnodeconfig.approve.type : 1,
          userids: (endnodeconfig.approve && endnodeconfig.approve.userids) || '',
          spfuncname: (endnodeconfig.approve && endnodeconfig.approve.spfuncname) || '',
          reportrelation: (endnodeconfig.approve && endnodeconfig.approve.reportrelation) || { type: 1 },
          entityid: (endnodeconfig.approve && endnodeconfig.approve.entityid) || '',
          fieldname: (endnodeconfig.approve && endnodeconfig.approve.fieldname) || '',
        },
        isscheduled: rawNodeData.isscheduled || 0,
        deadline: rawNodeData.deadline || 0
      }
      yield put({
        type: 'putState',
        payload: {
          showModals: 'flowStep',
          editingFlowStepForm
        }
      })
    },
    * addNextStep({ payload: stepId }, { select, put }) {
      const { flowSteps, flowPaths } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', stepId])
      // const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId);
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId)
      const newStepId = uuid.v4()
      const newFlowStep = {
        id: newStepId,
        name: '新的审批节点',
        x: flowStep.x + 30,
        y: flowStep.y + 30
      }
      const newPath = {
        from: stepId,
        to: newStepId
      }
      allPathsFromThisFlowStep.forEach(path => {
        path.from = newStepId
      })
      yield put({
        type: 'putState',
        payload: {
          flowSteps: [...flowSteps, newFlowStep],
          flowPaths: [...flowPaths, newPath].map(markBranch)
        }
      })
    },
    * addBranchStep({ payload: stepId }, { select, put }) {
      const { flowSteps, flowPaths } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', stepId])
      const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId)
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId)
      const newStepId = uuid.v4()
      const newFlowStep = {
        id: newStepId,
        name: '新的审批节点',
        x: flowStep.x + 30,
        y: flowStep.y + 30
      }

      const newPathsToNewFlowStep = allPathsToThisFlowStep.map(path => ({ from: path.from, to: newStepId }))
      const newPathsFromNewFlowStep = allPathsFromThisFlowStep.map(path => ({ from: newStepId, to: path.to }))
      yield put({
        type: 'putState',
        payload: {
          flowSteps: [...flowSteps, newFlowStep],
          flowPaths: [...flowPaths, ...newPathsToNewFlowStep, ...newPathsFromNewFlowStep].map(markBranch)
        }
      })
    },
    * delStep({ payload: stepId }, { select, put }) {
      const { flowSteps, flowPaths } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', stepId])
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId)
      if (false && allPathsFromThisFlowStep.some(path => path.to !== -1)) {
        message.error('只能删除审批结束前一个节点')
      } else {
        const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId)
        const thisNextSteps = getNextSteps(stepId, flowSteps, flowPaths)
        const newToNextStepsPaths = _.flatten(
          allPathsToThisFlowStep.map(path => {
            return thisNextSteps.map(step => ({
              from: path.from,
              to: step.id,
              ruleid: null
            }))
          })
        )
        const newFlowPaths = flowPaths.filter(path => path.from !== stepId && path.to !== stepId)
        // newFlowPaths = [...newFlowPaths, ...newToNextStepsPaths];
        // newFlowPaths = newFlowPaths.filter(path => {
        //   return newToNextStepsPaths.every(step => {
        //     return !(path.to === step.to && newFlowPaths.some(p => p.from === path.from && p.to !== step.to));
        //   });
        // }); // 删除短路节点
        yield put({
          type: 'putState',
          payload: {
            flowSteps: [...flowSteps.filter(step => step.id !== stepId)],
            flowPaths: newFlowPaths.map(markBranch)
          }
        })
      }
    },
    * confirmEditingFlowStepForm(action, { select, put }) {
      const { flowSteps, editingFlowStepForm } = yield select(state => state.workflowDesign)
      const flowStep = _.find(flowSteps, ['id', editingFlowStepForm.stepId])

      // 校验
      /**
       * 1	让用户自己选择审批人	0
       2	指定审批人	0
       7	流程发起人	0
       3	会审	1
       0	发起审批	0
       -1	结束审批	0
       5	指定审批人所在团队(特定)	0
       4	指定审批人的角色(特定)	0
       6	指定审批人所在团队及角色(特定)	0
       8	当前审批人所在团队(非下级)	0
       9	当前审批人所在团队及角色(非下级)	0
       10	当前审批人所在团队的上级团队及角色(非下级)	0
       11	当前审批人所在团队的上级团队(非下级)	0
       */
      if (editingFlowStepForm.stepUser.type === -1) {
        if (editingFlowStepForm.failed.type === 3) {
          const { entityid, fieldname, reportrelation } = editingFlowStepForm.failed
          if (!entityid && reportrelation && reportrelation.type === 3) return message.error('请选择表单字段')
          if (!fieldname && reportrelation && reportrelation.type === 3) return message.error('请选择表单用户字段')
          if (!(reportrelation && reportrelation.id)) return message.error('请选择汇报关系')
        }
        if (editingFlowStepForm.approve.type === 3) {
          const { entityid, fieldname, reportrelation } = editingFlowStepForm.approve
          if (!entityid && reportrelation && reportrelation.type === 3) return message.error('请选择表单字段')
          if (!fieldname && reportrelation && reportrelation.type === 3) return message.error('请选择表单用户字段')
          if (!(reportrelation && reportrelation.id)) return message.error('请选择汇报关系')
        }
        if (editingFlowStepForm.failed.type === 2) {
          const { spfuncname } = editingFlowStepForm.failed
          if (!spfuncname) return message.error('输入需要执行的sql语句')
        }
        if (editingFlowStepForm.approve.type === 2) {
          const { spfuncname } = editingFlowStepForm.approve
          if (!spfuncname) return message.error('输入需要执行的sql语句')
        }
        // if (editingFlowStepForm.failed.type === 1) {
        //   const { userids } = editingFlowStepForm.failed
        //   if (!userids) return message.error('请选择传阅人')
        // }

        flowStep.rawNode = {
          ...flowStep.rawNode,
          ruleconfig: {
            ...flowStep.rawNode.ruleconfig,
            endnodeconfig: JSON.stringify({
              failed: editingFlowStepForm.failed,
              approve: editingFlowStepForm.approve
            }),
          },
          funcname: editingFlowStepForm.funcname
        }
      } else {
        if ([1, 2].includes(editingFlowStepForm.nodeType)) {
          const users = editingFlowStepForm.stepUser.data.username.split(',')
          if (users.length < 2) return message.error('请设置多名人员参与会审')
          if (editingFlowStepForm.nodeType === 1) {
            const { auditsucc } = editingFlowStepForm
            if (!auditsucc) return message.error('请设置会审通过人数')
            if (auditsucc > users.length) return message.error('会审通过人数不得超过总人数')
          }
        }
        if (editingFlowStepForm.nodeType === 0) {
          const data = editingFlowStepForm.stepUser.data
          const type = editingFlowStepForm.stepUser.type
          if (data) {
            const { userid, roleid, deptid, fieldname, entityid, isleader, reportrelation, funcname } = data
            if ((type === 5 || type === 6) && !deptid) {
              message.error('请选择团队')
              return
            } else if (type === 2 && !userid) {
              message.error('请选择人员')
              return
            } else if ([802, 112, 116].includes(type) && !entityid) {
              message.error('请选择表单字段')
              return
            } else if ([902, 102, 106].includes(type) && !entityid) {
              message.error('请选择表单字段')
              return
            } else if ([106, 116].includes(type) && !fieldname) {
              message.error('请选择表单团队字段')
              return
            } else if ([802, 112, 902, 102].includes(type) && !fieldname) {
              message.error('请选择表单用户字段')
              return
            } else if ([4, 6, 9, 901, 902, 10, 101, 102, 106].includes(type) && !roleid) {
              message.error('请选择角色')
              return
            } else if ([5, 8, 11, 801, 111, 802, 112, 116].includes(type) && !isleader) {
              message.error('请选择是否领导')
              return
            } else if ([15].includes(type) && reportrelation && reportrelation.type === 3 && !entityid) {
              message.error('请选择表单字段')
              return
            } else if ([15].includes(type) && reportrelation && reportrelation.type === 3 && !fieldname) {
              message.error('请选择表单用户字段')
              return
            } else if ([15].includes(type) && (!reportrelation || !reportrelation.id)) {
              message.error('请选择汇报关系')
              return
            } else if ([16].includes(type) && !funcname) {
              message.error('请填写sql语句')
              return
            }
          }
        }

        const fieldInfo = editingFlowStepForm.stepFields
        const stepfieldtype = fieldInfo ? fieldInfo.type : 1
        const fields = fieldInfo ? (fieldInfo.data.stepFields ? fieldInfo.data.stepFields : []) : []
        const globaljs = stepfieldtype === 3 ? (fieldInfo.data.globaljs ? fieldInfo.data.globaljs : '') : ''
        const uniqCollect = {}

        if (stepfieldtype === 2 && fields && fields.length) {
          for (let i = 0; i < fields.length; i += 1) {
            const item = fields[i]
            if (!item.entityId) return message.error('请设置实体')
            if (!item.fieldId) return message.error('请设置字段')
            if (uniqCollect[item.entityId + item.fieldId]) return message.error('不可添加相同字段')
            uniqCollect[item.entityId + item.fieldId] = 1
          }
        }

        const reportrelationObj = editingFlowStepForm.stepUser.data.reportrelation || {}
        if (!(reportrelationObj && reportrelationObj.type)) reportrelationObj.type = 1
        const reportrelation = reportrelationObj ? JSON.stringify(reportrelationObj) : ''

        flowStep.rawNode = {
          ...flowStep.rawNode,
          auditnum: editingFlowStepForm.nodeType === 0 ? 1 : (editingFlowStepForm.stepUser.data.userid && editingFlowStepForm.stepUser.data.userid.split(',').length),
          auditsucc: editingFlowStepForm.nodeType === 0 ? 1 : editingFlowStepForm.nodeType === 2 ? (editingFlowStepForm.stepUser.data.userid && editingFlowStepForm.stepUser.data.userid.split(',').length) : editingFlowStepForm.auditsucc,
          nodetype: editingFlowStepForm.nodeType,
          ruleconfig: {
            ...editingFlowStepForm.stepUser.data,
            reportrelation,
            cpuserid: editingFlowStepForm.cpUser.data.cpuserid,
            cpusername: editingFlowStepForm.cpUser.data.cpusername,
            cpfuncname: editingFlowStepForm.cpUser.data.cpfuncname
          },
          steptypeid: editingFlowStepForm.stepUser.type,
          stepcptypeid: editingFlowStepForm.cpUser.type,
          columnconfig: {
            stepfieldtype: editingFlowStepForm.nodeType === 2 ? 1 : stepfieldtype,
            globaljs,
            ...formatFieldsToColumnConfig(fields)
          },
          notfound: editingFlowStepForm.notfound || 1,
          funcname: editingFlowStepForm.funcname,
          isscheduled: editingFlowStepForm.isscheduled || 0,
          deadline: editingFlowStepForm.deadline || 0
        }
      }
      yield put({
        type: 'putState',
        payload: {
          showModals: '',
          editingFlowStepForm: null,
          flowSteps: [...flowSteps]
        }
      })
    },
    * saveFlowDesign({ payload: flowNodePosition }, { select, put, call }) {
      const { flowId, flowSteps, flowPaths } = yield select(state => state.workflowDesign)
      if (flowSteps.some(step => !step.rawNode)) {
        message.error('请配置节点审批人')
        return
      }
      if (!validateFlowSteps(flowSteps, flowPaths)) {
        message.error('请检查流程节点是否完整')
        return
      }
      try {
        const nodeIdCollect = {}
        const nodes = flowSteps.map(({ id, name, rawNode }) => {
          const {
            nodetype,
            steptypeid,
            stepcptypeid,
            notfound,
            ruleconfig,
            columnconfig,
            auditnum,
            auditsucc,
            funcname,
            endnodeconfig,
            isscheduled,
            deadline
          } = rawNode
          const newNodeId = (nodeIdCollect[id] = uuid.v4())
          return {
            nodename: name,
            nodeid: newNodeId,
            auditnum,
            nodetype,
            steptypeid,
            stepcptypeid,
            notfound,
            ruleconfig,
            columnconfig,
            auditsucc,
            nodeevent: funcname,
            nodeconfig: flowNodePosition[id],
            endnodeconfig,
            isscheduled: isscheduled || 0,
            deadline: deadline || 0
          }
        })
        const lines = flowPaths.map(path => ({
          fromnodeid: nodeIdCollect[path.from] || '',
          tonodeid: nodeIdCollect[path.to] || '',
          ruleid: path.isBranch ? path.ruleid : null
        }))
        const params = { flowId, nodes, lines }
        yield call(saveFlowJSON, params)
        message.success('保存成功')
      } catch (e) {
        message.error(e.message || '保存失败')
      }
    },
    * editBranchRule({ payload: flowPath }, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editingPath: flowPath,
          showModals: 'branch'
        }
      })
    },
    * cancelBranchRule({ payload: flowPath }, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editingPath: null,
          showModals: ''
        }
      })
    },
    * saveBranchRule({ payload: ruleId }, { select, put }) {
      const { editingPath, flowPaths } = yield select(state => state.workflowDesign)
      editingPath.ruleid = ruleId
      yield put({
        type: 'putState',
        payload: {
          editingPath: null,
          showModals: '',
          flowPaths: [...flowPaths]
        }
      })
    },
    * userConnectNode({ payload: connInfo }, { select, put }) {
      const { flowPaths } = yield select(state => state.workflowDesign)
      const { source, target } = connInfo
      const getNodeId = elem => {
        return elem.id.replace(/workflow-(.+)/, '$1')
      }
      const fromNodeId = getNodeId(source)
      const endNodeId = getNodeId(target)
      if (flowPaths.some(path => path.from === fromNodeId && path.to === endNodeId)) return
      const newPath = {
        from: fromNodeId,
        to: endNodeId,
        ruleid: null
      }
      yield put({
        type: 'putState',
        payload: {
          flowPaths: [...flowPaths, newPath].map(markBranch)
        }
      })
    },
    * userDisConnectNode({ payload: connInfo }, { select, put }) {
      const { flowPaths } = yield select(state => state.workflowDesign)
      const { source, target } = connInfo
      const getNodeId = elem => {
        return elem.id.replace(/workflow-(.+)/, '$1')
      }
      const fromNodeId = getNodeId(source)
      const endNodeId = getNodeId(target)
      yield put({
        type: 'putState',
        payload: {
          flowPaths: flowPaths.filter(path => path.from !== fromNodeId || path.to !== endNodeId).map(markBranch)
        }
      })
    },
    * createNode(action, { select, put }) {
      const { flowSteps } = yield select(state => state.workflowDesign)
      const newFlowStep = {
        id: uuid.v4(),
        name: '新的审批节点',
        x: 30,
        y: 30
      }

      newFlowStep.rawNode = {
        auditnum: 1,
        auditsucc: 1,
        nodetype: 0,
        ruleconfig: { reportrelation: JSON.stringify({ type: 1 }) },
        steptypeid: 1,
        stepcptypeid: 17,
        columnconfig: {},
        notfound: 1,
        funcname: '',
        isscheduled: 0,
        deadline: 0
      }

      yield put({
        type: 'putState',
        payload: {
          flowSteps: [...flowSteps, newFlowStep]
        }
      })
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    resetState() {
      return {
        rawData: null,
        flowId: '',
        flowSteps: [],
        flowPaths: [],
        flowStepsByIdCollection: {},
        showModals: '',
        editingFlowStepForm: null,
        flowEntities: []
      }
    }
  }
}
