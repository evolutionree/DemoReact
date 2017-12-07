/**
 * Created by 0291 on 2017/12/5.
 */
import { message } from 'antd';
import {
  functionlist,
  savefunctions
} from '../services/entity';

export default {
  namespace: 'entityFunc',
  state: {
    entityId: null,
    submitType: '',
    functionList: null,
    treeValue: null,
    treeType: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/func/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'putState',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({ type: 'query' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *query(action, { select, put, call }) {
      const { entityId } = yield select(state => state.entityFunc);
      try {
        const { data } = yield call(functionlist, { EntityId: entityId });
        yield put({
          type: 'putState',
          payload: {
            functionList: data
          }
        });
      } catch (e) {
        console.error(e)
        message.error(e.message || '获取功能列表失败');
      }
    },
    *save({ payload: submitData }, { select, put, call }) {
      const { entityId } = yield select(state => state.entityFunc);
      try {
        yield call(savefunctions, {
          EntityId: entityId,
          ...submitData
        });
        yield put({ type: 'query', payload: { } });
        yield put({
          type: 'putState',
          payload: {
            treeValue: null,
            treeType: '',
            submitType: ''
          }
        });
        message.success('更新成功');
      } catch (e) {
        console.error(e)
        message.error(e.message || '保存失败');
      }
    }
  },

  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    resetState() {
      return {
        entityId: null,
        submitType: '',
        functionList: null,
        treeValue: null,
        treeType: ''
      };
    }
  }
};
