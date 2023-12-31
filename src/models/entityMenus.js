import { message } from 'antd';
import { queryFields, queryMenus, delMenu, saveEntityQueryRule, savemenuorderby } from '../services/entity';

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
        let menus = data.rulemenu.filter(o => o.menuid !== '72e9b119-20e8-4b68-867c-643ae024afc1').sort((a, b) => a.recorder - b.recorder)
        yield put({ type: 'querySuccess', payload: menus });
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
    },
    *orderMenu({ payload: { index, dir }}, { select, put, call }) {
      const list = yield select(state => state.entityMenus.list);
      const tmpItem = list[index];
      list[index] = list[index + dir];
      list[index + dir] = tmpItem;
      const orderbyList = list.map((item, i) => {
        return {
          menuid: item.menuid,
          orderby: i
        };
      });
      try {
        yield call(savemenuorderby, orderbyList);
        yield put({ type: 'query' });
        message.success('更新成功');
      } catch (e) {
        message.error(e.message || '更新失败');
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
