import { message } from 'antd';
import * as _ from 'lodash';
import { queryTabsList, delEntcomm, delRelItem, getGeneralListProtocol } from '../services/entcomm';
import { queryMobFieldVisible, queryEntityDetail,queryTypes, DJCloudCall } from '../services/entity';
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
    list: [],
    entityTypes: [],
    iconField: null,
    listFields: [],
    currItem: null, // 当前展示记录id
    showModals: '',
    protocol: []
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
    *init(action, { select, put,call }) {
      yield put({ type: 'putState', payload: { list: [], iconField: null, listFields: [] } });
      // yield put({ type: 'queryEntityDetail' });
      yield put({ type: 'fetchList' });
      const { relEntityId } = yield select(modelSelector);
      // 获取实体类型
      const { data: { entitytypepros: entityTypes } } = yield call(queryTypes, { entityId: relEntityId });
      yield put({ type: 'entityTypes', payload: entityTypes });

      // 获取协议
      const { data: protocol } = yield call(getGeneralListProtocol, { typeId: relEntityId });
      yield put({ type: 'protocol', payload: protocol });
    },
    *queryEntityDetail(action, { select, call, put }) {
      // const { relEntityId } = yield select(modelSelector);
      // const { data: { entityproinfo } } = yield call(queryEntityDetail, relEntityId);
      // yield put({
      //   type: 'putState',
      //   payload: { relEntityName: entityproinfo[0].entityname }
      // });
    },
    *fetchList(action, { select, call, put }) {
      const { recordId, relId, relEntityId } = yield select(modelSelector);
      try {
        // 获取显示字段
        const { data } = yield call(queryMobFieldVisible, relEntityId);
        const { iconField, listFields } = parseConfigData(data.fieldmobstyleconfig[0]);
        yield put({ type: 'putState', payload: { iconField, listFields } });

        const params = {
          recid: recordId,
          relId,
          relEntityId
        };
        const { data: { pagedata: list } } = yield call(queryTabsList, params);
        yield put({
          type: 'putState',
          payload: {
            list
          }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *onAddDone(action, { select, call, put }) {
      yield put({ type: 'fetchList' });
      yield put({ type: 'putState', payload: { showModals: '' } });
    },
    *delCurrItem(action, { select, call, put }) {
      const { currItem, relEntityId, relId, recordId } = yield select(modelSelector);
      const { relTabs } = yield select(state => state.entcommHome);

      if (relTabs.length && relId && relEntityId) {
        const tabInfo = _.find(relTabs, item => {
          return item.relid === relId && item.relentityid === relEntityId;
        });
        if (tabInfo && tabInfo.ismanytomany) {
          try {
            const params = {
              recid: currItem,
              relid: relId,
              relrecid: recordId,
              // pagecode: 'EntityListPage',
              // pagetype: 1
            };
            yield call(delRelItem, params);
            message.success('删除成功');
            yield put({ type: 'putState', payload: { currItem: null } });
            yield put({ type: 'fetchList' });
          } catch (e) {
            message.error(e.message || '删除失败');
          }
          return;
        }
      }

      try {
        const params = {
          entityid: relEntityId,
          recid: currItem,
          pagecode: 'EntityListPage',
          pagetype: 1
        };
        yield call(delEntcomm, params);
        message.success('删除成功');
        yield put({ type: 'putState', payload: { currItem: null } });
        yield put({ type: 'fetchList' });
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
          const { data } = yield call(DJCloudCall, params);
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
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    entityTypes(state, { payload: entityTypes }) {
      return {
        ...state,
        entityTypes
      };
    },
    protocol(state, { payload: protocol }) {
      return { ...state, protocol };
    },
    resetState() {
      return {
        relId: '',
        recordId: '',
        relEntityId: '',
        relEntityName: '',
        list: [],
        entityTypes: [],
        iconField: null,
        listFields: [],
        currItem: null,
        showModals: '',
        protocol: []
      };
    }
  }
};
