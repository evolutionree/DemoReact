/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { query as queryEntities, getreltabentity } from '../services/entity';
import { savetransferscheme, transferschemelist, setstatus } from '../services/transferscheme';

export default {
  namespace: 'transferscheme',
  state: {
    entities: [],
    queries: {},
    list: [],
    currItems: [],
    showModals: '',
    modalPending: false,
    relTabEntity: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/transferscheme') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put, call, select }) {
      yield put({ type: 'queryEntity' });
      yield put({ type: 'queryList' });
    },
    *queryEntity(action, { put, call, select }) {
      const params = {
        pageIndex: 1,
        pageSize: 999,
        typeId: -1,
        entityName: '',
        status: 1
      };
      try {
        const { data: { pagedata } } = yield call(queryEntities, params);
        const filertEntities = pagedata.filter(item => {
          return item.modeltype === 0 || item.modeltype === 2;
        });
        yield put({ type: 'putState', payload: { entities: filertEntities } });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *queryList(action, { put, call, select }) {
      const { query } = yield select(({ routing }) => routing.locationBeforeTransitions);
      const queries = {
        searchName: '',
        RecStatus: 1,
        ...query
      };
      yield put({ type: 'putState', payload: { queries } });
      try {
        const { data } = yield call(transferschemelist, queries);
        yield put({
          type: 'putState',
          payload: {
            list: data,
            currItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *search({ payload }, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          ...payload
        }
      }));
    },
    *targetEntitySelect({ payload: entityid }, { select, call, put }) {
      const { data } = yield call(getreltabentity, entityid);
      yield put({ type: 'putState', payload: { relTabEntity: data } });
    },
    *save({ payload: data }, { select, call, put }) {
      const { currItems } = yield select(state => state.transferscheme);
      let submitData = data;
      if (currItems[0]) {
        submitData.transschemeid = currItems[0].transschemeid;
      }
      if (submitData.associationtransfer instanceof Array && submitData.associationtransfer.length > 0) {
        submitData.associationtransfer = submitData.associationtransfer.map(item => {
          item.cascade = item.cascade ? 1 : 0;
          item.same = item.same ? 1 : 0;
          return item;
        });
      }

      submitData.associationtransfer = JSON.stringify(submitData.associationtransfer)

      try {
        yield call(savetransferscheme, submitData);
        message.success('保存成功');
        yield put({ type: 'queryList' });
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *setstatus({ payload: setStatusValue }, { select, call, put }) {
      const { currItems } = yield select(state => state.transferscheme);
      const RecIds = currItems.map(item => {
        return item.transschemeid;
      })
      const messageinfo = setStatusValue === 1 ? '启用' : '禁用';
      try {
        yield call(setstatus, {
          RecIds: RecIds.join(','),
          status: setStatusValue
        });
        message.success(messageinfo + '成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || messageinfo + '失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    currItems(state, { payload: currItems }) {
      return {
        ...state,
        currItems
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      };
    },
    resetState() {
      return {
        entities: [],
        queries: {},
        list: [],
        currItems: [],
        showModals: '',
        modalPending: false,
        relTabEntity: []
      };
    }
  }
};
