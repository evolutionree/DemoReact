/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { getdesklist } from '../services/deskConfig';

const columns = [{
  title: '工作台名称',
  dataIndex: 'name'
}, {
  title: '工作台说明',
  dataIndex: 'explain'
}, {
  title: '状态',
  dataIndex: 'status'
}, {
  title: '已绑定对象',
  dataIndex: 'object'
}, {
  title: '版本后',
  dataIndex: 'version'
}, {
  title: '最后修改时间',
  dataIndex: 'modifytime'
}];

const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    recid: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`
  });
}

export default {
  namespace: 'deskconfig',
  state: {
    protocol: columns,
    queries: {},
    list: data,
    total: 0,
    currItems: [],
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/config-desk') {
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
        const { data } = yield call(getdesklist);
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
    *searchKeyword({ payload: keyword }, { select, call, put }) {

    },
    *save({ payload: submitData }, { select, call, put }) {

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
        protocol: columns,
        queries: {},
        list: data,
        total: 0,
        currItems: [],
        showModals: ''
      };
    }
  }
};
