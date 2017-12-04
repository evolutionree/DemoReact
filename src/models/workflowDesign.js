import { message } from 'antd';
import * as _ from 'lodash';
import uuid from 'uuid';
import { queryFlowJSONv2, saveFlowJSON } from '../services/workflow';
import { queryFields } from '../services/entity';

// 654209d5-3506-48eb-b5d2-0e0ea2ba7c84

/**
 * 格式化服务端数据，并为节点初始化坐标
 * @param data { lines, nodes }
 * @returns {{flowNodes: Array, flowLines: Array}}
 */
function parseFlowJSON(data) {
  if (!data.nodes || !data.nodes.length) {
    return { flowSteps: [], flowPaths: [], flowStepsByIdCollection: {} };
  }

  const nodesByIdCollection = data.nodes.reduce((collect, curr) => {
    return { ...collect, [curr.nodeid]: curr };
  }, {});
  const nodesByPositionCollection = {};

  // 用 position 标记层级
  const startNode = _.find(data.nodes, node => node.steptypeid === 0);
  startNode.position = 0;
  let restLines = data.lines;
  while (restLines.length) {
    restLines = loopRestLines(restLines);
  }
  Object.keys(nodesByIdCollection).forEach(id => {
    const node = nodesByIdCollection[id];
    const position = node.position;
    if (!nodesByPositionCollection[position]) {
      nodesByPositionCollection[position] = [];
    }
    nodesByPositionCollection[position].push(node);
  });

  let maxCount = 0;
  Object.keys(nodesByPositionCollection).forEach(key => {
    const nodes = nodesByPositionCollection[key];
    const count = nodes.length;
    maxCount = Math.max(count, maxCount);
  });

  const nodeHeight = 150;
  const nodeWidth = 180;
  const nodeWidthSmall = 180;
  const nodeVMargin = 20;
  const nodeHMargin = 100;
  const totalHeight = (maxCount * nodeHeight) + ((maxCount - 1) * nodeVMargin);
  Object.keys(nodesByPositionCollection).forEach(key => {
    const nodes = nodesByPositionCollection[key];
    const count = nodes.length;
    const firstNodeTopPosition = (totalHeight - (count * nodeHeight) - ((count - 1) * nodeVMargin)) / 2;
    nodes.forEach((node, index) => {
      if (key === '0') {
        node.x = 0;
      } else if (key === '1') {
        node.x = nodeWidthSmall + nodeHMargin;
      } else {
        node.x = ((node.position - 1) * (nodeWidth + nodeHMargin)) + nodeWidthSmall + nodeHMargin;
      }
      node.y = firstNodeTopPosition + (index * (nodeHeight + nodeVMargin));
    });
  });

  const xOffset = 30;
  const yOffset = 80;
  data.nodes.forEach(node => {
    if (node.y !== undefined) {
      node.y += yOffset;
    }
    if (node.x !== undefined) {
      node.x += xOffset;
    }
  });

  function loopRestLines(lines) {
    const nextRest = [...lines];
    lines.forEach((line, index) => {
      const { fromnodeid: fromId, tonodeid: endId } = line;
      const fromNode = nodesByIdCollection[fromId];
      const endNode = nodesByIdCollection[endId];
      if (fromNode.position === undefined) return;
      endNode.position = endNode.position !== undefined
        ? Math.max(endNode.position, fromNode.position + 1)
        : (fromNode.position + 1);
      nextRest.splice(index, 1);
    });
    return nextRest;
  }

  const flowSteps = data.nodes.map(item => ({
    id: item.nodeid,
    name: item.nodename,
    x: item.x,
    y: item.y,
    rawNode: item
  }));
  const flowPaths = data.lines.map(item => ({
    from: item.fromnodeid,
    to: item.tonodeid,
    ruleid: item.ruleid
  })).map(markBranch);
  const flowStepsByIdCollection = flowSteps.reduce((collect, curr) => {
    return { ...collect, [curr.id]: curr };
  }, {});
  return { flowSteps, flowPaths, flowStepsByIdCollection };
}
function getInitialFlowJSON() {
  const startNodeId = uuid.v1();
  const endNodeId = uuid.v1();
  const nextNodeId = uuid.v1();
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
        // auditnum: 1,
        // nodetype: 0,
        // steptypeid: 9,
        columnconfig: {},
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
  };
}

function parseColumnConfig(columnConfig) {
  if (columnConfig && columnConfig.config && columnConfig.config.length) {
    return _.flatMap(
      columnConfig.config,
      item => item.fields.map(
        field => ({ ...field, entityId: item.entityId })
      )
    );
  }
  return [];
}

function formatFieldsToColumnConfig(fields) {
  const config = [];
  const collect = {};
  fields.forEach(field => {
    const { entityId, fieldId, isRequired } = field;
    let innerFields = collect[entityId];
    if (!innerFields) {
      innerFields = collect[entityId] = [];
      config.push({
        entityId,
        fields: innerFields
      });
    }
    innerFields.push({
      fieldId,
      isRequired
    });
  });
  return { config };
}

