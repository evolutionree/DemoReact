import { message } from 'antd';
import { queryReminderDetail, saveReminderDetail } from '../services/reminder';
import { queryFields } from '../services/entity';
import { parseRuleDetail, ruleListToItems } from '../components/FilterConfigBoard';

let modelDirty = false;

export default {
  namespace: 'reminderDetail',
  state: {
    reminderId: null,
    reminderName: '',
    entityFields: [],
    ruleList: [],
    ruleSet: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/reminder\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const [whole, reminderId, reminderName] = match;
          dispatch({ type: 'init', payload: reminderId });
          dispatch({ type: 'putState', payload: { reminderName: decodeURI(reminderName) } });
          modelDirty = true;
        } else {
          modelDirty && dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: reminderId }, { call, put }) {
      yield put({ type: 'putState', payload: { reminderId } });
      yield put({ type: 'queryDetail' });
    },
    *queryDetail(action, { select, call, put }) {
      const { reminderId } = yield select(state => state.reminderDetail);
      try {
        const { data } = yield call(queryReminderDetail, reminderId);
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
      const { reminderDetail } = yield select(state => state.reminderDetail);
      try {
        const { data } = yield call(queryFields, reminderDetail.entityid);
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
    queryDetailSuccess(state, { payload: reminderDetail }) {
      const { ruleSet, ruleList } = parseRuleDetail(reminderDetail);
      return {
        ...state,
        reminderDetail,
        ruleSet,
        ruleList,
        receivers: reminderDetail.receiver,
        receiverRange: reminderDetail.receiverrange,
        messageTemplateTitle: reminderDetail.title || '',
        messageTemplateContent: (reminderDetail.content || '').replace(/^##|##$/g, '')
      };
    },
    resetState() {
      return {
        reminderId: null,
        reminderName: '',
        entityFields: [],
        ruleList: [],
        ruleSet: ''
      };
    }
  }
};
