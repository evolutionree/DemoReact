/**
 * Created by 0291 on 2017/6/19.
 */
import { message } from 'antd';
import _ from 'lodash';
import {
  query,
  delPlan,
  delRecord
} from '../services/contract';
import {
  correctPageSize,
  correctPageIndex
} from '../utils/common';

export default {
  namespace: 'receivePay',
  state: {
    queries: {},
    returnData: [],
    total: 0,
    currItems: [],
    showModals: ""
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/receivepay/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const parentId = match[2];
          dispatch({
            type: 'search',
            payload: {...location.query, parentId }
          });
        }
      });
    }
  },
  effects: {
    *search({ payload: queries }, { select, put }) {
      // pageIndex 默认为1
      const DefaultPageSize = 10;

      const { total, receivePay } = yield select(state => state.receivePay);

      let { pageIndex, pageSize, parentId } = queries; // 拿到想要查询的分页数据
      pageSize = correctPageSize(pageSize, DefaultPageSize);
      pageIndex = correctPageIndex(pageIndex, total, pageSize);

      const corrected = { pageIndex, pageSize, parentId:parentId };
      yield put({ type: 'query', payload: corrected });
    },
    // 查询列表数据
    *query({ payload: queries }, { put, call }) {
      yield put({ type: 'queryRequest', payload: queries });

      try {
        const { data } = yield call(query, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            returnData: data,
            total: data.pagecount[0].total
          }
        });
      } catch (e) {
        yield put({ type: 'queryFailure', payload: e.message });
      }
    },
    *delPlan(action, { select, call, put }) {
      const { currItems,returnData } = yield select(state => state.receivePay);
      try {
        const params = {
          recid:currItems[0].recid,
          entityId:returnData.planentity
        };
        yield call(delPlan, params);
        message.success('删除成功');
        yield put({ type: 'search', payload:{parentId:returnData.parentid } });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *delRecord(action, { select, call, put }) {
      const { currItems,returnData } = yield select(state => state.receivePay);
      try {
        const params = {
          recid:currItems[0].recid,
          entityId:returnData.paymentsentity
        };
        yield call(delRecord, params);
        message.success('删除成功');
        yield put({ type: 'search', payload:{parentId:returnData.parentid} });
      } catch (e) {
        message.error(e.message || '删除失败');
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
        returnData: payload.returnData,
        total: payload.total,
        currItems: []
      };
    },
    queryFailure(state, { payload: errMsg }) {
      return { ...state, errMsg };
    },
    hideModal(state) {
      return {
        ...state,
        showModals:  '',
        savePending: false
      };
    },
    addPlan(state) {
      return {
        ...state,
        showModals: "addPlan",
        savePending: false
      };
    },
    addRecord(state) {
      return {
        ...state,
        showModals: "addRecord",
        savePending: false
      };
    },
    currentItems(state, { payload: records }) {
      return {
        ...state,
        currItems: records
      };
    },
    editPlan(state){
      return {
        ...state,
        showModals: "editPlan",
        savePending: false
      };
    },
    editRecord(state) {
      return {
        ...state,
        showModals: "editRecord",
        savePending: false
      };
    }
  }
};
