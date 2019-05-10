/**
 * Created by 0291 on 2018/5/23.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getListData, queryTabs } from '../services/entcomm';
import { queryMenus } from '../services/entity';
import _ from 'lodash';

export default {
  namespace: 'entcommAffair',
  state: {
    entityId: '',
    menus: [],
    queries: {},
    list: [],
    total: 0
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/affairlist/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          dispatch({ type: 'putState', payload: { entityId, recordId } });
          dispatch({ type: 'queryList' });
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
      let { menus, entityId, recordId } = yield select(({ entcommAffair }) => entcommAffair);

      const { data: { reltablist: relTabs } } = yield call(queryTabs, { entityId, recid: recordId });
      let currentTabInfo = _.find(relTabs, item => item.entitytaburl === 'affairlist');
      const rootEntityId = '00000000-0000-0000-0000-000000000001';
      if (!menus.length) {
        try {
          // 获取下拉菜单
          const { data: { rulemenu } } = yield call(queryMenus, rootEntityId);
          menus = rulemenu.filter(o => o.menuid !== '72e9b119-20e8-4b68-867c-643ae024afc1').sort((a, b) => a.recorder - b.recorder)
            .map(item => ({ menuName: item.menuname, menuId: item.menuid }));
          yield put({ type: 'menus', payload: menus });
        } catch (e) {
          message.error(e.message || '获取菜单失败');
          return;
        }
      }

      const queries = {
        entityId: rootEntityId,
        RelInfo: {
          recid: recordId,
          relid: currentTabInfo && currentTabInfo.relid
        },
        pageIndex: 1,
        pageSize: 10,
        menuId: menus.length > 0 && menus[0].menuId,
        auditStatus: '-1',
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex);
      queries.pageSize = parseInt(queries.pageSize);
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
            total: data.pagecount[0].total
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
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
        entityId: '',
        menus: [],
        queries: {},
        list: [],
        total: 0
      };
    }
  }
};