function markBranch(path, index, allPaths) {
  const isBranch = allPaths.some(p => p.from === path.from && p.to !== path.to);
  return {
    ...path,
    isBranch
  };
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
        const pathReg = /^\/workflow\/([^/]+)\/design/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const flowId = match[1];
          dispatch({ type: 'putState', payload: { flowId } });
          dispatch({ type: 'queryFlowJSON' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryFlowJSON(action, { select, put, call }) {
      const { flowId } = yield select(state => state.workflowHome);
      // try {
        const { data } = yield call(queryFlowJSONv2, flowId);
        const { flowSteps, flowPaths } = parseFlowJSON(data);
        yield put({ type: 'putState', payload: { flowSteps, flowPaths } });

        const flowInfo = data.flow[0];
        yield put({ type: 'queryFlowEntity', payload: flowInfo });
      // } catch (e) {
      //   message.error(e.message || '获取流程数据失败');
      // }
    },
    *queryFlowEntity({ payload: flowInfo }, { select, put, call }) {
      try {
        const { entityid, entityname, relentityid, relentityname } = flowInfo;
        const { data } = yield call(queryFields, entityid);
        const flowEntities = [{
          entityid,
          entityname,
          fields: data.entityfieldpros
        }];
        if (relentityid) {
          const { data: data2 } = yield call(queryFields, relentityid);
          flowEntities.push({
            entityid: relentityid,
            entityname: relentityname,
            fields: data2.entityfieldpros
          });
        }
        yield put({ type: 'putState', payload: { flowEntities } });
      } catch (e) {
        message.error(e.message || '获取流程实体数据失败');
      }
    },
    *generateFlowJSON(action, { select, put, call }) {
      const { flowSteps, flowPaths } = parseFlowJSON(getInitialFlowJSON());
      yield put({ type: 'putState', payload: { flowSteps, flowPaths } });
    },
    *changeStepName({ payload: { stepId, name } }, { select, put }) {
      const { flowSteps } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', stepId]);
      flowStep.name = name;
      yield put({
        type: 'putState',
        payload: { flowSteps: [...flowSteps] }
      });
    },
    *openStepModal({ payload: stepId }, { select, put }) {
      const { flowSteps } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', stepId]);
      const rawNodeData = flowStep.rawNode || {};
      const editingFlowStepForm = {
        stepId: flowStep.id,
        nodeType: rawNodeData.nodetype || 0,
        stepUser: {
          type: rawNodeData.steptypeid || 1,
          data: rawNodeData.ruleconfig || {}
        },
        auditsucc: rawNodeData.auditsucc || 1,
        stepFields: parseColumnConfig(rawNodeData.columnconfig)
      };
      yield put({
        type: 'putState',
        payload: {
          showModals: 'flowStep',
          editingFlowStepForm
        }
      });
    },
    *addNextStep({ payload: stepId }, { select, put }) {
      const {
        flowSteps,
        flowPaths
      } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', stepId]);
      // const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId);
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId);
      const newStepId = uuid.v1();
      const newFlowStep = {
        id: newStepId,
        name: '新的审批节点',
        x: flowStep.x + 30,
        y: flowStep.y + 30
      };
      const newPath = {
        from: stepId,
        to: newStepId
      };
      allPathsFromThisFlowStep.forEach(path => {
        path.from = newStepId;
      });
      yield put({
        type: 'putState',
        payload: {
          flowSteps: [...flowSteps, newFlowStep],
          flowPaths: [...flowPaths, newPath].map(markBranch)
        }
      });

      function getMaxStepId(steps) {
        let max = 0;
        steps.forEach(step => {
          max = Math.max(max, step.id);
        });
        return max;
      }
    },
    *addBranchStep({ payload: stepId }, { select, put }) {
      const {
        flowSteps,
        flowPaths
      } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', stepId]);
      const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId);
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId);
      const newStepId = uuid.v1();
      const newFlowStep = {
        id: newStepId,
        name: '新的审批节点',
        x: flowStep.x + 30,
        y: flowStep.y + 30
      };

      const newPathsToNewFlowStep = allPathsToThisFlowStep.map(path => ({ from: path.from, to: newStepId }));
      const newPathsFromNewFlowStep = allPathsFromThisFlowStep.map(path => ({ from: newStepId, to: path.to }));
      yield put({
        type: 'putState',
        payload: {
          flowSteps: [...flowSteps, newFlowStep],
          flowPaths: [...flowPaths, ...newPathsToNewFlowStep, ...newPathsFromNewFlowStep].map(markBranch)
        }
      });

      function getMaxStepId(steps) {
        let max = 0;
        steps.forEach(step => {
          max = Math.max(max, step.id);
        });
        return max;
      }
    },
    *delStep({ payload: stepId }, { select, put }) {
      const {
        flowSteps,
        flowPaths
      } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', stepId]);
      const allPathsFromThisFlowStep = flowPaths.filter(path => path.from === stepId);
      if (allPathsFromThisFlowStep.some(path => path.to !== -1)) {
        message.error('只能删除审批结束前一个节点');
      } else {
        const allPathsToThisFlowStep = flowPaths.filter(path => path.to === stepId);
        allPathsToThisFlowStep.forEach(path => path.to = -1);
        let newFlowPaths = flowPaths.filter(path => path.from !== stepId);
        newFlowPaths = newFlowPaths.filter(path => {
          return !(path.to === -1 && newFlowPaths.some(p => p.from === path.from && p.to !== -1));
        }); // 删除短路节点
        yield put({
          type: 'putState',
          payload: {
            flowSteps: [...flowSteps.filter(step => step.id !== stepId)],
            flowPaths: newFlowPaths.map(markBranch)
          }
        });
      }
    },
    *confirmEditingFlowStepForm(action, { select, put }) {
      const { flowSteps, editingFlowStepForm } = yield select(state => state.workflowDesign);
      const flowStep = _.find(flowSteps, ['id', editingFlowStepForm.stepId]);

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
      if (editingFlowStepForm.nodeType === 1) {
        const users = editingFlowStepForm.stepUser.data.username.split(',');
        if (users.length < 2) {
          message.error('请设置多名人员参与会审');
          return;
        }
        const { auditsucc } = editingFlowStepForm;
        if (!auditsucc) return message.error('请设置会审通过人数');
        if (auditsucc > users.length) return message.error('会审通过人数不得超过总人数');
      }
      if (editingFlowStepForm.nodeType === 0) {
        const data = editingFlowStepForm.stepUser.data;
        const type = editingFlowStepForm.stepUser.type;
        if (data) {
          const { userid, roleid, deptid } = data;
          if ((type === 5 || type === 6) && !deptid) {
            message.error('请选择团队');
            return;
          } else if ((type === 4 || type === 6) && !roleid) {
            message.error('请选择角色');
            return;
          } else if (type === 2 && !userid) {
            message.error('请选择人员');
            return;
          }
        }
      }

      const fields = editingFlowStepForm.stepFields;
      const uniqCollect = {};
      if (fields && fields.length) {
        for (let i = 0; i < fields.length; i += 1) {
          const item = fields[i];
          if (!item.entityId) return message.error('请设置实体');
          if (!item.fieldId) return message.error('请设置字段');
          if (uniqCollect[item.entityId + item.fieldId]) return message.error('不可添加相同字段');
          uniqCollect[item.entityId + item.fieldId] = 1;
        }
      }

      flowStep.rawNode = {
        ...flowStep.rawNode,
        auditnum: editingFlowStepForm.nodeType === 0 ? 1 : editingFlowStepForm.stepUser.data.userid.split(',').length,
        auditsucc: editingFlowStepForm.nodeType === 0 ? 1 : editingFlowStepForm.auditsucc,
        nodetype: editingFlowStepForm.nodeType,
        ruleconfig: editingFlowStepForm.stepUser.data,
        steptypeid: editingFlowStepForm.stepUser.type,
        columnconfig: formatFieldsToColumnConfig(fields)
      };
      yield put({
        type: 'putState',
        payload: {
          showModals: '',
          editingFlowStepForm: null,
          flowSteps: [...flowSteps]
        }
      });
    },
    *saveFlowDesign(action, { select, put, call }) {
      const { flowId, flowSteps, flowPaths } = yield select(state => state.workflowDesign);
      if (flowSteps.some(step => !step.rawNode)) {
        message.error('请配置节点审批人');
        return;
      }
      try {
        const nodes = flowSteps.map(({ id, name, rawNode }) => {
          const { nodetype, steptypeid, ruleconfig, columnconfig, auditnum, auditsucc } = rawNode;
          return {
            nodename: name,
            nodeid: id,
            auditnum,
            nodetype,
            steptypeid,
            ruleconfig,
            columnconfig,
            auditsucc
          };
        });
        const lines = flowPaths.map(path => ({
          fromnodeid: path.from,
          tonodeid: path.to,
          ruleid: null
        }));
        const params = { flowId, nodes, lines };
        yield call(saveFlowJSON, params);
        message.success('保存成功');
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *editBranchRule({ payload: flowPath }, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editingPath: flowPath,
          showModals: 'branch'
        }
      });
    },
    *cancelBranchRule({ payload: flowPath }, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editingPath: null,
          showModals: ''
        }
      });
    },
    *saveBranchRule({ payload: ruleId }, { select, put }) {
      const { editingPath, flowPaths } = yield select(state => state.workflowDesign);
      editingPath.ruleid = ruleId;
      yield put({
        type: 'putState',
        payload: {
          editingPath: null,
          showModals: '',
          flowPaths: [...flowPaths]
        }
      });
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
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
      };
    }
  }
};
