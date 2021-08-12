import { message } from 'antd';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { getListData } from '../services/entcomm';
import { queryMenus } from '../services/entity';

export default {
  namespace: 'affairList',
  state: {
    entityId: '00000000-0000-0000-0000-000000000001',
    menus: [],
    queries: {
      searchBegin: moment().format('YYYY-MM-DD'),
      searchEnd: moment().add(1, 'd').format('YYYY-MM-DD')
    },
    list: [],
    total: 0,
    currItems: [],
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/affair-list/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          dispatch({ type: 'queryList', payload: entityId });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *search({ payload }, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          ...payload
        }
      }));
    },
    *queryList(action, { select, call, put, take }) {
      const { query } = yield select(({ routing }) => routing.locationBeforeTransitions);
      let { menus, entityId, queries: curParams } = yield select(({ affairList }) => affairList);

      if (!menus.length) {
        try {
          // 获取权限数据后再往下走
          const { permissionFuncs } = yield select(state => state.permission);
          let funcs = permissionFuncs[entityId];
          if (!funcs || funcs.length) {
            while (true) {
              const result = yield take('permission/receivePermissionFunc');
              funcs = result.payload && result.payload.entityId === entityId && result.payload.permissionData;
              if (funcs) break;
            }
          }

          // 获取下拉菜单
          const { data: { rulemenu } } = yield call(queryMenus, entityId);
          menus = rulemenu.filter(o => o.menuid !== '72e9b119-20e8-4b68-867c-643ae024afc1').sort((a, b) => a.recorder - b.recorder)
            .map(item => ({ menuName: item.menuname, menuId: item.menuid }));

          menus = menus.filter(menu => {
            return funcs.some(fun => fun.relationvalue === menu.menuId);
          });
          yield put({ type: 'menus', payload: menus });
        } catch (e) {
          message.error(e.message || '获取菜单失败');
          return;
        }
      }

      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: menus.length ? menus[0].menuId : '',
        auditStatus: '-1',
        ...curParams,
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex, 10);
      queries.pageSize = parseInt(queries.pageSize, 10);
      yield put({ type: 'queries', payload: queries });
      try {
        const params = {
          viewType: 0,
          searchOrder: '',
          ...queries,
          searchData: {},
          isAdvanceQuery: 1
        };
        if (queries.auditStatus !== '-1') {
          params.searchData.auditstatus = +queries.auditStatus;
        }
        if (queries.searchBegin || queries.searchEnd) {
          params.searchData.reccreated = (queries.searchBegin || '') + ',' + (queries.searchEnd || '');
        }
        if (queries.flowName) {
          params.searchData.flowname = queries.flowName;
        }
        if (queries.creatorName) {
          params.searchData.reccreator = queries.creatorName;
        }
        if (queries.title) {
          params.searchData.title = queries.title;
        }
        delete params.auditStatus;
        delete params.searchBegin;
        delete params.searchEnd;
        delete params.flowName;
        delete params.creatorName;
        delete params.title;
        const { data } = yield call(getListData, params);
        yield put({
          type: 'queryListSuccess',
          payload: {
            list: data.pagedata,
            total: Array.isArray(data.pagecount) && data.pagecount.length && data.pagecount[0].total
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *addDone(action, { select, put }) {
      yield put({ type: 'showModals', payload: '' });
      const { pageIndex } = yield select(state => state.affairList.queries);
      yield put({ type: 'search', payload: { pageIndex } });
    }
  },
  reducers: {
    protocol(state, { payload: protocol }) {
      return { ...state, protocol };
    },
    menus(state, { payload: menus }) {
      return { ...state, menus };
    },
    queries(state, { payload: queries }) {
      return { ...state, queries };
    },
    queryListSuccess(state, { payload: { list, total } }) {
      return {
        ...state,
        list,
        total,
        currItems: []
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals
      };
    },
    resetState() {
      return {
        entityId: '00000000-0000-0000-0000-000000000001',
        menus: [],
        queries: {
          searchBegin: moment().add(-6,'d').format('YYYY-MM-DD'),
          searchEnd: moment().add(1, 'd').format('YYYY-MM-DD')
        },
        list: [],
        total: 0,
        currItems: [],
        showModals: ''
      };
    }
  }
};
