/**
 * Created by 0291 on 2018/3/14.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getGeneralListProtocol, getListData, addEntcomm, getEntcommDetail, editEntcomm, delEntcomm } from '../services/entcomm';
import { queryEntityDetail, queryTypes, queryListFilter } from '../services/entity';

export default {
  namespace: 'attendanceGroupSet',
  state: {
    entityId: '',
    entityName: '',
    entityTypes: [],
    protocol: [],
    queries: {},
    list: [],
    currItems: [],
    total: 0,
    showModals: '',
    simpleSearchKey: 'recname',
    sortFieldAndOrder: null, //当前排序的字段及排序顺序
    formData: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/attendancegroupset') {
          const entityId = '4648774d-9e30-46c3-8bb6-e83341760923'; //match[1]
          dispatch({ type: 'init', payload: entityId });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: entityId }, { select, call, put, take }) {
      yield put({ type: 'entityId', payload: entityId });
      try {
        // 获取实体信息
        const { data } = yield call(queryEntityDetail, entityId);
        yield put({ type: 'entityName', payload: data.entityproinfo[0].entityname });

        // 获取实体类型
        const { data: { entitytypepros: entityTypes } } = yield call(queryTypes, { entityId });
        yield put({ type: 'entityTypes', payload: entityTypes });

        // 获取协议
        const { data: protocol } = yield call(getGeneralListProtocol, { typeId: entityId });
        yield put({ type: 'protocol', payload: protocol });

        // 获取简单搜索
        const { data: { simple } } = yield call(queryListFilter, entityId);
        let simpleSearchKey = 'recname';
        if (simple && simple.length) {
          simpleSearchKey = simple[0].fieldname;
        }
        yield put({ type: 'putState', payload: { simpleSearchKey } });

        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
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
    *searchKeyword({ payload: keyword }, { select, call, put }) {
      const { simpleSearchKey } = yield select(({ attendanceGroupSet }) => attendanceGroupSet);
      const searchData = JSON.stringify({ [simpleSearchKey]: keyword || undefined });
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 0 } });
    },
    *queryList(action, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { query } = location;
      const { entityId } = yield select(({ attendanceGroupSet }) => attendanceGroupSet);
      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: '75ce6617-2016-46f0-8cb4-8467b77ef468',
        keyword: '',
        isAdvanceQuery: 0,
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex);
      queries.pageSize = parseInt(queries.pageSize);
      queries.isAdvanceQuery = parseInt(queries.isAdvanceQuery);
      if (queries.searchData) {
        queries.searchData = JSON.parse(queries.searchData);
      }
      if (queries.searchOrder) { //其他查询条件 发生改变  排序保持不变
        yield put({ type: 'putState', payload: { sortFieldAndOrder: queries.searchOrder } });
      }
      yield put({ type: 'queries', payload: queries });
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
    },
    *add({ payload: submitData }, { select, call, put }) {
      try {
        yield call(addEntcomm, submitData);
        message.success('新增成功');
        yield put({ type: 'showModals', payload: '' });
        const { pageIndex } = yield select(state => state.attendanceGroupSet.queries);
        yield put({ type: 'search', payload: { pageIndex } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *queryDetail({ payload }, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.attendanceGroupSet);
      try {
        const { data } = yield call(getEntcommDetail, {
          entityId,
          needPower: 1,
          recId: currItems[0].recid
        });
        yield put({
          type: 'putState',
          payload: { formData: data.detail }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *edit({ payload: submitData }, { select, call, put }) {
      const { currItems } = yield select(state => state.attendanceGroupSet);
      try {
        yield call(editEntcomm, {
          ...submitData,
          recid: currItems[0].recid
        });
        message.success('修改成功');
        yield put({ type: 'showModals', payload: '' });
        const { pageIndex } = yield select(state => state.attendanceGroupSet.queries);
        yield put({ type: 'search', payload: { pageIndex } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *del(action, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.attendanceGroupSet);
      try {
        const params = {
          entityId,
          recid: currItems.map(item => item.recid).join(','),
          pagecode: 'EntityListPage',
          pagetype: 1
        };
        yield call(delEntcomm, params);
        message.success('删除成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    }
  },
  reducers: {
    entityName(state, { payload: entityName }) {
      return { ...state, entityName };
    },
    entityTypes(state, { payload: entityTypes }) {
      return {
        ...state,
        entityTypes
      };
    },
    entityId(state, { payload: entityId }) {
      return { ...state, entityId };
    },
    protocol(state, { payload: protocol }) {
      return { ...state, protocol };
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
        entityTypes: [],
        protocol: [],
        queries: {},
        list: [],
        currItems: [],
        total: 0,
        showModals: '',
        simpleSearchKey: 'recname',
        sortFieldAndOrder: null, //当前排序的字段及排序顺序
        formData: null
      };
    }
  }
};
