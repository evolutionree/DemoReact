/**
 * Created by 0291 on 2017/12/13.
 */
import { message } from 'antd';
import { getreconvertmaillst, reconvermail } from '../services/mailRecovery';
import { queryDataSourceData } from '../services/datasource';

export default {
  namespace: 'mailrecovery',
  state: {
    serchValue: null,
    mailAddressList: [], //账号下拉列表数据
    pageSize: 10,
    pageIndex: 1,
    total: 0,
    dataSource: [], //表格数据
    currItems: [], //表格选中数据
    userDataSourceData: [] //用户选择 全部数据（组件做匹配用）
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mailrecovery') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put }) {
      yield put({ type: 'queryDataSourceData' });
    },
    *queryDataSourceData(action, { select, call, put }) {
      const params = {
        keyword: '',
        pageSize: 999999,
        pageIndex: 1,
        sourceId: 'b301532c-f678-459b-b802-6ae45a97de86',
        queryData: [{
          username: '',
          islike: 1 }]
      };
      const { data } = yield call(queryDataSourceData, params);
      yield put({
        type: 'putState',
        payload: { userDataSourceData: data.page }
      });
    },
    *queryList(action, { select, call, put }) {
      const { serchValue, pageSize, pageIndex } = yield select(state => state.mailrecovery);
      const params = {
        ...serchValue,
        pageSize,
        pageIndex
      }
      try {
        const { data } = yield call(getreconvertmaillst, params);
        yield put({
          type: 'putState',
          payload: { dataSource: data.datalist, total: data.pageinfo.totalcount, pageIndex: params.pageIndex, pageSize: params.pageSize }
        });
      } catch (e) {
        message.error(e.message || '获取邮件列表失败');
      }
    },
    *search({ payload: serchValue }, { select, call, put }) {
      yield put({
        type: 'putState',
        payload: { serchValue }
      });
      yield put({ type: 'queryList' });
    },
    *changePageIndex({ payload: page }, { select, call, put }) {
      yield put({
        type: 'putState',
        payload: { pageIndex: page }
      });
      yield put({ type: 'queryList' });
    },
    *changePageSize({ payload: size }, { select, call, put }) {
      yield put({
        type: 'putState',
        payload: { pageSize: size }
      });
      yield put({ type: 'queryList' });
    },
    *reconvermail(action, { select, call, put }) { //邮件恢复
      const { currItems } = yield select(state => state.mailrecovery);
      if (currItems && currItems instanceof Array && currItems.length > 0) {
        const MailIds = currItems.map(item => item.mailid);
        try {
          const { data } = yield call(reconvermail, { MailIds: MailIds.join(',') });
          message.success(data.tipmsg);
          yield put({ type: 'queryList' });
        } catch (e) {
          message.error(e.message || '恢复邮件失败');
        }
      } else {
        message.warning('请先选择要恢复的邮件');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return { ...state, ...payload };
    },
    resetState() {
      return {
        serchValue: null,
        mailAddressList: [], //账号下拉列表数据
        pageSize: 10,
        pageIndex: 1,
        total: 0,
        dataSource: [], //表格数据
        currItems: [], //表格选中数据
        userDataSourceData: [] //用户选择 全部数据（组件做匹配用）
      };
    }
  }
};
