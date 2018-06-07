/**
 * Created by 0291 on 2018/6/6.
 */
import { message } from 'antd';

import _ from 'lodash';
import {
  queryTypes
} from '../services/entity.js';
import { queryDicTypes } from '../services/dictionary.js';
import { GetArgsFromHref } from '../utils/index.js';

export default {
  namespace: 'dic',
  state: {
    currentActiveId: '1',
    navList: [{
      id: 1,
      text: '测试1'
    }, {
      id: 2,
      text: '测试2'
    }]
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dic') {
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: action }, { select, put, call }) { //进入页面就查商机类型
      // const { currentActiveId } = yield select(state => state.dic);
      yield put({ type: 'queryList', payload: entities });
    },
    *queryList(action, { put, call }) {
      try {
        const { data } = yield call(queryDicTypes);
      } catch (e) {
        console.error(e);
        message.error('查询数据失败');
      }
    },
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },

    changeType(state, { payload: categoryid }) {
      return {
        ...state,
        currentActiveId: categoryid
      };
    },

    showModal(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      }
    }
  }
};
