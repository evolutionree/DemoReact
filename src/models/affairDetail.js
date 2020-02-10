import { message } from 'antd';
import * as _ from 'lodash';
import { routerRedux } from 'dva/router';
import { getEntcommDetail, getGeneralProtocol, editEntcomm } from '../services/entcomm';
import { queryFields } from '../services/entity';
import { queryCaseItem, queryNextNodeData, queryCaseDetail, submitCaseItem, submitPreCaseItem, withdraw, canwithdraw } from '../services/workflow';
import { getEditData } from '../utils'

export default {
  namespace: 'affairDetail',
  state: {
    entityId: '00000000-0000-0000-0000-000000000001',
    caseId: null,
    flowDetail: {},
    flowItemList: [],
    flowOperates: {},
    entityDetail: {},
    entityDetailProtocol: [],
    entityEditProtocol: [],
    relentityDetail: {},
    relentityDetailProtocol: [],
    editing: false,
    editData: {},
    editForm: null,
    showModals: '',
    columnConfigForms: {},
    columnConfigFormProtocols: {},
    columnConfigFormInstance: {},
    suggest: '',
    selectedOperate: undefined,
    jointUsers: [],
    nextNodesData: [],
    selectedNextNode: null,
    submitBtnLoading: false,
    showWithDrawBtn: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/affair\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const caseId = match[1];
          dispatch({ type: 'putState', payload: { caseId } });
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload }, { select, put, call }) {
      const {
        entityId,
        caseId,
        entityDetailProtocol,
        relentityDetailProtocol
      } = yield select(state => state.affairDetail);

      // 获取审批详情
      const { data } = yield call(queryCaseDetail, caseId);

      const flowDetail = data.casedetail;
      const entityDetail = data.entitydetail;
      const flowOperates = _.mapKeys(data.caseitem, (value, key) => key.replace('iscan', ''));
      const relentityDetail = data.relatedetail || {};
      const nodetype = flowOperates.nodetype;

      // 处理“审批可改字段”
      if (data.caseitem.columnconfig && data.caseitem.columnconfig.config && data.caseitem.columnconfig.config.length) {
        yield put({ type: 'handleColumnConfig', payload: data.caseitem.columnconfig.config });
      } else {
        yield put({ type: 'putState', payload: { columnConfigForms: {}, columnConfigFormProtocols: {} } });
      }

      const updateObj = {
        flowDetail,
        entityDetail,
        flowOperates,
        relentityDetail
      }

      if (nodetype === 2) updateObj.selectedOperate = -1

      yield put({
        type: 'putState',
        payload: updateObj
      });

      const typeid = (entityDetail && entityDetail.rectype) || (flowDetail && flowDetail.entityid);
      // 获取实体查看协议
      if (!entityDetailProtocol.length && typeid) {
        try {
          const result = yield call(getGeneralProtocol, {
            typeid,
            operatetype: 2
          });
          yield put({ type: 'putState', payload: { entityDetailProtocol: result.data } });
        } catch (e) {
          console.error(e);
          // message.error(e.message || '获取协议失败');
        }
      }

      const relTypeid = relentityDetail.rectype || flowDetail.relentityid;
      if (relTypeid && !relentityDetailProtocol.length) {
        // 获取相关实体查看协议
        try {
          const result = yield call(getGeneralProtocol, {
            typeid: relTypeid,
            operatetype: 2
          });
          yield put({ type: 'putState', payload: { relentityDetailProtocol: result.data } });
        } catch (e) {
          console.error(e);
          // message.error(e.message || '获取协议失败');
        }
      }

      // 获取审批明细
      try {
        const { data: { result, result_ext } } = yield call(queryCaseItem, caseId);
        let count = 0;
        let flowItemList = [];
        const handleList = Array.isArray(result) && result.length ? result : [];
        const connectList = Array.isArray(result_ext) && result_ext.length ? result_ext : [];

        for (const item of handleList) {
          const preItem = flowItemList[flowItemList.length - 1];
          count = (
            preItem &&
            [1, 2].includes(preItem.nodetype) &&
            [1, 2].includes(item.nodetype) &&
            preItem.nodeid === item.nodeid
          ) ? count : count + 1;

          const itemInfo = { ...item, files: item.filejson, count };

          if ([1, 2].includes(item.nodetype) || item.isallowtransfer === 1 || item.isallowsign === 1) {
            const matchList = connectList.filter(o => (o.nodeid === item.nodeid && o.caseitemid === item.caseitemid)).map(o => {
              return {
                nodeid: item.nodeid,
                nodetype: item.nodetype,
                nodename: item.nodename,
                isallowtransfer: item.isallowtransfer,
                isallowsign: item.isallowsign,
                caseitemid: o.caseitemid,
                username: o.username,
                casestatus: o.flowstatus,
                suggest: o.comment,
                files: o.filejson,
                recupdated: o.reccreated,
                operatetype: o.operatetype,
                originaluserid: o.originaluserid,
                count
              };
            });
            if (matchList.length) {
              flowItemList = flowItemList.concat(...matchList);
              // if (item.nodetype === 2) {
              //   flowItemList = flowItemList.concat(...matchList)
              // } else if (item.isallowtransfer === 1) {
              //   matchList.push(itemInfo)
              //   flowItemList = flowItemList.concat(...matchList)
              // }
            } else {
              flowItemList.push(itemInfo);
            }
          } else {
            flowItemList.push(itemInfo);
          }
        }

        const jointUsers = handleList.filter(o => o.nodetype === 1).map(o => o.handleuser);

        yield put({ type: 'putState', payload: { flowItemList, jointUsers } });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取审批明细失败');
      }


      // 获取撤回按钮权限
      try {
        const params = { caseid: flowDetail.caseid }
        const { data } = yield call(canwithdraw, params);
        yield put({ type: 'putState', payload: { showWithDrawBtn: !!(data && data.canwithdraw) } });
      } catch (e) {
        console.error(e);
      }
    },
    *handleColumnConfig({ payload: columnConfig }, { select, call, put }) {
      const promises = columnConfig.map(item => queryFields(item.entityId).then(result => {
        const allFields = result.data.entityfieldpros;
        const _fields = item.fields.map(_item => {
          const { fieldId, isRequired } = _item;
          const match = _.find(allFields, ['fieldid', fieldId]);
          if (!match) return null;
          return {
            ...match,
            fieldconfig: match.fieldconfig ? { ...match.fieldconfig, isVisible: 1 } : { isVisible: 1 },
            isrequire: !!isRequired
          };
        });
        return {
          entityId: item.entityId,
          fields: _fields.filter(i => !!i)
        };
      }));
      const getAllResult = () => Promise.all(promises);

      try {
        const result = yield call(getAllResult);
        const { flowDetail, entityDetail, relentityDetail } = yield select(state => state.affairDetail);
        const dynamicForms = {};
        const dynamicFormProtocols = {};
        result.forEach(item => {
          const entityId = item.entityId;
          dynamicForms[entityId] = {};
          dynamicFormProtocols[entityId] = item.fields;

          if (entityId === flowDetail.entityid) {
            dynamicForms[entityId] = getEditData(_.cloneDeep(entityDetail), item.fields);
          } else if (entityId === flowDetail.relentityid) {
            dynamicForms[entityId] = getEditData(_.cloneDeep(relentityDetail), item.fields);
          }
        });

        yield put({ type: 'putState', payload: { columnConfigForms: dynamicForms, columnConfigFormProtocols: dynamicFormProtocols } });
      } catch (e) {
        message.error('获取动态表单字段出错');
      }
    },
    *fetchEntityDetail({ payload: { entityId, recordId } }, { call, put }) {
      try {
        const params = {
          entityId,
          recId: recordId,
          needPower: 1 // TODO 跑权限
        };
        const { data: { detail: entityDetail } } = yield call(getEntcommDetail, params);
        yield put({ type: 'putState', payload: { entityDetail } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *startEdit(action, { select, put, call }) {
      let { entityEditProtocol } = yield select(state => state.affairDetail);
      const { entityDetail } = yield select(state => state.affairDetail);
      if (!entityEditProtocol.length) {
        const { flowDetail, entityDetail } = yield select(state => state.affairDetail);
        const rectype = entityDetail.rectype || flowDetail.entityid;
        if (!rectype) return;
        try {
          const result = yield call(getGeneralProtocol, {
            typeid: rectype,
            operatetype: 1
          });
          entityEditProtocol = result.data;

          yield put({ type: 'putState', payload: { entityEditProtocol } });
        } catch (e) {
          message.error(e.message || '获取协议失败');
        }
      }
      yield put({
        type: 'putState',
        payload: {
          editing: true,
          editData: getEditData(_.cloneDeep(entityDetail), entityEditProtocol)
        }
      });
    },
    *fetchEditProtocol(action, { select, put, call }) {
      const { flowDetail, entityDetail } = yield select(state => state.affairDetail);
      const rectype = entityDetail.rectype || flowDetail.entityid;
      if (!rectype) return;
      try {
        const { data: entityEditProtocol } = yield call(getGeneralProtocol, {
          typeid: rectype,
          operatetype: 1
        });
        yield put({ type: 'putState', payload: { entityEditProtocol } });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *cancelEdit(action, { put }) {
      yield put({
        type: 'putState',
        payload: {
          editing: false,
          editData: {}
        }
      });
    },
    *saveEdit(action, { select, put, call, cps }) {
      const { editForm } = yield select(state => state.affairDetail);
      try {
        const values = yield cps(editForm.validateFields);
        yield put({ type: 'postEdit', payload: values });
      } catch (e) {
        message.error('请检查表单');
      }
    },
    *postEdit({ payload: formData }, { select, put, call }) {
      const { flowDetail, entityDetail } = yield select(state => state.affairDetail);
      try {
        const params = {
          typeid: entityDetail.rectype || flowDetail.entityid,
          recid: entityDetail.recid,
          fielddata: formData
        };
        yield call(editEntcomm, params);
        message.success('保存成功');
        yield put({ type: 'cancelEdit' });
        yield put({
          type: 'fetchEntityDetail',
          payload: { entityId: params.typeid, recordId: params.recid }
        });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *submitAuditCase({ payload: { handleuser, copyuser } }, { select, call, put }) {
      const {
        selectedOperate,
        suggest,
        caseId,
        flowDetail,
        selectedNextNode,
        columnConfigForms,
        columnConfigFormProtocols
      } = yield select(state => state.affairDetail);

      let nodeid = '00000000-0000-0000-0000-000000000000';
      let nodenum = flowDetail.nodenum;
      if (selectedOperate === 1 || selectedOperate === 4) {
        nodeid = selectedNextNode.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000';
        nodenum = selectedNextNode.nodeinfo.nodenum;
      }
      try {
        const params = {
          caseId,
          nodeid,
          nodenum,
          choicestatus: selectedOperate,
          suggest,
          handleuser,
          copyuser,
          casedata: getCaseData()
        };
        const { data, error_msg } = yield call(submitCaseItem, params);
        message.success(error_msg || '提交成功');

        // 提交完审批后，返回列表
        const { navStack } = yield select(state => state.navHistory);
        if (navStack.length >= 2) {
          yield put(routerRedux.goBack());
        } else {
          yield put(routerRedux.push({
            pathname: 'affair-list'
          }));
        }
      } catch (e) {
        message.error(e.message || '提交数据失败');
      }

      function getCaseData() {
        const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
        const data = formArray.map(item => {
          const { entityId } = item;
          const submitFields = columnConfigFormProtocols[entityId].map(item => item.fieldname);
          const fieldsValue = _.pick(columnConfigForms[entityId], submitFields);
          return {
            entityid: entityId,
            fields: fieldsValue
          };
        });
        return { data };
      }
    },
    *submitPreAuditCase(action, { select, call, put }) {
      const {
        selectedOperate,
        suggest,
        caseId,
        flowDetail,
        columnConfigForms,
        columnConfigFormProtocols
      } = yield select(state => state.affairDetail);

      // if (selectedOperate === 1 || selectedOperate === 4) {
      yield put({ type: 'showModals', payload: 'workflowCase' });
      yield put({ type: 'putState', payload: { submitBtnLoading: true } });
      // } else {
      //   try {
      //     const params = {
      //       caseId,
      //       nodenum: flowDetail.nodenum,
      //       choicestatus: selectedOperate,
      //       suggest,
      //       casedata: getCaseData()
      //     };
      //     const { data, error_msg } = yield call(submitCaseItem, params);
      //     message.success(error_msg || '提交成功');
      //     // 提交完审批后，返回列表
      //     const { navStack } = yield select(state => state.navHistory);
      //     if (navStack.length >= 2) {
      //       yield put(routerRedux.goBack());
      //     } else {
      //       yield put(routerRedux.push({
      //         pathname: 'affair-list'
      //       }));
      //     }
      //   } catch (e) {
      //     message.error(e.message);
      //   }
      // }

      function getCaseData() {
        const formArray = _.map(columnConfigFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
        const data = formArray.map(item => {
          const { entityId } = item;
          const submitFields = columnConfigFormProtocols[entityId].map(item => item.fieldname);
          const fieldsValue = _.pick(columnConfigForms[entityId], submitFields);
          return {
            entityid: entityId,
            fields: fieldsValue
          };
        });
        return { data };
      }
    },
    *closeFlow(action, { select, put, call }) {
      try {
        const { caseId } = yield select(state => state.affairDetail);
        const params = {
          caseid: caseId,
          nodenum: -1,
          suggest: '',
          ChoiceStatus: 1
        };
        yield call(submitCaseItem, params);
        message.success('提交成功');

        // 提交完审批后，返回列表
        const { navStack } = yield select(state => state.navHistory);
        if (navStack.length >= 2) {
          yield put(routerRedux.goBack());
        } else {
          yield put(routerRedux.push({
            pathname: 'affair-list'
          }));
        }
      } catch (e) {
        message.error(e.message || '提交失败');
      }
    },
    *onCaseModalCancel(action, { select, call, put }) {
      yield put({ type: 'showModals', payload: '' });
      yield put({ type: 'putState', payload: { submitBtnLoading: false } });
      // const { caseId } = yield select(state => state.affairDetail);
      // yield put({ type: 'init', payload: caseId });
    },
    *onCaseModalDone(action, { select, call, put }) {
      // message.success('提交成功');
      yield put({ type: 'showModals', payload: '' });
      yield put({ type: 'putState', payload: { submitBtnLoading: false } });
      const { caseId } = yield select(state => state.affairDetail);
      // yield put({ type: 'init', payload: caseId });

      const { navStack } = yield select(state => state.navHistory);
      if (navStack.length >= 2) {
        yield put(routerRedux.goBack());
      } else {
        yield put(routerRedux.push({
          pathname: 'affair-list'
        }));
      }
    },
    *WithDraw(_, { put, call, select }) {
      const { flowDetail, flowOperates } = yield select(state => state.affairDetail)
      try {
        const params = { caseid: flowDetail.caseid }
        const res = yield call(withdraw, params)
        message.success(res.error_msg || '撤回成功')
        yield put({ type: 'onCaseModalDone' })
      } catch (e) {
        console.error(e.message)
        message.error(e.message)
      }
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals
      };
    },
    resetState() {
      return {
        entityId: '00000000-0000-0000-0000-000000000001',
        caseId: null,
        flowDetail: {},
        flowItemList: [],
        flowOperates: {},
        entityDetail: {},
        entityDetailProtocol: [],
        entityEditProtocol: [],
        relentityDetail: {},
        relentityDetailProtocol: [],
        editing: false,
        editData: {},
        editForm: null,
        showModals: '',
        columnConfigForms: {},
        columnConfigFormProtocols: {},
        columnConfigFormInstance: {},
        suggest: '',
        selectedOperate: undefined,
        showWithDrawBtn: false,
        submitBtnLoading: false
      };
    }
  }
};
