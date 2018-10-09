/**
 * Created by 0291 on 2018/6/6.
 */
import { message } from 'antd';
import { queryDicTypes, queryfielddicvalue, savedictionary, delDicOption, orderbydictionary } from '../services/dictionary.js';
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
    extConfig: null,
    currentEditRowIndex: '',
    editData: {}
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
      const { currentActiveId } = yield select(state => state.dic);
      try {
        const { data } = yield call(queryfielddicvalue, dicType);
        const dicdata = data.data;
        const parentdata = data.parentdata
        yield put({ type: 'putState', payload: { currentDicType: dicType, extConfig: data.config, currentEditRowIndex: '' } });
        if (parentdata instanceof Array && parentdata.length > 0) {
          let relateCategoryData = {}; //字典类型可能存在关联字段类型  则该字典值数据展示会按关联字典的字典值分类显示
          parentdata.map(parentItem => {
            relateCategoryData[parentItem.dicid] = dicdata.filter(item => item.relatedataid === parentItem.dicid);
          });
          yield put({ type: 'putState', payload: {
            navList: data.parentdata,
            currentActiveId: currentActiveId ? currentActiveId : data.parentdata[0].dicid,
            dicdata: relateCategoryData
          } });
        } else {
          yield put({ type: 'putState', payload: {
            dicdata,
            currentActiveId: '',
            navList: null
          } });
        }
      } catch (e) {
        console.error(e);
        message.error('查询列表数据失败');
      }
    },
    *changeDicType({ payload: dicType }, { put, call, select }) {
      yield put({ type: 'fetchdicvalue', payload: dicType });
    },
    *add({ payload: submitData }, { put, call, select }) {
      const { currentDicType, currentActiveId, extConfig } = yield select(state => state.dic);
      const params = {
        dictypeId: currentDicType,
        relatedataid: currentActiveId,
        recstatus: 1,
        ...submitData,
        ...extConfig
      }
      try {
        yield call(savedictionary, params);
        message.success('新增成功');
        yield put({ type: 'fetchdicvalue', payload: currentDicType });
      } catch (e) {
        console.error(e);
        message.error(e.message);
      }
    },
    *update({ payload: submitData }, { put, call, select }) {
      const { currentDicType } = yield select(state => state.dic);
      try {
        yield call(savedictionary, submitData);
        message.success('修改成功');
        yield put({ type: 'fetchdicvalue', payload: currentDicType });
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        console.error(e);
        message.error(e.message);
      }
    },
    *del({ payload: dicid }, { put, call, select }) {
      const { currentDicType } = yield select(state => state.dic);
      try {
        yield call(delDicOption, dicid);
        message.success('删除成功');
        yield put({ type: 'fetchdicvalue', payload: currentDicType });
      } catch (e) {
        console.error(e);
        message.error(e.message);
      }
    },
    *orderby({ payload: listData }, { put, call, select }) {
      const { currentDicType } = yield select(state => state.dic);
      try {
        yield call(orderbydictionary, listData);
        message.success('排序成功');
        yield put({ type: 'fetchdicvalue', payload: currentDicType });
      } catch (e) {
        console.error(e);
        message.error(e.message);
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
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    changeType(state, { payload: newActiveId }) {
      return {
        ...state,
        currentActiveId: newActiveId,
        currentEditRowIndex: ''
      };
    },
    resetState() {
      return {
        dicTypes: [],
        currentDicType: '',
        currentActiveId: '',
        navList: null,
        dicdata: null,
        extConfig: null,
        currentEditRowIndex: '',
        editData: {}
      };
    }
  }
};
