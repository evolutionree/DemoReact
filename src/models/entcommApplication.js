import { message } from 'antd';
import _ from 'lodash';
import { routerRedux } from 'dva/router';
import { getGeneralListProtocol, getListData, delEntcomm, transferEntcomm, getFunctionbutton, extraToolbarClickSendData, savemailowner } from '../services/entcomm';
import { queryMenus, queryEntityDetail, queryTypes, queryListFilter } from '../services/entity';

export default {
  namespace: 'entcommApplication',
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
    extraButtonData: [], //页面动态 按钮数据源
    extraToolbarData: [], //页面toolbar 动态按钮数据源
    dynamicModalData: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm-application\/([^/]+)$/;
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
      const lastEntityId = yield select(state => state.entcommApplication.entityId);
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

        // 获取页面操作按钮
        yield put({ type: 'queryFuntionbutton__', payload: {} });

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
        // 周计划，日报没有配菜单控制权限项
        if (entityId !== '601cb738-a829-4a7b-a3d9-f8914a5d90f2' && entityId !== '0b81d536-3817-4cbc-b882-bc3e935db845') {
          menus = menus.filter(menu => {
            return funcs.some(fun => fun.relationvalue === menu.menuId);
          });
        }
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
      const { simpleSearchKey } = yield select(({ entcommApplication }) => entcommApplication);
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
      const { menus, entityId } = yield select(({ entcommApplication }) => entcommApplication);
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
    *queryFuntionbutton__({ payload }, { select, call, put }) {
      const { entityId, currItems } = yield select(state => state.entcommApplication);
      try {
        let { data: functionbutton } = yield call(getFunctionbutton, { entityid: entityId, RecIds: currItems.map((item) => item.recid) });
        /*
         DisplayPosition	按钮的显示位置（int数组）：web列表=0，web详情=1，手机列表=100，手机详情=101	array<number>	@mock=$order(0,1)
         */

        functionbutton = functionbutton.filter(item => _.indexOf(item.displayposition, 0) > -1);

        const extraButtonData = functionbutton && functionbutton instanceof Array && functionbutton.filter(item => item.buttoncode === 'ShowModals');
        const extraToolbarData = functionbutton && functionbutton instanceof Array && functionbutton.filter(item => item.buttoncode === 'CallService' || item.buttoncode === 'CallService_showModal');
        yield put({ type: 'functionbutton', payload: { extraButtonData, extraToolbarData } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *addDone(action, { select, put }) {
      yield put({ type: 'showModals', payload: '' });
      const { pageIndex } = yield select(state => state.entcommApplication.queries);
      yield put({ type: 'search', payload: { pageIndex } });
    },
    *del(action, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.entcommApplication);
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
    *transfer({ payload: targetUser }, { select, call, put }) {
      const { currItems, entityId } = yield select(state => state.entcommApplication);
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
    },
    *extraToolbarClick({ payload: item }, { select, call, put }) {
      const { currItems } = yield select(state => state.entcommApplication);
      let params = {};
      params = {
        Recids: currItems.map(item => item.recid),
        ...item.extradata
      };
      try {
        yield call(extraToolbarClickSendData, item.routepath, params);
        yield put({ type: 'queryList' });
        message.success('更新成功');
      } catch (e) {
        message.error(e.message);
      }
    },
    *dynamicModalSendData({ payload: submitData }, { select, call, put }) {
      const { dynamicModalData } = yield select(state => state.entcommApplication);
      const url = dynamicModalData.routepath;
      const successMessageInfo = dynamicModalData && dynamicModalData.extradata && dynamicModalData.extradata.success_message;
      try {
        yield call(extraToolbarClickSendData, url, submitData);
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'putState', payload: { dynamicModalData: {} } });
        yield put({ type: 'queryList' });
        if (successMessageInfo) {
          message.success(successMessageInfo);
        }
      } catch (e) {
        message.error(e.message);
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
    functionbutton(state, { payload: { extraButtonData, extraToolbarData } }) {
      return { ...state, extraButtonData, extraToolbarData };
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
        extraButtonData: [], //页面动态 按钮数据源
        extraToolbarData: [], //页面toolbar 动态按钮数据源
        dynamicModalData: {}
      };
    }
  }
};
