import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { queryRoles, addRole, copyRole, updateRole, queryGroups, delRole } from '../services/role';
import { getCorrectPager } from '../utils/common';

const _ = require('lodash');

export default {
  namespace: 'roleList',
  state: {
    roleGroups: [{
      rolegroupid: '',
      rolegroupname: '全部分组'
    }],

    queries: {},
    list: [],
    total: null,

    currentRecords: [],
    showModals: '',
    savePending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/roles') {
          dispatch({
            type: 'search',
            payload: location.query
          });
        } else {
          dispatch({
            type: 'resetState'
          });
        }
      });
    }
  },
  effects: {
    *search({ payload: queries }, { select, call, put }) {
      let groups = yield select(state => {
        return state.roleList.roleGroups;
      });

      // 先查询角色分组
      if (groups.length === 1) {
        const result = yield call(queryGroups);
        groups = groups.concat(result.data.rolegrouplist);
        groups.forEach(item => item.groupId = item.groupId + '');
        yield put({
          type: 'queryGroupsSuccess',
          payload: groups
        });
      }

      const { total, roleGroups } = yield select(state => state.roleList);
      const { pageIndex, pageSize } = getCorrectPager({ ...queries, total });
      let { roleName, groupId } = queries;
      roleName = (roleName && roleName.slice(0, 20)) || '';
      if (!_.find(roleGroups, ['rolegroupid', groupId])) {
        groupId = roleGroups[0].rolegroupid;
      }

      const corrected = { pageIndex, pageSize, roleName, groupId };
      yield put({
        type: 'query',
        payload: corrected
      });
    },
    *query({ payload: queries }, { call, put }) {
      yield put({
        type: 'queryRequest',
        payload: queries
      });
      try {
        const result = yield call(queryRoles, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            total: result.data.pagecount[0].total,
            list: result.data.page
          }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *save({ payload: params }, { call, put }) {
      yield put({ type: 'savePending', payload: true });
      try {
        const isEdit = !!params.roleid;

        yield call(isEdit ? updateRole : addRole, params);
        yield put({ type: 'savePending', payload: false });
        yield put({ type: 'hideModal' });

        yield put({
          type: 'refreshPage',
          payload: !isEdit
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
        yield put({ type: 'savePending', payload: false });
      }
    },
    *saveCopy({ payload: params }, { call, put }) {
      yield put({ type: 'savePending', payload: true });
      try {
        yield call(copyRole, params);
        yield put({ type: 'savePending', payload: false });
        yield put({ type: 'hideModal' });

        yield put({
          type: 'refreshPage',
          payload: true
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
        yield put({ type: 'savePending', payload: false });
      }
    },
    *del({ payload: id }, { call, put }) {
      try {
        yield call(delRole, id);
        yield put({ type: 'refreshPage' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *refreshPage({ payload: resetQuery }, { select, put }) {
      // dangerLocation
      const { query } = yield select(
        ({ routing }) => routing.locationBeforeTransitions
      );
      yield put(routerRedux.replace({
        pathname: '/roles',
        query: resetQuery ? undefined : query
      }));
    }
  },
  reducers: {
    queryGroupsSuccess(state, { payload }) {
      return { ...state, roleGroups: payload };
    },
    queryRequest(state, { payload: queries }) {
      return { ...state, queries };
    },
    querySuccess(state, { payload }) {
      const { list, total } = payload;
      return { ...state, list, total, currentRecords: [] };
    },
    add(state) {
      return { ...state, showModals: 'add' };
    },
    edit(state) {
      return { ...state, showModals: 'edit' };
    },
    savePending(state, { payload }) {
      return { ...state, savePending: payload };
    },
    showModals(state, { payload: showModals }) {
      return { ...state, showModals };
    },
    hideModal(state) {
      return { ...state, showModals: '' };
    },
    currentRecords(state, { payload: currentRecords }) {
      return { ...state, currentRecords };
    },
    resetState() {
      return {
        roleGroups: [{
          rolegroupid: '',
          rolegroupname: '全部分组'
        }],

        queries: {},
        list: [],
        total: null,

        currentRecords: [],
        showModals: '',
        savePending: false
      };
    }
  }
};
