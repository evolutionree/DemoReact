/**
 * Created by 0291 on 2018/6/6.
 */
import { message } from 'antd';
import { queryDicTypes, queryfielddicvalue } from '../services/dictionary.js';
import { GetArgsFromHref } from '../utils/index.js';
import _ from 'lodash';

export default {
  namespace: 'dic',
  state: {
    dicTyps: [],
    currentActiveId: '',
    navList: null,
    dicdata: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dic') {
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: action }, { select, put, call }) { //进入页面就查商机类型
      // const { currentActiveId } = yield select(state => state.dic);
      yield put({ type: 'fetchDicTypes' });
    },
    *fetchDicTypes(action, { put, call, select }) { //查询所有字典类型
      try {
        const { data } = yield call(queryDicTypes);
        if (data.fielddictype.length > 0) {
          yield put({ type: 'fetchdicvalue', payload: data.fielddictype[0].dictypeid });
        }
        yield put({ type: 'putState', payload: { dicTyps: data.fielddictype } });
      } catch (e) {
        console.error(e);
        message.error('查询字典类型数据失败');
      }
    },
    *fetchdicvalue({ payload }, { put, call, select }) {
      try {
        const { data } = yield call(queryfielddicvalue, 16);
        const dicdata = data.data;
        const parentdata = data.parentdata

        if (parentdata instanceof Array && parentdata.length > 0) {
          let relateCategoryData = {}; //字典类型可能存在关联字段类型  则该字典值数据展示会按关联字典的字典值分类显示
          parentdata.map(item => {
            relateCategoryData[item.dicid] = dicdata.filter(item => item.relatedataid === item.dicid);
          });
          yield put({ type: 'putState', payload: {
            navList: data.parentdata,
            currentActiveId: data.parentdata[0].dicid,
            dicdata: relateCategoryData
          } });
        }
        yield put({ type: 'putState', payload: { dicdata } });
      } catch (e) {
        console.error(e);
        message.error('查询列表数据失败');
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

    changeType(state, { payload: newActiveId }) {
      return {
        ...state,
        currentActiveId: newActiveId
      };
    },
    resetState() {
      return {
        dicTyps: [],
        currentActiveId: '',
        navList: null,
        dicdata: null
      };
    }
  }
};
