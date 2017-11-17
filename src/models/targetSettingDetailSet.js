/**
 * Created by 0291 on 2017/8/2.
 */
import { message } from 'antd';

import _ from 'lodash';
import { parseRuleDetail, ruleListToItems } from '../components/FilterConfigBoard';
import { getentitylist, queryentityfield, queryentityProfield, savenormtyperule, getnormtyperule } from '../services/targetSetting.js';
import { hashHistory } from 'react-router';
import { GetArgsFromHref } from '../utils/index.js';


export default {
  namespace: 'targetSettingDetailSet',
  state: {
    ruleList: [],
    ruleSet: "",
    entities: [], //详情页 实体 下拉列表数据源
    entityFieldData: [], //详情页 可选字段 下拉列表数据源
    datacursor: [],
    btnLoading: false,
    entityId: '', //详情页 实体 下拉列表当前选中的值
    ruleid: '', //判断当前为新增还是修改
    fieldname: '',
    bizdatefieldname: '', //业务日期字段
    normtypename: '',
    bizDateField: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/targetsetting\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const normtypeid = match[1];
          dispatch({ type: 'putState', payload: { normid: normtypeid, normtypename: GetArgsFromHref('normtypename') } });
          dispatch({
            type: 'init',
            payload: { }
          });
        } else {
          dispatch({
            type: 'resetState'
          });
        }
      });
    }
  },
  effects: {
    *init({ payload: queries }, { select, put, call }) {
      yield put({ type: 'getnormtyperule' });
    },
    *getnormtyperule(action, { select, put, call }) {
      const { normid } = yield select(state => state.targetSettingDetailSet);
      try {
        const { data } = yield call(getnormtyperule, { id: normid });
        const { ruleList, ruleSet } = parseRuleDetail(data[0] || {});
        yield put({
          type: 'putState',
          payload: { ruleList, ruleSet, normid,
            entityId: data[0].entityid ? data[0].entityid : '',
            ruleid: data[0].ruleid ? data[0].ruleid : '',
            fieldname: data[0].fieldname ? data[0].fieldname : '',
            bizdatefieldname: data[0].bizdatefieldname ? data[0].bizdatefieldname : ''
          }
        });

        yield put({ type: 'getentitylist' });
      } catch (e) {
        message.error(e.message || '查询数据失败');
      }
    },
    *getentitylist(action, { select, put, call }) {
      const { entityId } = yield select(state => state.targetSettingDetailSet);
      try {
        const { data } = yield call(getentitylist);
        const entities = data.datacursor;
        yield put({
          type: 'putState',
          payload: { entities }
        });
        if (entityId) { //是否设置了规则(修改页)
          yield put({ type: 'queryentityfield', payload: entityId });
          yield put({ type: 'queryentityProfield', payload: entityId });
        } else if (entities && entities.length > 0) {
          yield put({ type: 'queryentityfield', payload: entities[0].entityid });
        }
      } catch (e) {
        message.error(e.message || '查询数据失败');
      }
    },
    *queryentityfield({ payload: entityId }, { put, call }) {
      try {
        const { data } = yield call(queryentityfield, { entityId, fieldtype: 0 });
        const { data: bizDateField } = yield call(queryentityfield, { entityId, fieldtype: 1 });
        const datacursor = data.datacursor;
        yield put({
          type: 'putState',
          payload: {
            bizDateField: bizDateField.datacursor,
            datacursor: datacursor.map(item => ({
              controlType: item.controltype,
              fieldId: item.fieldid,
              fieldLabel: item.fieldlabel,
              fieldConfig: item.fieldconfig,
              recStatus: item.recstatus,
              fieldName: item.fieldname,
              displayName: item.displayname,
              caculatetype: item.caculatetype
            })),
            entityId }
        });
      } catch (e) {
        message.error(e.message || '查询数据失败');
      }
    },
    *queryentityProfield({ payload: entityId }, { put, call }) {
      try {
        const { data } = yield call(queryentityProfield, { entityId });
        const entityFieldData = data.entityfieldpros;
        yield put({
          type: 'putState',
          payload: {
            entityFieldData: entityFieldData.map(item => ({
              controlType: item.controltype,
              fieldId: item.fieldid,
              fieldLabel: item.fieldlabel,
              fieldConfig: item.fieldconfig,
              recStatus: item.recstatus,
              fieldName: item.fieldname,
              displayName: item.displayname
            })),
            entityId }
        });
      } catch (e) {
        message.error(e.message || '查询数据失败');
      }
    },
    *entitySelect({ payload: entityId }, { select, put, call }) {
      yield put({ type: 'queryentityfield', payload: entityId });
      yield put({ type: 'queryentityProfield', payload: entityId });
      yield put({ type: 'putState', payload: { ruleList: [], ruleSet: '', fieldname: '', bizdatefieldname: '' } });
    },
    *saveNormTypeRule({ payload: submitData }, { select, put, call }) {
      const { entityFieldData, entityId, ruleid } = yield select(state => state.targetSettingDetailSet);
      let params = _.cloneDeep(submitData);
      params.ruleitems = ruleListToItems(submitData.ruleitems, entityFieldData, entityId);
      if (ruleid) {
        params.ruleid = ruleid;
      }
      if (!params.fieldname) {
        message.warning('请完善第一步信息');
        return false;
      }
      if (!params.bizdatefieldname) {
        message.warning('请完善第三步信息');
        return false;
      }
      try {
        yield put({ type: 'putState', payload: { btnLoading: true } });
        yield call(savenormtyperule, params);
        message.success('保存成功');
        yield put({ type: 'putState', payload: { btnLoading: false } });
        hashHistory.push('/targetsetting');
      } catch (e) {
        message.error(e.message || '提交失败');
        yield put({ type: 'putState', payload: { btnLoading: false } });
      }
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },

    ruleChange(state, { payload: payload }) {
      return {
        ...state,
        ruleList: payload
      };
    },

    ruleSetChange(state, { payload: payload }) {
      return {
        ...state,
        ruleSet: payload
      };
    },

    resetState() {
      return {
        ruleList: [],
        ruleSet: "",
        entities: [], //详情页 实体 下拉列表数据源
        entityFieldData: [], //详情页 可选字段 下拉列表数据源
        datacursor: [],
        btnLoading: false,
        entityId: '', //详情页 实体 下拉列表当前选中的值
        ruleid: '', //判断当前为新增还是修改
        fieldname: '',
        bizdatefieldname: '', //业务日期字段
        normtypename: '',
        bizDateField: []
      };
    }
  }
};
