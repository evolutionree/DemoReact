/**
 * Created by 0291 on 2018/6/6.
 */
import { message } from 'antd';
import { queryDicTypes, saveDicType, dictypedetail, delDicType, getfieldconfig } from '../services/dictionary.js';

export default {
  namespace: 'dictype',
  state: {
    list: [],
    currItem: {},
    showModals: '',
    searchName: '',
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/dictype') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put, call, select }) {
      yield put({ type: 'queryList' });
    },
    *queryList(action, { put, call, select }) {
      try {
        const { data } = yield call(queryDicTypes);
        yield put({ type: 'putState', payload: { list: data.fielddictype } });
      } catch (e) {
        console.error(e);
        message.error('查询列表数据失败');
      }
    },
    *search({ payload: { searchName } }, { select, call, put }) {
      yield put({ type: 'putState', payload: { searchName: searchName } });
    },
    *save({ payload: data }, { select, call, put }) {
      try {
        yield call(saveDicType, data);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList', payload: '' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    },
    *del({ payload: DicTypeId }, { select, call, put }) {
      try {
        yield call(delDicType, DicTypeId);
        message.success('删除成功');
        yield put({ type: 'queryList', payload: '' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    },
    *getdictypedetail({ payload: DicTypeId }, { select, call, put }) {
      try {
        const { data } = yield call(dictypedetail, { DicTypeId: DicTypeId });
        let dictypedetailData = data.dictypedetail;
        dictypedetailData = {
          ...dictypedetailData,
          relatedictypeid: dictypedetailData.relatedictypeid ? dictypedetailData.relatedictypeid : '',
          isconfig: !!dictypedetailData.isconfig
        }
        yield put({ type: 'putState', payload: { currItem: dictypedetailData } });
        yield put({ type: 'showModals', payload: 'edit' });
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
      }
    },
    *setGlobalConfig(action, { select, call, put }) {
      yield put({ type: 'showModals', payload: 'setGlobalConfig' });
      const { data } = yield call(getfieldconfig, -1);
      yield put({ type: 'putState', payload: { globalConfig: data.fieldconfig } });
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    resetState() {
      return {
        list: [],
        currItem: {},
        showModals: '',
        searchName: '',
        modalPending: false
      };
    }
  }
};
