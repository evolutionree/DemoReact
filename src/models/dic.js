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
    dicTypes: [],
    currentDicType: '',
    currentActiveId: '',
    navList: null,
    dicdata: null,
    extConfig: null
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
        yield put({ type: 'putState', payload: { dicTypes: data.fielddictype } });
      } catch (e) {
        console.error(e);
        message.error('查询字典类型数据失败');
      }
    },
    *fetchdicvalue({ payload: dicType }, { put, call, select }) {
      try {
        const { data } = yield call(queryfielddicvalue, dicType);
        const dicdata = data.data;
        const parentdata = data.parentdata
        yield put({ type: 'putState', payload: { currentDicType: dicType, extConfig: data.config } });
        if (parentdata instanceof Array && parentdata.length > 0) {
          let relateCategoryData = {}; //字典类型可能存在关联字段类型  则该字典值数据展示会按关联字典的字典值分类显示
          parentdata.map(parentItem => {
            relateCategoryData[parentItem.dicid] = dicdata.filter(item => item.relatedataid === parentItem.dicid);
          });
          yield put({ type: 'putState', payload: {
            navList: data.parentdata,
            currentActiveId: data.parentdata[0].dicid,
            dicdata: relateCategoryData
          } });
        } else {
          yield put({ type: 'putState', payload: { dicdata } });
        }
      } catch (e) {
        console.error(e);
        message.error('查询列表数据失败');
      }
    },
    *changeDicType({ payload: dicType }, { put, call, select }) {
      yield put({ type: 'fetchdicvalue', payload: dicType });
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
        dicTypes: [],
        currentActiveId: '',
        navList: null,
        dicdata: null
      };
    }
  }
};
