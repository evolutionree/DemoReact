import { message } from 'antd';
import { queryTypes, createType, updateType, orderType, disableType } from '../services/entity';

export default {
  namespace: 'entityTypes',
  state: {
    entityId: null,
    list: [],
    createBtnLoading: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/types/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'gotEntityInfo',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({
            type: 'query'
          });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *query(action, { select, put, call }) {
      const entityId = yield select(({ entityTypes }) => {
        return entityTypes.entityId;
      });
      try {
        const { data } = yield call(queryTypes, { entityId, getAllStatus: true });
        yield put({ type: 'querySuccess', payload: data.entitytypepros });
      } catch (e) {
        message.error(e.message || '获取数据出错');
      }
    },
    *create({ payload: params }, { call, put }) {
      yield put({ type: 'toggleCreateBtnLoading', payload: true });
      try {
        yield call(createType, params);
        yield put({ type: 'toggleCreateBtnLoading', payload: false });
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '添加失败');
      }
    },
    *update({ payload: params }, { call, put }) {
      try {
        yield call(updateType, params);
        yield put({ type: 'query' });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *order({ payload: params }, { call, put }) {
      yield call(orderType, params);

      yield put({ type: 'query' });
    },
    *switch({ payload: params }, { call, put }) {
      try {
        yield call(disableType, params);
        yield put({ type: 'query' });
        message.success(params.RecStatus === 1 ? '已启用' : '已停用');
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    }
  },
  reducers: {
    querySuccess(state, { payload: list }) {
      return { ...state, list };
    },
    gotEntityInfo(state, { payload: entityInfo }) {
      return {
        ...state,
        entityId: entityInfo.entityId,
        entityType: entityInfo.entityType
      };
    },
    toggleCreateBtnLoading(state, { payload: createBtnLoading }) {
      return { ...state, createBtnLoading };
    },
    resetState() {
      return {
        entityId: null,
        list: [],
        createBtnLoading: false
      };
    }
  }
};
