/**
 * Created by 0291 on 2017/8/2.
 */
import { message } from 'antd';

import _ from 'lodash';
import { getnormtypelist, savenormtype, deletenormtype } from '../services/targetSetting.js';

export default {
  namespace: 'targetSetting',
  state: {
    listData: [],//首页列表数据
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/targetsetting') {
          dispatch({
            type: 'init'
          });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'getnormtypelist' });
    },
    *getnormtypelist(action, { select, put, call }) {
      try {
        const { data } = yield call(getnormtypelist);
        yield put({
          type: 'putState',
          payload: { listData: data.datacursor }
        });
      } catch (e) {
        message.error(e.message || '查询指标列表数据失败');
      }
    },
    *addTarget({ payload: params }, { put, call }) {
      try {
        yield call(savenormtype, { normtypename_lang: params.normtypename_lang });
        yield put({ type: 'getnormtypelist' });
        message.success('新增成功');
      } catch (e) {
        message.error(e.message || '新增失败');
      }
    },
    *updateTarget({ payload: params }, { put, call }) {
      try {
        yield call(savenormtype, { id: params.normtypeid, normtypename_lang: params.normtypename_lang });
        yield put({ type: 'getnormtypelist' });
        message.success('更新成功');
      } catch (e) {
        message.error(e.message || '更新失败');
      }
    },
    *delTarget({ payload: params }, { put, call }) {
      try {
        yield call(deletenormtype, { id: params.normtypeid });
        yield put({ type: 'getnormtypelist' });
        message.success('删除成功');
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
