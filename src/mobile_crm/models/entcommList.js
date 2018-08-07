import { message } from 'antd';
import { querymobfieldvisible, queryMenus, getListData } from '../services/app';

export default {
  namespace: 'entcommList',
  state: {
    entityId: '',
    entityName: '',
    menus: [],
    protocol: [],
    list: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm-list\/([^/]+)$/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          dispatch({ type: 'init', payload: entityId });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: entityId }, { select, call, put, take }) {
      yield put({ type: 'resetState' });
      yield put({ type: 'putState', payload: { entityId } });
      try {
        // 获取协议
        const { data: protocol } = yield call(querymobfieldvisible, entityId);
        yield put({ type: 'putState', payload: { protocol: protocol && protocol.fieldvisible } });

        // 获取下拉菜单
        const { data: { rulemenu } } = yield call(queryMenus, entityId);
        let menus = rulemenu.sort((a, b) => a.recorder - b.recorder)
          .map(item => ({ menuName: item.menuname, menuId: item.menuid }));
        yield put({ type: 'putState', payload: { menus } });

        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *queryList(action, { select, call, put }) {
      const { menus, entityId } = yield select(({ entcommList }) => entcommList);
      if (!entityId || !menus.length) return;
      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: menus.length ? menus[0].menuId : undefined,
        keyword: '',
        isAdvanceQuery: 0
      };
      queries.pageIndex = parseInt(queries.pageIndex);
      queries.pageSize = parseInt(queries.pageSize);
      queries.isAdvanceQuery = parseInt(queries.isAdvanceQuery);
      try {
        const params = {
          viewType: 0,
          searchOrder: '',
          ...queries
        };
        delete params.keyword;
        const { data } = yield call(getListData, params);
        yield put({
          type: 'queryListSuccess',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    }
  },
  reducers: {
    queryListSuccess(state, { payload: { list, total } }) {
      return {
        ...state,
        list,
        total,
        currItems: []
      };
    },
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    resetState() {
      return {
        entityId: '',
        entityName: '',
        menus: [],
        protocol: [],
        list: []
      };
    }
  }
};
