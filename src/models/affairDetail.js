import { message } from 'antd';
import * as _ from 'lodash';
import { routerRedux } from 'dva/router';
import { getEntcommDetail, getGeneralProtocol, editEntcomm } from '../services/entcomm';
import { queryFields } from '../services/entity';
import { queryCaseItem, queryNextNodeData, queryCaseDetail, submitCaseItem, submitPreCaseItem } from '../services/workflow';

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

    nextNodesData: [],
    selectedNextNode: null,

    submitBtnLoading: false
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
    *init(action, { select, put, call }) {
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

      // 处理“审批可改字段”
      if (data.caseitem.columnconfig && data.caseitem.columnconfig.config && data.caseitem.columnconfig.config.length) {
        yield put({ type: 'handleColumnConfig', payload: data.caseitem.columnconfig.config });
      } else {
        yield put({ type: 'putState', payload: { columnConfigForms: {}, columnConfigFormProtocols: {} } });
      }

      yield put({
        type: 'putState',
        payload: {
          flowDetail,
          entityDetail,
          flowOperates,
          relentityDetail
        }
      });

      // 17/12/11 改为用预提交的方式，不获取nextdata了
      // 获取下一步节点
      if (flowDetail.nodenum !== -1 && false) {
        try {
          const { data: nextNodesData } = yield call(queryNextNodeData, caseId);
          yield put({
            type: 'putState',
            payload: {
              nextNodesData,
              selectedNextNode: nextNodesData[0]
            }
          });
        } catch (e) {
          message.error(e.message || '获取下一步节点数据失败');
        }
      }

      // 获取实体查看协议
      if (!entityDetailProtocol.length) {
        try {
          const result = yield call(getGeneralProtocol, {
            typeid: entityDetail.rectype || flowDetail.entityid,
            operatetype: 2
          });
          yield put({ type: 'putState', payload: { entityDetailProtocol: result.data } });
        } catch (e) {
          console.error(e);
          message.error(e.message || '获取协议失败');
        }
      }

      if (data.relatedetail && !relentityDetailProtocol.length) {
        // 获取相关实体查看协议
        try {
          const result = yield call(getGeneralProtocol, {
            typeid: relentityDetail.rectype || flowDetail.relentityid,
            operatetype: 2
          });
          yield put({ type: 'putState', payload: { relentityDetailProtocol: result.data } });
        } catch (e) {
          console.error(e);
          message.error(e.message || '获取协议失败');
        }
      }

      // 获取审批明细
      try {
        const { data: flowItemList } = yield call(queryCaseItem, caseId);
        yield put({ type: 'putState', payload: { flowItemList } });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取审批明细失败');
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
            dynamicForms[entityId] = _.cloneDeep(entityDetail);
          } else if (entityId === flowDetail.relentityid) {
            dynamicForms[entityId] = _.cloneDeep(relentityDetail);
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
      // fix 表格控件，加typeid
      function genEditData(recordDetail, protocol) {
        const retData = { ...recordDetail };
        protocol.forEach(field => {
          const { controltype, fieldname, fieldconfig } = field;
          if (controltype === 24 && retData[fieldname]) {
            retData[fieldname] = retData[fieldname].map(item => {
              return {
                TypeId: fieldconfig.entityId,
                FieldData: item
              };
            });
          }
        });
        return retData;
      }
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
          editData: genEditData(_.cloneDeep(entityDetail), entityEditProtocol)
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
        submitBtnLoading: false
      };
    }
  }
};
