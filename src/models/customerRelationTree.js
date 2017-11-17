/**
 * Created by 0291 on 2017/7/10.
 */
import { message } from 'antd';
import _ from 'lodash';
import {
  queryCustomerTree
} from '../services/customer';

export default {
  namespace: 'relationtree',
  state: {
    relationTreeData : []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/relationtree/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const custid = match[2];
          dispatch({ type: 'init', payload: { custid : custid }});
        }
      });
    }
  },
  effects: {
    *init({payload: queries }, { select, put }) { //进入页面就查客户关系树的数据
        yield put({ type: 'queryCustomerTree', payload: queries });
    },
    *queryCustomerTree({ payload: queries }, { put, call }) {
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const { data } = yield call(queryCustomerTree, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            relationTreeData: data,
            custid: queries.custid
          }
        });
      } catch (e) {
        yield put({ type: 'queryFailure', payload: e.message });
      }
    }
  },
  reducers: {
    queryRequest(state, { payload: queries }) {
      return { ...state, queries };
    },
    querySuccess(state, { payload }) {
      return {
        ...state,
        relationTreeData: payload.relationTreeData,
        custid: payload.custid
      };
    },
    queryFailure(state, { payload: errMsg }) {
      return { ...state, errMsg };
    }
  }
};
