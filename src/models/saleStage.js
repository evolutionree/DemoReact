/**
 * Created by 0291 on 2017/7/26.
 */
import { message } from 'antd';

import _ from 'lodash';
import {
  queryTypes
} from '../services/entity.js';
import { querysalesstage, insertsalesstage, openhighsetting, updatesalesstage, orderbysalesstage, disabledsalesstage } from '../services/saleStage.js';
import { GetArgsFromHref } from '../utils/index.js';

export default {
  namespace: 'saleStage',
  state: {
    btnLoading: false,
    businessType: [],
    businessTypeActiveId: '',
    highsetting: 0,  //是否开启高级设置  0=不启用，1=启用
    salesstage: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/salestage') {
          if (GetArgsFromHref('busintypeid')) {
            dispatch({
              type: 'queryTypes',
              payload: { entityId: '2c63b681-1de9-41b7-9f98-4cf26fd37ef1' }
            });
            dispatch({
              type: 'putState',
              payload: { businessTypeActiveId: GetArgsFromHref('busintypeid') }
            });
            dispatch({
              type: 'querySalesStage',
              payload: { }
            });
          } else {
            dispatch({
              type: 'init',
              payload: { entityId: '2c63b681-1de9-41b7-9f98-4cf26fd37ef1' } //商机的entityId
            });
          }
        }
      });
    }
  },
  effects: {
    *init({ payload: queries }, { select, put, call }) { //进入页面就查商机类型
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      try {
        const { data } = yield call(queryTypes, queries);
        yield put({
          type: 'querySuccess',
          payload: { businessType: data.entitytypepros, businessTypeActiveId: businessTypeActiveId ? businessTypeActiveId : data.entitytypepros[0].categoryid }
        });
        yield put({ type: 'querySalesStage', payload: {} });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *queryTypes({ payload: queries }, { put, call }) {
      try {
        const { data } = yield call(queryTypes, queries);
        yield put({
          type: 'querySuccess',
          payload: { businessType: data.entitytypepros }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *querySalesStage({ payload: queries }, { select, put, call }) {
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      const { data: { salesstage, highsetting } } = yield call(querysalesstage, { SalesstageTypeId: businessTypeActiveId, ForAdmin: 1 });
      yield put({
        type: 'querySuccess',
        payload: { salesstage, highsetting }
      });
    },
    *addSalesStage({ payload: queries }, { select, put, call }) {
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      try {
        const params = {
          stageName_lang: queries.stageName_lang,
          winRate: queries.winRate / 100,
          SalesstageTypeId: businessTypeActiveId
        };

        yield call(insertsalesstage, params);
        message.success('添加成功');
        yield put({ type: 'querySalesStage', payload: '' });
      } catch (e) {
        message.error(e.message || '添加失败');
      }
    },
    *updateSalesStage({ payload: queries }, { select, put, call }) {
      const { salesstageid, stagename, winrate } = queries;
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      try {
        const params = {
          salesstageid,
          stagename,
          winrate: winrate / 100,
          SalesstageTypeId: businessTypeActiveId
        };

        yield call(updatesalesstage, params);
        message.success('更新成功');
        yield put({ type: 'querySalesStage', payload: {} });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *switchSalesStage({ payload: item }, { select, put, call }) {
      try {
        yield call(disabledsalesstage, { salesStageId: item.salesstageid, recstatus: item.recstatus === 1 ? 0 : 1 });
        yield put({ type: 'querySalesStage', payload: {} });
        item.recstatus === 1 ? message.success('禁用成功') : message.success('启用成功');
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *deleteSalesStage({ payload: item }, { select, put, call }) {
      try {
        yield call(disabledsalesstage, { salesStageId: item.salesstageid, recstatus: 2 });
        yield put({ type: 'querySalesStage', payload: {} });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *orderBySalesStage({ payload: salesStageId }, { select, put, call }) {
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      try {
        yield call(orderbysalesstage, { salesStageIds: salesStageId, SalesstageTypeId: businessTypeActiveId });
        yield put({ type: 'querySalesStage', payload: {} });
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *higthGradeChange({ payload: checked }, { select, put, call }) {
      const { businessTypeActiveId } = yield select(state => state.saleStage);
      try {
        const params = {
          IsOpenHighSetting: checked ? 1 : 0,
          TypeId: businessTypeActiveId
        };

        yield call(openhighsetting, params);
        yield put({ type: 'querySalesStage', payload: {} });
        message.success(checked ? '开启成功' : '关闭成功');
      } catch (e) {
        message.error(e.message || '开启失败');
      }
    }
  },
  reducers: {
    queryRequest(state) {
      return { ...state };
    },
    querySuccess(state, { payload: result }) {
      return {
        ...state,
        ...result
      };
    },
    queryFailure(state) {
      return { ...state };
    },
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },

    changeType(state, { payload: categoryid }) {
      return {
        ...state,
        businessTypeActiveId: categoryid
      };
    },


    showModal(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      }
    }
  }
};
