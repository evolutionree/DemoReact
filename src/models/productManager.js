import { routerRedux } from 'dva/router';
import { message } from 'antd';
import _ from 'lodash';
import { getSeries, getProducts, enableProductSerial, delSeries, delProduct, addSeries, updateSeries, enableProduct, addProduct, updateProduct } from '../services/products';
import { getGeneralProtocol, addEntcomm, editEntcomm } from '../services/entcomm';

const ProductEntityId = '59cf141c-4d74-44da-bca8-3ccf8582a1f2';

function getRootSeriesId(series) {
  const rootSeries = _.find(series, ['nodepath', 0]);
  return rootSeries && rootSeries.productsetid;
}

export default {
  namespace: 'productManager',
  state: {
    series: [],
    queries: {},
    listProtocol: [],
    list: [],
    total: null,
    currentItems: [],
    showModals: '',
    modalPending: false,
    showDisabledSeries: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/products') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
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
    *queryList(action, { select, put, call }) {
      let { series, listProtocol } = yield select(state => state.productManager);
      if (!series.length) {
        try {
          const result = yield call(getSeries, {
            ProductsetId: '',
            Direction: 'DOWNER'
          });
          series = result.data;
          yield put({ type: 'putState', payload: { series } });
        } catch (e) {
          message.error(e.message || '获取产品系列失败');
          return;
        }
      }
      if (!listProtocol.length) {
        yield put({ type: 'queryListProtocol' });
      }

      const { query } = yield select(state => state.routing.locationBeforeTransitions);
      const params = {
        productSeriesId: getRootSeriesId(series),
        recStatus: 1,
        pageIndex: 1,
        pageSize: 10,
        searchKey: '',
        includeChild: true,
        recVersion: 0,
        ...query
      };
      yield put({ type: 'putState', payload: { queries: params } });
      try {
        const { data } = yield call(getProducts, params);
        yield put({
          type: 'putState',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total,
            currentItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取产品列表失败');
      }
    },
    *querySeries(action, { select, put, call }) {
      const { showDisabledSeries } = yield select(state => state.productManager);
      try {
        const { data } = yield call(getSeries, {
          ProductsetId: '',
          Direction: 'DOWNER',
          IsGetDisable: showDisabledSeries ? 1 : 0
        });
        yield put({ type: 'putState', payload: { series: data } });
      } catch (e) {
        message.error(e.message || '获取产品系列失败');
      }
    },
    *queryListProtocol(action, { put, call }) {
      try {
        const { data: listProtocol } = yield call(getGeneralProtocol, {
          operatetype: 2,
          typeid: ProductEntityId
        });
        yield put({ type: 'putState', payload: { listProtocol } });
      } catch (e) {
        message.error(e.message || '获取列表协议失败');
      }
    },
    *saveSeries({ payload: { seriesName_lang, seriesCode } }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const {
          showModals,
          queries: { productSeriesId }
        } = yield select(state => state.productManager);
        const isEdit = /editSeries/.test(showModals);
        const params = isEdit ? {
          seriesName_lang,
          seriesCode,
          ProductsetId: productSeriesId
        } : {
          seriesName_lang,
          seriesCode,
          TopSeriesId: productSeriesId
        };
        yield call(isEdit ? updateSeries : addSeries, params);
        yield put({ type: 'showModals', payload: '' });
        message.success('保存成功');
        yield put({ type: 'querySeries' });
      } catch (e) {
        yield put({ type: 'modalPending' });
        message.error(e.message || '保存失败');
      }
    },
    *saveProduct({ payload: fieldData }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const {
          showModals,
          queries: { productSeriesId },
          currentItems
        } = yield select(state => state.productManager);
        if (/editProduct/.test(showModals)) {
          yield call(updateProduct, {
            fieldData,
            recId: currentItems[0].recid,
            typeId: ProductEntityId
          });
          yield put({ type: 'showModals', payload: '' });
          message.success('保存成功');
          yield put({ type: 'search' });
        } else {
          yield call(addProduct, {
            fieldData,
            ExtraData: { productsetid: productSeriesId },
            typeId: '59cf141c-4d74-44da-bca8-3ccf8582a1f2'
          });
          yield put({ type: 'showModals', payload: '' });
          message.success('保存成功');
          yield put({ type: 'queryList' });
        }
      } catch (e) {
        yield put({ type: 'modalPending' });
        message.error(e.message || '保存失败');
      }
    },
    *enableProducts({ payload: flag }, { select, put, call }) {
      try {
        const { currentItems } = yield select(state => state.productManager);
        const ids = currentItems.filter(item => !item.recstatus !== !flag).map(item => item.recid).join(',');
        yield call(flag ? enableProduct : delProduct, ids);
        message.success(flag ? '启用成功' : '停用成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || (flag ? '启用失败' : '停用失败'));
      }
    },
    *enableSeries({ payload: flag }, { select, put, call }) {
      const {
        queries: { productSeriesId },
        series,
        showDisabledSeries
      } = yield select(state => state.productManager);
      const recstatus = _.find(series, ['productsetid', productSeriesId]).recstatus;
      try {
        yield call(flag ? enableProductSerial : delSeries, productSeriesId);
        message.success(recstatus ? '停用成功' : '启用成功');
        yield put({ type: 'querySeries' });
        if (!flag && !showDisabledSeries) {
          yield put({ type: 'search', payload: { productSeriesId: getRootSeriesId(series) } });
        }
      } catch (e) {
        message.error(e.message || (recstatus ? '停用失败' : '启用失败'));
      }
    },
    *toggleShowDisabledSeries(action, { select, put, call }) {
      const {
        queries: { productSeriesId },
        series,
        showDisabledSeries
      } = yield select(state => state.productManager);
      const recstatus = _.find(series, ['productsetid', productSeriesId]).recstatus;
      yield put({
        type: 'putState',
        payload: {
          showDisabledSeries: !showDisabledSeries
        }
      });
      yield put({ type: 'querySeries' });
      if (showDisabledSeries && recstatus === 0) {
        yield put({ type: 'search', payload: { productSeriesId: getRootSeriesId(series) } });
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
        modalPending: modalPending || false
      };
    },
    resetState() {
      return {
        series: [],
        queries: {},
        listProtocol: [],
        list: [],
        total: null,
        currentItems: [],
        showModals: '',
        modalPending: false,
        showDisabledSeries: false
      };
    }
  }
};
