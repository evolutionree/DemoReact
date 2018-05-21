/**
 * Created by 0291 on 2018/5/16.
 */
import { message } from 'antd';
import { savepwdpolicy, getpwdpolicy } from '../services/passwordstrategy';

export default {
  namespace: 'passwordstrategy',
  state: {
    pwdpolicyData: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/passwordstrategy') {
          dispatch({ type: 'querypwdpolicy' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *querypwdpolicy(action, { put, call, select }) {
      try {
        const { data } = yield call(getpwdpolicy);
        yield put({ type: 'putState', payload: { pwdpolicyData: data } });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *save({ payload: data }, { select, call, put }) {
      try {
        yield call(savepwdpolicy, data);
        message.success('保存成功');
        yield put({ type: 'querypwdpolicy' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    resetState() {
      return {
        pwdpolicyData: {}
      }
    }
  }
};
