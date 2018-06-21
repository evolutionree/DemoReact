import { message } from 'antd';
import * as _ from 'lodash';
import { routerRedux } from 'dva/router';
import { queryTabsList, delEntcomm, delRelItem, getGeneralListProtocol, getListData, getFunctionbutton, extraToolbarClickSendData, transferEntcomm, queryreldatasource } from '../services/entcomm';
import { queryMobFieldVisible, queryEntityDetail, queryTypes, DJCloudCall, queryListFilter, queryMenus } from '../services/entity';
import { parseConfigData } from '../components/ListStylePicker';

const modelSelector = state => state.entcommRel;

// function parseConfigData(config) {
//   const keys = config.fieldkeys.split(',');
//   const fonts = config.fonts.split(',');
//   const colors = config.colors.split(',');
//   let iconField = null;
//   if (keys.length > fonts.length) { // 去掉图片字段
//     iconField = { fieldName: keys[0] };
//     keys.shift();
//   }
//   const listFields = keys.map((key, index) => ({
//     fieldName: key,
//     color: colors[index],
//     font: fonts[index]
//   }));
//   return { iconField, listFields };
// }

export default {
  namespace: 'entcommRel',
  state: {
    relId: '',
    recordId: '',
    relEntityId: '',
    relEntityName: '',
    queries: {},
    list: [],
    total: 0,
    currItems: [],
    entityTypes: [],
    modalPending: false,
    menus: [],
    iconField: null,
    listFields: [],
    currItem: null, // 当前展示记录id
    showModals: '',
    protocol: [],
    simpleSearchKey: 'recname',
    extraButtonData: [], //页面动态 按钮数据源
    extraToolbarData: [], //页面toolbar 动态按钮数据源
    dynamicModalData: {},
    sortFieldAndOrder: null, //当前排序的字段及排序顺序
    relCountData: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/rel\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          const relId = match[3];
          const relEntityId = match[4];

          dispatch({ type: 'putState', payload: { entityId, recordId, relId, relEntityId } });
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call, take }) {
      yield put({ type: 'putState', payload: { list: [], iconField: null, listFields: [] } });
      // yield put({ type: 'queryEntityDetail' });
      const { relId, relEntityId } = yield select(modelSelector);
      const entityId = relEntityId;
      try {
        // 获取实体类型
        const { data: { entitytypepros: entityTypes } } = yield call(queryTypes, { entityId });
        yield put({ type: 'putState', payload: { entityTypes } });

        // 获取协议
        const { data: protocol } = yield call(getGeneralListProtocol, { typeId: entityId });
        yield put({ type: 'putState', payload: { protocol } });

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
        menus = menus.filter(menu => {
          return funcs.some(fun => fun.relationvalue === menu.menuId);
        });
        yield put({ type: 'putState', payload: { menus } });

        // 获取简单搜索
        const { data: { simple } } = yield call(queryListFilter, entityId);
        let simpleSearchKey = 'recname';
        if (simple && simple.length) {
          simpleSearchKey = simple[0].fieldname;
        }
        yield put({ type: 'putState', payload: { simpleSearchKey } });

        yield put({ type: 'queryList' });

        const { relTabs } = yield select(state => state.entcommHome);
        let tabInfo = {};
        if (relTabs.length && relId && relEntityId) {
          tabInfo = _.find(relTabs, item => {
            return item.relid === relId && item.relentityid === relEntityId;
          }) || tabInfo;
        }
        if (tabInfo.confitems > 0) { //当前页签需显示  页签统计
          yield put({ type: 'queryreldatasource' });
        }
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
      const { simpleSearchKey } = yield select(modelSelector);
      const searchData = JSON.stringify({ [simpleSearchKey]: keyword || undefined });
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 0 } });
    },
    *queryEntityDetail(action, { select, call, put }) {
      // const { relEntityId } = yield select(modelSelector);
      // const { data: { entityproinfo } } = yield call(queryEntityDetail, relEntityId);
      // yield put({
      //   type: 'putState',
      //   payload: { relEntityName: entityproinfo[0].entityname }
      // });
    },
    *queryreldatasource(action, { select, call, put }) {
      const { recordId, relId } = yield select(modelSelector);
      try {
        const { data: relCountData } = yield call(queryreldatasource, {
          RecId: recordId,
          relId
        });
        yield put({ type: 'putState', payload: { relCountData: relCountData.data } });
      } catch (e) {
        message.error(e.message || '查询统计值失败');
      }
    },
    *queryList(action, { select, call, put }) {
      const { recordId, relId, relEntityId, menus } = yield select(modelSelector);
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { query } = location;

      if (!relEntityId || !menus.length) return;
      const queries = {
        entityId: relEntityId,
        pageIndex: 1,
        pageSize: 10,
        relinfo: {
          recid: recordId,
          relid: relId
        },
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
      if (queries.searchOrder) { //其他查询条件 发生改变  排序保持不变
        yield put({ type: 'putState', payload: { sortFieldAndOrder: queries.searchOrder } });
      }
      yield put({ type: 'putState', payload: { queries } });
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
      const { relEntityId: entityId, currItems } = yield select(modelSelector);
      if (!entityId) return;
      try {
        let { data: functionbutton } = yield call(getFunctionbutton, { entityid: entityId, RecIds: currItems.map((item) => item.recid) });
        /*
         DisplayPosition	按钮的显示位置（int数组）：web列表=0，web详情=1，手机列表=100，手机详情=101	array<number>	@mock=$order(0,1)
         */
        functionbutton = functionbutton.filter(item => _.indexOf(item.displayposition, 0) > -1);
        const extraButtonData = functionbutton && functionbutton instanceof Array && functionbutton.filter(item => item.buttoncode === 'ShowModals');
        const buttoncode = ['CallService', 'CallService_showModal', 'PrintEntity', 'EntityDataOpenH5'];
        const extraToolbarData = functionbutton && functionbutton instanceof Array && functionbutton.filter(item => buttoncode.indexOf(item.buttoncode) > -1);
        yield put({ type: 'putState', payload: { extraButtonData, extraToolbarData } });
      } catch (e) {
        message.error(e.message);
      }
    },
    *onAddDone(action, { select, call, put }) {
      yield put({ type: 'queryList' });
      yield put({ type: 'putState', payload: { showModals: '' } });
    },
    *del(action, { select, call, put }) {
      const { currItem, relEntityId, relId, recordId, currItems } = yield select(modelSelector);
      try {
        const params = {
          entityId: relEntityId,
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

    *call({ payload: mobilephone }, { select, call, put }) {
      try {
        const params = {
          subject: {
            called: mobilephone, //被叫人手机号码
            caller: ''//主叫人手机号码（Web可以不传，服务自行查询）
          },
          info: {
            appID: 'eb9977aee4cce6fea895091c10f1ec00'//应用ID,暂时写死
          },
          timestamp: Date.parse(new Date()) / 1000 //当前时间戳
        };

        if (mobilephone) {
          const data = yield call(DJCloudCall, params);
          if (data.error_code === 0) {
            message.success('云平台将给您的号码拨打电话，请留意!');
          } else {
            message.error(data.error_msg);
          }
        } else {
          message.warning('当前无可拨打号码，无法拨通');
        }
      } catch (e) {
        message.error(e.message || '拨打失败');
      }
    },
    *transfer({ payload: targetUser }, { select, call, put }) {
      const { currItems, relEntityId: entityId } = yield select(modelSelector);
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
      const { currItems } = yield select(modelSelector);
      let params = {};
      params = {
        Recids: currItems.map(item => item.recid),
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
      const { dynamicModalData } = yield select(modelSelector);
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
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    queryListSuccess(state, { payload: { list, total } }) {
      return {
        ...state,
        list,
        total,
        currItems: []
      };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      };
    },
    modalPending(state, { payload: modalPending }) {
      return {
        ...state,
        modalPending
      };
    },
    resetState() {
      return {
        relId: '',
        recordId: '',
        relEntityId: '',
        relEntityName: '',
        queries: {},
        list: [],
        total: 0,
        currItems: [],
        entityTypes: [],
        modalPending: false,
        menus: [],
        iconField: null,
        listFields: [],
        currItem: null, // 当前展示记录id
        showModals: '',
        protocol: [],
        simpleSearchKey: 'recname',
        extraButtonData: [], //页面动态 按钮数据源
        extraToolbarData: [], //页面toolbar 动态按钮数据源
        dynamicModalData: {},
        sortFieldAndOrder: null, //当前排序的字段及排序顺序
        relCountData: null
      };
    }
  }
};
