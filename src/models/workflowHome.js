import { message } from 'antd';
import { queryFlowJSONv2 } from '../services/workflow';

export default {
  namespace: 'workflowHome',
  state: {
    flowName: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/workflow\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const flowId = match[1];
          dispatch({ type: 'putState', payload: { flowId } });
          dispatch({ type: 'queryWorkflowInfo' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryWorkflowInfo(action, { select, put, call }) {
      const { flowId } = yield select(state => state.workflowHome);
      try {
        // TODO 获取流程详情
        const { data } = yield call(queryFlowJSONv2, flowId);
        const flowInfo = data.flow[0];
        yield put({ type: 'putState', payload: { flowName: flowInfo && flowInfo.flowname } });
      } catch (e) {
        message.error(e.message || '获取流程数据失败');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
