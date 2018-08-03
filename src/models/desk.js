/**
 * Created by 0291 on 2018/8/3.
 */
import { message } from 'antd';
import { getdesktop } from '../services/deskConfig.js';
import _ from 'lodash';

export default {
  namespace: 'desk',
  state: {
    leftComponent: [],
    rightComponent: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/desk') {
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: action }, { select, put, call }) {
      yield put({ type: 'fetchdesk' });
    },
    *fetchdesk(action, { put, call, select }) {
      try {
        const { data } = yield call(getdesktop);
        yield put({ type: 'putState', payload: {
          leftComponent: data.leftdesktopcomponents,
          rightComponent: data.rightdesktopcomponents
        } });
      } catch (e) {
        console.error(e);
      }
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    resetState() {
      return {
        leftComponent: [],
        rightComponent: []
      };
    }
  }
};
