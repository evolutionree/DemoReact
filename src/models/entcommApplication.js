import { message } from 'antd';
import _ from 'lodash';
import { routerRedux } from 'dva/router';
import { getGeneralListProtocol, getListData, delEntcomm, transferEntcomm, getFunctionbutton, extraToolbarClickSendData, savemailowner, queryWorkflow, getEntcommDetail } from '../services/entcomm';
import { queryMenus, queryEntityDetail, queryTypes, queryListFilter, DJCloudCall } from '../services/entity';

export default {
  namespace: 'entcommApplication',
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
    extraButtonData: [], //页面动态 按钮数据源
    extraToolbarData: [], //页面toolbar 动态按钮数据源
    dynamicModalData: {},
    sortFieldAndOrder: null, //当前排序的字段及排序顺序
    ColumnFilter: null, //字段查询
    selectedFlowObj: null, //审批流

    funBtnInfo: null, //当前点击的functionButton 的信息
    copyData: null
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
      const { menus, entityId, ColumnFilter } = yield select(({ entcommApplication }) => entcommApplication);
      if (!entityId || !menus.length) return;
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
      if (ColumnFilter) {
        queries.ColumnFilter = ColumnFilter;
      }
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
      const { entityId, currItems } = yield select(state => state.entcommApplication);
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

        functionbutton instanceof Array && functionbutton.map(item => {
          //转化表单是通过functionButton对象里extradata.type==='transform'匹配显示在页面的   对，这里的规则确实恶心 我也没办法啊啊啊啊啊啊啊啊啊啊啊啊啊  搞不懂  0_0
          const extradataType = ['transform', 'copybutton'];
          if (extradataType.indexOf(item.extradata.type) > -1) {
            item.funccode = item.buttoncode;
            item.buttoncode = item.extradata.type;
            extraToolbarData.push(item);
          }
        });

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
    },
    *queryCopyData({ payload: submitData }, { select, call, put }) {
      const { entityId, currItems } = yield select(state => state.entcommApplication);
      const params = { entityId, recId: currItems[0].recid, needPower: 0 }
      const { data: { detail } } = yield call(getEntcommDetail, params);
      detail.rectype = entityId; //简单实体 只有一个 默认实体类型
      yield put({ type: 'putState', payload: { showModals: 'showCopy', copyData: detail } });
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
        dynamicModalData: {},
        sortFieldAndOrder: null, //当前排序的字段及排序顺序
        ColumnFilter: null, //字段查询
        selectedFlowObj: null,  //审批流
        funBtnInfo: null, //当前点击的functionButton 的信息
        copyData: null
      };
    }
  }
};
