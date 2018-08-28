/**
 * Created by 0291 on 2018/5/21.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getdeskcomponentlist, deskcomponentsave } from '../services/deskConfig';

const columns = [{
  title: '组件名称',
  dataIndex: 'name'
}, {
  title: '组件分类',
  dataIndex: 'type'
}, {
  title: '状态',
  dataIndex: 'status'
}, {
  title: '组件宽度',
  dataIndex: 'width'
}, {
  title: '初始高度',
  dataIndex: 'initH'
}, {
  title: '最小高度',
  dataIndex: 'minH'
}, {
  title: '最大高度',
  dataIndex: 'maxH'
}, {
  title: '处理页面',
  dataIndex: 'page'
}, {
  title: '参数',
  dataIndex: 'params'
}, {
  title: '说明',
  dataIndex: 'explain'
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
  namespace: 'deskcomponentconfig',
  state: {
    menus: [],
    protocol: columns,
    queries: {},
    list: data,
    total: 46,
    currItems: [],
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/config-deskcomponent') {
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
        const { data } = yield call(getdeskcomponentlist);
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

    },
    *searchKeyword({ payload: keyword }, { select, call, put }) {

    },
    *save({ payload: submitData }, { select, call, put }) {
      console.log(submitData)
      try {
        yield call(deskcomponentsave, submitData);
      } catch (e) {

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
    queries(state, { payload: queries }) {
      return { ...state, queries };
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
        menus: [],
        protocol: [],
        queries: {},
        list: [],
        total: 0,
        currItems: [],
        showModals: ''
      };
    }
  }
};
