import _ from 'lodash';
import { message, Modal } from 'antd';
import { queryEntityDetail } from '../services/entity';
import { getEntcommDetail, queryTabs, queryMainFields, follow } from '../services/entcomm';

const confirmModal = (title, callback) => {
  Modal.confirm({
    title,
    onOk() {
      callback(null, true);
    },
    onCancel() {
      callback(null, false);
    }
  });
};

export default {
  namespace: 'entcommHome',
  state: {
    entityId: null,
    recordId: null,
    entityName: '',
    recordDetail: {},
    relTabs: [],
    entityStages: [],
    stageDetail: null,
    mainFieldsConfig: {},
    firstLoad: true
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          // dispatch({ type: 'putState', payload: { entityId, recordId } });
          dispatch({ type: 'init', payload: { entityId, recordId } });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: { entityId, recordId } }, { select, put, call }) {
      const {
        entityId: lastEntityId,
        recordId: lastRecordId
      } = yield select(state => state.entcommHome);

      if (entityId !== lastEntityId || recordId !== lastRecordId) {
        yield put({ type: 'resetState' });
      }

      yield put({ type: 'putState', payload: { entityId, recordId } });

      // 获取实体信息
      if (entityId !== lastEntityId) {
        const { data: { entityproinfo } } = yield call(queryEntityDetail, entityId);
        yield put({
          type: 'putState',
          payload: { entityName: entityproinfo[0].entityname }
        });

        const { data: { reltablist } } = yield call(queryTabs, entityId);
        yield put({
          type: 'putState',
          payload: { relTabs: reltablist }
        });
      }

      // 获取记录详情
      if (recordId !== lastRecordId) {
        try {
          const params = {
            entityId,
            recId: recordId,
            needPower: 0 // TODO 跑权限
          };
          const { data: { detail: recordDetail } } = yield call(getEntcommDetail, params);
          yield put({
            type: 'putState',
            payload: { recordDetail }
          });

          // 获取顶部显示字段
          const mainFieldsConfig = yield call(queryMainFields, {
            entityid: entityId,
            typeid: recordDetail.rectype || entityId
          });
          yield put({
            type: 'putState',
            payload: { mainFieldsConfig }
          });
        } catch (e) {
          message.error(e.message);
        }

        // 获取实体阶段推进数据
        // const { data: { salesstage } } = yield call(queryEntityStage, recordDetail.rectype || entityId);
        // yield put({
        //   type: 'putState',
        //   payload: { entityStages: salesstage }
        // });
      }
    },
    *fetchRecordDetail(action, { select, put, call }) {
      const { entityId, recordId } = yield select(state => state.entcommHome);
      try {
        const params = {
          entityId,
          recId: recordId,
          needPower: 0 // TODO 跑权限
        };
        const { data: { detail: recordDetail } } = yield call(getEntcommDetail, params);
        yield put({
          type: 'putState',
          payload: { recordDetail }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *toggleFollow(action, { select, put, call }) {
      const { recordDetail, entityId } = yield select(state => state.entcommHome);
      if (!recordDetail.recid) return;
      try {
        const params = {
          recid: recordDetail.recid,
          entityid: entityId,
          isfollow: recordDetail.isfollowed ? 0 : 1,
          rectype: recordDetail.rectype
        };
        yield call(follow, params);
        message.success(params.isfollow ? '关注成功' : '已取消关注');
        yield put({ type: 'fetchRecordDetail' });
      } catch (e) {
        message.error(e.message || '操作失败');
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
    resetState() {
      return {
        entityId: null,
        recordId: null,
        entityName: '',
        recordDetail: {},
        relTabs: [],
        entityStages: [],
        stageDetail: null,
        mainFieldsConfig: {},
        firstLoad: true
      };
    }
  }
};
