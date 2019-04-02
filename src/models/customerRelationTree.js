/**
 * Created by 0291 on 2017/7/10.
 */
import {
  queryCustomerTree
} from '../services/customer';

export default {
  namespace: 'relationtree',
  state: {
    relationTreeData: [],
    expandedKeys: [],
    recordId: '',
    recordName: '详细信息',
    detailModalVisible: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/relationtree/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const custid = match[2];
          dispatch({ type: 'init', payload: { custid: custid } });
        }
      });
    }
  },
  effects: {
    *init({ payload: queries }, { put }) { //进入页面就查客户关系树的数据
      yield put({ type: 'queryCustomerTree', payload: queries });
    },
    *queryCustomerTree({ payload: queries }, { put, call }) {
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const { data } = yield call(queryCustomerTree, queries);
        const listData = [...data];
        let newExpandedKeys = [];
        const moveItemToFirst = (arr, fromIndex) => {
          let item;
          for (const k in arr) {
            item = arr[k];
            if (parseInt(k, 10) === fromIndex) {
              arr.splice(k, 1);
              break;
            }
          }
          arr.unshift(item);
        };
        const loopIdFun = arr => {
          arr.forEach(id => {
            const index = listData.findIndex(obj => obj.id === id);
            moveItemToFirst(listData, index);
          });
        };
        for (const item of listData) {
          if (item.id === queries.custid && Array.isArray(item.path) && item.path.length > 1) {
            loopIdFun(item.path);
            newExpandedKeys = [...item.path];
            break;
          }
        }

        yield put({
          type: 'querySuccess',
          payload: {
            relationTreeData: listData,
            custid: queries.custid,
            expandedKeys: newExpandedKeys
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
        custid: payload.custid,
        expandedKeys: payload.expandedKeys
      };
    },
    updateExpandedKeys(state, { payload: currentExpandKey }) {
      let expandedKeys = state.expandedKeys;
      let newExpandedKeys = [];
      if (expandedKeys.indexOf(currentExpandKey) === -1) {
        newExpandedKeys = [...expandedKeys, currentExpandKey];
      } else {
        newExpandedKeys = expandedKeys.filter(item => item !== currentExpandKey);
      }
      return {
        ...state,
        expandedKeys: newExpandedKeys
      };
    },
    updateCustomerData(state, { payload: data }) {
      return {
        ...state,
        recordId: data.id,
        recordName: data.name,
        detailModalVisible: true
      };
    },
    updateDetailModalVisible(state, { payload: visible }) {
      return {
        ...state,
        detailModalVisible: visible
      };
    },
    queryFailure(state, { payload: errMsg }) {
      return { ...state, errMsg };
    }
  }
};
