import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getGeneralListProtocol, getListData, delEntcomm, transferEntcomm,getEntcommDetail } from '../services/entcomm';
import { queryMenus, queryEntityDetail, queryTypes, queryListFilter} from '../services/entity';

export default {
  namespace: 'entcommList',
  state: {
    entityId: '',
    entityName: '',
    importUrl:'',
    importTemplate:'',
    entityTypes: [],
    menus: [],
    protocol: [],
    queries: {},
    list: [],
    total: 0,
    currItems: [],
    showModals: '',
    modalPending: false,
    simpleSearchKey: 'recname',
    copyData: {}
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
      const lastEntityId = yield select(state => state.entcommList.entityId);
      if (lastEntityId === entityId) {
        yield put({ type: 'queryList' });
        return;
      }
      yield put({ type: 'resetState' });
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

        // 获取下拉菜单
        const { data: { rulemenu } } = yield call(queryMenus, entityId);
        let menus = rulemenu.sort((a, b) => a.recorder - b.recorder)
          .map(item => ({ menuName: item.menuname, menuId: item.menuid }));
        // 获取权限数据后再往下走
        const { permissionFuncs } = yield select(state => state.permission);
        let funcs = permissionFuncs[entityId];
        if (!funcs) {
          while (true) {
            const result = yield take('permission/putState');
            funcs = result.payload && result.payload.permissionFuncs[entityId];
            if (funcs) break;
          }
        }
        menus = menus.filter(menu => {
          return funcs.some(fun => fun.relationvalue === menu.menuId);
        });
        yield put({ type: 'menus', payload: menus });

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
      const { simpleSearchKey } = yield select(({ entcommList }) => entcommList);
      const searchData = JSON.stringify({ [simpleSearchKey]: keyword || undefined });
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 0 } });
    },
    *selectMenu({ payload: menuId }, { select, call, put }) {
      yield put({
        type: 'search',
        payload: {
          menuId,
          searchData: JSON.stringify({}),
          isAdvanceQuery: 0
        }
      });
    },
    *advanceSearch({ payload }, { select, call, put }) {
      const searchData = JSON.stringify(payload);
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 1 } });
    },
    *queryList(action, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { query } = location;
      const { menus, entityId } = yield select(({ entcommList }) => entcommList);
      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: menus.length ? menus[0].menuId : undefined,
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
    *addDone(action, { select, put }) {
      yield put({ type: 'showModals', payload: '' });
      const { pageIndex } = yield select(state => state.entcommList.queries);
      yield put({ type: 'search', payload: { pageIndex } });
    },
    *del(action, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.entcommList);
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
    },
    *copy(action, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.entcommList);
      try {
        const params = {
          entityId,
          recid: currItems.map(item => item.recid).join(','),
          needPower: 0
       };
        const { data: { detail: copyData } } = yield call(getEntcommDetail, params);
         yield put({
            type: 'copyFromData',
            payload: copyData
         });
      } catch (e) {
        message.error(e.message);
      }
    },
    *transfer({ payload: targetUser }, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.entcommList);
      try {
        const params = {
          entityId,
          recid: currItems.map(item => item.recid).join(','),
          manager: targetUser
        };
        yield put({ type: 'modalPending', payload: true });
        yield call(transferEntcomm, params);
        message.success('转移成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '转移失败');
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
        showModals,
        modalPending: false
      };
    },
    impModals(state, { payload: { importUrl,importTemplate} }) {
      return {
        ...state,
        importUrl,
        importTemplate,
        showModals:'import',
        modalPending: false
      };
    },
    modalPending(state, { payload: modalPending }) {
      return {
        ...state,
        modalPending
      };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    copyFromData(state, { payload: copyData }){
      return {
        ...state,
        copyData,
        showModals:'copy',
      };
    },
    resetState() {
      return {
        entityId: '',
        importUrl:'',
        importTemplate:'',
        entityName: '',
        entityTypes: [],
        menus: [],
        protocol: [],
        queries: {},
        list: [],
        total: 0,
        currItems: [],
        showModals: '',
        modalPending: false,
        simpleSearchKey: 'recname',
        copyData: {}
      };
    }
  }
};
