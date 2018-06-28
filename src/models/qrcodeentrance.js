/**
 * Created by 0291 on 2018/6/27.
 */
import { message } from 'antd';
import { queryqrcodelist, addqrcodelist, editqrcodelist, getmatchparam, orderbyrule, updatematchparam } from '../services/qrcodeentrance.js';
import { GetArgsFromHref } from '../utils/index.js';
import _ from 'lodash';

export default {
  namespace: 'qrcodeentrance',
  state: {
    list: [],
    keyword: '',
    currItems: [],
    matchParams: {},
    showModals: ''
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
        yield put({ type: 'putState', payload: { list: data, currItems: [] } });
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
    },
    *orderby({ payload: listData }, { put, call, select }) {
      const recids = listData.map(item => item.recid).join(',');
      try {
        yield call(orderbyrule, { recids });
        message.success('排序成功');
        yield put({ type: 'fetchList' });
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        console.error(e);
        message.error(e.message);
      }
    },
    *queryMatchParam({ payload: recid }, { put, call, select }) {
      const { currItems } = yield select(state => state.qrcodeentrance);
      try {
        const { data } = yield call(getmatchparam, currItems[0].recid);
        if (data.checktype !== 3) {
          message.error('目前只支持编辑【UScript】类型的匹配规则');
          return;
        } else {
          yield put({ type: 'putState', payload: { matchParams: {
            recid: currItems[0].recid,
            checktype: data.checktype,
            ...data.checkparam,
            uscriptparam: data.checkparam.uscriptparam.uscript
          } } });
          yield put({ type: 'showModals', payload: 'matchparams' });
        }
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取匹配定义详情失败');
      }
    },
    *updatematchparams({ payload: submitData }, { put, call, select }) {
      try {
        yield call(updatematchparam, submitData);
        yield put({ type: 'fetchList' });
        yield put({ type: 'showModals', payload: '' });
        message.success('更新成功');
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '更新失败');
      }
    },
    *queryEntry({ payload: recid }, { put, call, select }) {
      yield put({ type: 'showModals', payload: 'entry' });
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
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    resetState() {
      return {
        list: [],
        keyword: '',
        currItems: [],
        matchParams: {}
      };
    }
  }
};
