/**
 * Created by 0291 on 2018/6/27.
 */
import { message } from 'antd';
import { queryqrcodelist, addqrcodelist, editqrcodelist } from '../services/qrcodeentrance.js';
import { GetArgsFromHref } from '../utils/index.js';
import _ from 'lodash';

export default {
  namespace: 'qrcodeentrance',
  state: {
    list: [],
    keyword: '',
    currItem: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/qrcodeentrance') {
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: action }, { select, put, call }) {
      yield put({ type: 'fetchList' });
    },
    *fetchList(action, { put, call, select }) { //查询列表数据
      try {
        const { data } = yield call(queryqrcodelist);
        yield put({ type: 'putState', payload: { list: data } });
      } catch (e) {
        console.error(e);
        message.error(e.message || '查询列表数据失败');
      }
    },
    *add({ payload: submitData }, { put, call, select }) { //新增列表数据
      try {
        yield call(addqrcodelist, submitData);
        yield put({ type: 'fetchList' });
        yield put({ type: 'showModals', payload: '' });
        message.success('新增成功');
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '新增失败');
      }
    },
    *edit({ payload: submitData }, { put, call, select }) { //修改列表数据
      try {
        yield call(editqrcodelist, submitData);
        yield put({ type: 'fetchList' });
        yield put({ type: 'showModals', payload: '' });
        message.success('修改成功');
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '修改失败');
      }
    },
    *del({ payload: recid }, { put, call, select }) { //查询列表数据
      // try {
      //   yield call(addqrcodelist, recid);
      //   yield put({ type: 'fetchList' });
      //   message.success('删除成功');
      // } catch (e) {
      //   console.error(e.message);
      //   message.error(e.message || '删除失败');
      // }
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showModals(state, { payload: payload }) {
      return {
        ...state,
        showModals: payload
      };
    },
    resetState() {
      return {
        list: [],
        keyword: ''
      };
    }
  }
};
