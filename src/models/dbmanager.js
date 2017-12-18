/**
 * Created by 0291 on 2017/12/7.
 */
import { message } from 'antd';
import { listDirs, listObjects, saveobjectforbase, getobjectsql, saveobjectsql } from '../services/dbmanager';

export default {
  namespace: 'dbmanager',
  state: {
    treeData: null,
    listData: [],
    queries: {
      objecttype: 0
    },
    showInfoModals: '',
    currItem: {},
    JsData: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dbmanager') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'queryTreeData' });
    },
    *queryTreeData(action, { select, put, call }) {
      try {
        const result = yield call(listDirs, {
        });
        const treeData = result.data;
        yield put({ type: 'putState', payload: { treeData } });
        if (treeData instanceof Array && treeData.length > 0) {
          let { queries } = yield select(state => state.dbmanager);
          const newQueries = {
            ...queries,
            fullpath: treeData[0].fullpath
          };
          yield put({ type: 'putState', payload: { queries: newQueries } });
          yield put({ type: 'queryListData' });
        }
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *queryListData(action, { select, put, call }) {
      let { queries } = yield select(state => state.dbmanager);
      try {
        const result = yield call(listObjects, queries);
        const listData = result.data;
        yield put({ type: 'putState', payload: { listData } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *search({ payload }, { select, put, call }) {
      let { queries } = yield select(state => state.dbmanager);
      const newQueries = {
        ...queries,
        ...payload
      };
      yield put({ type: 'putState', payload: { queries: newQueries } });
      yield put({ type: 'queryListData' });
    },
    *saveobjectforbase({ payload: formValue }, { select, put, call }) {
      try {
        yield call(saveobjectforbase, formValue)
        message.success('更新成功');
        yield put({ type: 'showInfoModals', payload: '' });
        yield put({ type: 'queryListData' });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *getobjectsql({ payload: { type, currItem } }, { select, put, call }) {
      const params = { ObjId: currItem.id, StructOrData: type === 'editDataJs' ? 2 : 1 };
      try {
        const { data } = yield call(getobjectsql, params);
        yield put({ type: 'putState', payload: { JsData: data } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *saveobjectsql({ payload: data }, { select, put, call }) {
      let { currItem } = yield select(state => state.dbmanager);
      const params = { ObjId: currItem.id, StructOrData: 2, SqlText: data };
      try {
        yield call(saveobjectsql, params);
        yield put({ type: 'showInfoModals', payload: '' });
        yield put({ type: 'queryListData' });
        message.success('更新成功');
      } catch (e) {
        message.error(e.message || '获取数据失败');
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
    showInfoModals(state, { payload: showInfoModals }) {
      return {
        ...state,
        showInfoModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        treeData: null,
        listData: [],
        queries: {
          objecttype: 0
        },
        showInfoModals: '',
        currItem: {},
        JsData: ''
      };
    }
  }
};
