import { message } from 'antd';
import { queryReminderDetail, saveReminderDetail } from '../services/reminder';
import { queryFields } from '../services/entity';
import { parseRuleDetail, ruleListToItems } from '../components/FilterConfigBoard';

let modelDirty = false;

export default {
  namespace: 'collectorDetail',
  state: {
    collectorId: null,
    collectorName: '',
    entityFields: [],
    ruleList: [],
    ruleSet: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/collector\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const [whole, collectorId, collectorName] = match;
          dispatch({ type: 'init', payload: collectorId });
          dispatch({ type: 'putState', payload: { collectorName } });
          modelDirty = true;
        } else {
          modelDirty && dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: collectorId }, { call, put }) {
      yield put({ type: 'putState', payload: { collectorId } });
      yield put({ type: 'queryDetail' });
    },
    *queryDetail(action, { select, call, put }) {
      const { collectorId } = yield select(state => state.collectorDetail);
      try {
        const { data } = yield call(queryReminderDetail, collectorId);
        yield put({
          type: 'queryDetailSuccess',
          payload: data
        });
        yield put({ type: 'queryFields' });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *queryFields(action, { select, call, put }) {
      const { collectorDetail } = yield select(state => state.collectorDetail);
      try {
        const { data } = yield call(queryFields, collectorDetail.entityid);
        yield put({
          type: 'putState',
          payload: { entityFields: data.entityfieldpros.filter(field => !!field.recstatus) }
        });
      } catch (e) {
        message.error(e.message || '获取字段数据失败');
      }
    },
    *save({ payload }, { call, put }) {
      try {
        yield call(saveReminderDetail, payload);
        message.success('保存成功');
        yield put({ type: 'queryDetail' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    queryDetailSuccess(state, { payload: collectorDetail }) {
      const { ruleSet, ruleList } = parseRuleDetail(collectorDetail);
      return {
        ...state,
        collectorDetail,
        ruleSet,
        ruleList,
        receivers: collectorDetail.receiver,
        receiverRange: collectorDetail.receiverrange,
        messageTemplateTitle: collectorDetail.title || '',
        messageTemplateContent: (collectorDetail.content || '').replace(/^##|##$/g, ''),
        updateFields: collectorDetail.updatefield || [],
        shouldSendMessage: !!collectorDetail.receiver.length
      };
    },
    resetState() {
      return {
        collectorId: null,
        collectorName: '',
        entityFields: [],
        ruleList: [],
        ruleSet: ''
      };
    }
  }
};
