import { message } from 'antd';
import { queryPrintTemplates } from '../services/printTemplate';

export default {
  namespace: 'printEntity',
  state: {
    currentStep: 0, // 0/1/2..
    entityId: null,
    recordId: null,
    templateList: [],
    outputTypes: [
      { type: 'link', label: '直接下载' }
    ]
  },
  subscriptions: {

  },
  effects: {
    *initPrint({ payload: printConfig }, { put, call, select }) {
      try {
        const params = {
          entityid: printConfig.entityId,
          recstate: 1
        };
        const { data } = yield call(queryPrintTemplates, params);
        yield put({
          type: 'putState',
          payload: {
            currentStep: 1,
            templateList: data,
            entityId: printConfig.entityId,
            recordId: printConfig.recordId
          }
        });
      } catch (e) {
        message.error(e.message || '获取打印模板失败');
      }
    },
    *cancel(action, { put }) {
      yield put({
        type: 'putState', payload: {
          currentStep: 0,
          templateList: []
        }
      });
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    }
  }
};
