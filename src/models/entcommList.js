import { message } from 'antd';
import _ from 'lodash';
import { routerRedux } from 'dva/router';
import { getGeneralListProtocol, getListData, delEntcomm, transferEntcomm, getFunctionbutton, extraToolbarClickSendData, getEntcommDetail, transferdata, queryWorkflow } from '../services/entcomm';
import { queryMenus, queryEntityDetail, queryTypes, queryListFilter, getlistschemebyentity } from '../services/entity';

export default {
  namespace: 'entcommList',
  state: {
    entityId: '',
    entityName: '',
    importUrl: '',
    importTemplate: '',
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
    searchTips: '',
    copyData: {},
    extraButtonData: [], //页面动态 按钮数据源
    extraToolbarData: [], //页面toolbar 动态按钮数据源
    dynamicModalData: {},
    sortFieldAndOrder: null, //当前排序的字段及排序顺序
    ColumnFilter: null, //字段查询
    selectedFlowObj: null, //审批流
    schemelist: []
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
      sessionStorage.setItem('seachQuery', '');
      try {
        // 获取实体信息
        const { data } = yield call(queryEntityDetail, entityId);
        if (Array.isArray(data.entityproinfo) && data.entityproinfo.length) {
          yield put({
            type: 'putState', payload: {
              entityName: data.entityproinfo[0].entityname
            }
          });
        }

        //获取审批信息
        const { data: selectedFlowObj } = yield call(queryWorkflow, entityId);
        yield put({ type: 'putState', payload: { selectedFlowObj } });

        // 获取实体类型
        const { data: { entitytypepros: entityTypes } } = yield call(queryTypes, { entityId });
        yield put({ type: 'entityTypes', payload: entityTypes });

        // 获取协议
        const { data: protocol } = yield call(getGeneralListProtocol, { typeId: entityId });
        yield put({ type: 'protocol', payload: protocol });

        // 获取页面操作按钮
        yield put({ type: 'queryFuntionbutton__', payload: {} });

        // 获取数据转移方案
        yield put({ type: 'queryschemebyentity', payload: entityId });

        // 获取下拉菜单
        const { data: { rulemenu } } = yield call(queryMenus, entityId);
        let menus = rulemenu.filter(o => o.menuid !== '72e9b119-20e8-4b68-867c-643ae024afc1').sort((a, b) => a.recorder - b.recorder)
          .map(item => ({ menuName: item.menuname, menuName_lang: item.menuname_lang, menuId: item.menuid }));
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
        const { data: { simple, fields } } = yield call(queryListFilter, entityId);
        let simpleSearchKey = 'recname';
        let searchTips = '';
        let simpleSearchId = '';
        if (simple && simple.length) {
          simpleSearchKey = simple[0].fieldname;
          simpleSearchId = simple[0].fieldid;
        }
        if (fields && fields.length) {
          const searchList = fields.filter(item => (item.fieldid === simpleSearchId));
          searchTips = searchList.length === 1 && searchList[0].displayname;
        }
        yield put({ type: 'putState', payload: { simpleSearchKey, searchTips } });

        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *search({ payload }, { select, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      let newMergeParams = { ...payload };
      if (payload.hasOwnProperty('ColumnFilter')) {
        const ColumnFilter = JSON.stringify(payload.ColumnFilter);
        newMergeParams = { ColumnFilter };
        sessionStorage.setItem('seachQuery', ColumnFilter);
      }

      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          ...newMergeParams
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
    *cancelFilter({ payload }, { put }) {
      yield put({ type: 'search', payload: { ColumnFilter: payload } });
      yield put({ type: 'putState', payload: { ColumnFilter: payload } });
    },
    *queryList(action, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      let { query } = location;
      const { menus, entityId, ColumnFilter } = yield select(({ entcommList }) => entcommList);
      const seachQuery = sessionStorage.getItem('seachQuery');
      if (!entityId || !menus.length) return;
      if (!ColumnFilter && query.ColumnFilter) {
        let filterParams = null;
        if (seachQuery && seachQuery !== '{}') {
          filterParams = JSON.parse(seachQuery);
        } else {
          filterParams = JSON.parse(query.ColumnFilter);
        }
        query = { ...query, ColumnFilter: filterParams };
        yield put({ type: 'putState', payload: { ColumnFilter: query.ColumnFilter } });
      }
      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: menus.length ? menus[0].menuId : undefined,
        keyword: '',
        isAdvanceQuery: 0,
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex, 10);
      queries.pageSize = parseInt(queries.pageSize, 10);
      queries.isAdvanceQuery = parseInt(queries.isAdvanceQuery, 10);
      if (queries.searchData) queries.searchData = JSON.parse(queries.searchData);
      if (ColumnFilter) queries.ColumnFilter = ColumnFilter;
      yield put({ type: 'putState', payload: { sortFieldAndOrder: queries.searchOrder } }); //其他查询条件 发生改变  排序保持不变
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
      const { entityId, currItems } = yield select(state => state.entcommList);
      if (!entityId) return;
      try {
        let { data: functionbutton } = yield call(getFunctionbutton, { entityid: entityId, RecIds: currItems.map((item) => item.recid) });
        /*
         DisplayPosition	按钮的显示位置（int数组）：web列表=0，web详情=1，手机列表=100，手机详情=101	array<number>	@mock=$order(0,1) 1
         */
        functionbutton = Array.isArray(functionbutton) && functionbutton.filter(item => _.indexOf(item.displayposition, 0) > -1);
        const extraButtonData = functionbutton && Array.isArray(functionbutton) && functionbutton.filter(item => item.buttoncode === 'ShowModals');
        const buttoncode = ['DataTransfer', 'CallService', 'CallService_showModal', 'PrintEntity', 'EntityDataOpenH5'];
        const extraToolbarData = functionbutton && Array.isArray(functionbutton) && functionbutton.filter(item => buttoncode.indexOf(item.buttoncode) > -1);
        yield put({ type: 'putState', payload: { extraButtonData, extraToolbarData } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *queryschemebyentity({ payload: entityid }, { select, call, put }) {
      const { data } = yield call(getlistschemebyentity, entityid);
      yield put({ type: 'putState', payload: { schemelist: data } });
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
    },
    *datatransfer({ payload: submitData }, { select, call, put }) {
      try {
        yield put({ type: 'modalPending', payload: true });
        yield call(transferdata, submitData);
        message.success('转移成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '转移失败');
      }
    },
    *extraToolbarClick({ payload: item }, { select, call, put }) {
      const { currItems } = yield select(state => state.entcommList);
      const params = {
        Recids: Array.isArray(currItems) ? currItems.map(o => o.recid) : [],
        ...item.extradata
      };
      try {
        const { data } = yield call(extraToolbarClickSendData, item.routepath, params);
        if (item.buttoncode === 'EntityDataOpenH5') {
          window.open(data.htmlurl);
        } else {
          yield put({ type: 'queryList' });
          message.success('更新成功');
        }
      } catch (e) {
        message.error(e.message);
      }
    },
    *dynamicModalSendData({ payload: submitData }, { select, call, put }) {
      const { dynamicModalData } = yield select(state => state.entcommList);
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
    impModals(state, { payload: { importUrl, importTemplate } }) {
      return {
        ...state,
        importUrl,
        importTemplate,
        showModals: 'import',
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
    copyFromData(state, { payload: copyData }) {
      return {
        ...state,
        copyData,
        showModals: 'copy'
      };
    },
    resetState() {
      return {
        entityId: '',
        importUrl: '',
        importTemplate: '',
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
        searchTips: '',
        copyData: {},
        extraButtonData: [], //页面动态 按钮数据源
        extraToolbarData: [], //页面toolbar 动态按钮数据源
        dynamicModalData: {},
        sortFieldAndOrder: null, //当前排序的字段及排序顺序
        ColumnFilter: null, //字段查询
        selectedFlowObj: null,  //审批流
        schemelist: []
      };
    }
  }
};
