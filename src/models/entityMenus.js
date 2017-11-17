import { message } from 'antd';
import { queryFields, queryMenus, delMenu, saveEntityQueryRule } from '../services/entity';

export default {
  namespace: 'entityMenus',
  state: {
    entityId: null,
    list: [],
    showModals: '',
    currentItem: null,
    modalPending: false,
    errMsg: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/menus/;
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
          dispatch({ type: 'queryEntityFields' });
          dispatch({ type: 'query' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *queryEntityFields(action, { put, call, select }) {
      try {
        const { entityId } = yield select(state => state.entityMenus);
        const { data } = yield call(queryFields, entityId);
        yield put({ type: 'queryEntityFieldsSuccess', payload: data });
      } catch (err) {
        message.error(err.message || '查询数据出错');
      }
    },
    *query(action, { select, put, call }) {
      try {
        const { entityId } = yield select(({ entityMenus }) => entityMenus);
        const { data } = yield call(queryMenus, entityId);
        yield put({ type: 'querySuccess', payload: data.rulemenu });
      } catch (err) {
        message.error(err.message || '查询数据出错');
      }
    },
    *saveEntityQueryRule({ payload: data }, { put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(saveEntityQueryRule, data);
        yield put({ type: 'modalPending', payload: false });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'query' });
        message.success('保存成功');
      } catch (err) {
        yield put({ type: 'modalPending', payload: false });
        message.error(err.message || '保存失败');
      }
    },
    *delMenu({ payload: menuId }, { put, call }) {
      try {
        yield call(delMenu, menuId);
        message.success('删除成功');
        yield put({ type: 'query' });
      } catch (err) {
        message.error(err.message || '删除失败');
      }
    }
  },
  reducers: {
    gotEntityInfo(state, { payload: entityInfo }) {
      return {
        ...state,
        entityId: entityInfo.entityId,
        entityType: entityInfo.entityType
      };
    },
    querySuccess(state, { payload: list }) {
      return { ...state, list, errMsg: '' };
    },
    edit(state, { payload: record }) {
      return {
        ...state,
        currentItem: record,
        showModals: 'edit'
      };
    },
    add(state) {
      return { ...state, currentItem: null, showModals: 'add' };
    },
    showModals(state, { payload }) {
      return { ...state, showModals: payload };
    },
    modalPending(state, { payload: pending }) {
      return { ...state, modalPending: pending };
    },
    queryEntityFieldsSuccess(state, { payload: entityFields }) {
      return { ...state, entityFields };
    },
    resetState() {
      return {
        entityId: null,
        list: [],
        showModals: '',
        currentItem: null,
        modalPending: false,
        errMsg: ''
      };
    }
  }
};
