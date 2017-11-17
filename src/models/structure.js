import { routerRedux } from 'dva/router';
import { message, Modal } from 'antd';
import {
  queryUsers,
  registerUser,
  updateUser,
  createDepartment,
  updateDepartment,
  assignRoleUser,
  queryDepartmentData,
  orderDepartment,
  updateUserStatus,
  updateUserDept,
  batchhRevertPassword,
  setLeader,
  updateDeptStatus
} from '../services/structure';
// import { getCorrectPager } from '../utils/common';


function getRootId(tree) {
  const rootFolder = _.find(tree, ['nodepath', 0]);
  return rootFolder && rootFolder.deptid;
}

const _ = require('lodash');

const confirmModal = (title, callback) => {
  Modal.confirm({
    title,
    onOk() {
      callback(null, true);
    },
    onCancel() {
      callback(null, false);
    }
  });
};

export default {
  namespace: 'structure',
  state: {
    roles: [],
    departments: [],
    queries: {},
    list: [],
    total: null,
    currentItems: [],
    showModals: '',
    modalPending: false,
    showDisabledDepts: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/structure') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *search({ payload }, { select, call, put }) {
      const location = yield select(({ routing }) => routing.locationBeforeTransitions);
      const { pathname, query } = location;
      yield put(routerRedux.push({
        pathname,
        query: {
          ...query,
          pageIndex: 1,
          ...payload
        }
      }));
    },
    *queryList(action, { select, put, call }) {
      let { departments } = yield select(state => state.structure);
      if (!departments.length) {
        try {
          const result = yield call(queryDepartmentData, { raw: true, status: 0 });
          departments = result.data;
          yield put({ type: 'putState', payload: { departments } });
        } catch (e) {
          message.error(e.message || '获取部门失败');
          return;
        }
      }

      const { query } = yield select(state => state.routing.locationBeforeTransitions);
      const params = {
        deptId: getRootId(departments),
        pageIndex: 1,
        pageSize: 10,
        recStatus: '1',
        userName: '',
        userPhone: '',
        ...query
      };
      yield put({ type: 'putState', payload: { queries: params } });
      try {
        const { data } = yield call(queryUsers, params);
        yield put({
          type: 'putState',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total,
            currentItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表失败');
      }
    },
    *registerUser({ payload }, { call, put }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const params = {
          accountpwd: '999999',
          usericon: 'ICON',
          ...payload
        };

        yield call(registerUser, params);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'search' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '保存失败');
      }
    },
    *updateUser({ payload }, { call, put }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const params = {
          usericon: 'ICON',
          ...payload
        };

        yield call(updateUser, params);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '保存失败');
      }
    },
    *orderDept({ payload: dir }, { select, call, put }) {
      const { queries: { deptId }, departments } = yield select(state => state.structure);
      const currentDept = _.find(departments, ['deptid', deptId]);
      const brotherDepts = departments.filter(dept => dept.ancestor === currentDept.ancestor);
      const currIndex = _.findIndex(brotherDepts, ['deptid', deptId]);
      const targetDept = brotherDepts[dir === 1 ? currIndex + 1 : currIndex - 1];
      if (targetDept) {
        try {
          const params = {
            deptId,
            changeDeptId: targetDept.deptid
          };
          yield call(orderDepartment, params);
          yield put({ type: 'fetchDepartments' });
        } catch (e) {
          message.error(e.message || '操作失败');
        }
      }
    },
    *fetchDepartments(actions, { select, call, put }) {
      try {
        const { data: departments } = yield call(queryDepartmentData, { raw: true, status: 0 });
        yield put({ type: 'putState', payload: { departments } });
      } catch (e) {
        message.error(e.message || '获取部门失败');
      }
    },
    *createDepartment({ payload: params }, { select, call, put }) {
      try {
        yield call(createDepartment, params);
        message.success('新增部门成功');
        yield put({ type: 'fetchDepartments' });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'app/fetchDepartments' });
      } catch (e) {
        message.error(e.message || '新增部门失败');
      }
    },
    *updateDepartment({ payload: params }, { select, call, put }) {
      try {
        yield call(updateDepartment, params);
        message.success('提交数据成功');
        yield put({ type: 'fetchDepartments' });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'app/fetchDepartments' });
      } catch (e) {
        message.error(e.message || '编辑部门失败');
      }
    },
    *assignRole({ payload: params }, { call, put }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        yield call(assignRoleUser, params);
        message.success('分配职能和角色成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        yield put({ type: 'modalPending', payload: false });
        message.error(e.message || '分配职能和角色失败');
      }
    },
    *toggleUserStatus(action, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const user = currentItems[0];
      try {
        yield call(updateUserStatus, {
          userid: user.userid,
          status: user.recstatus ? 0 : 1
        });
        message.success('操作成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *toggleDeptStatus(action, { select, call, put }) {
      const { queries, departments } = yield select(state => state.structure);
      const dept = _.find(departments, ['deptid', queries.deptId]);
      try {
        yield call(updateDeptStatus, {
          deptid: dept.deptid,
          recstatus: dept.recstatus ? 0 : 1
        });
        message.success('操作成功');
        yield put({ type: 'fetchDepartments' });
        yield put({ type: 'app/fetchDepartments' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *revertPassword({ payload: params }, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const user = currentItems.map(u => u.userid).join(',')
      try {
        yield call(batchhRevertPassword, user, params.accountpwd);
        message.success('重置密码成功');
        yield put({ type: 'putState', payload: { showModals: '', currentItems: [] } });
      } catch (e) {
        message.error(e.message || '重置密码失败');
      }
    },
    *toggleSetLeader(action, { select, call, put, cps }) {
      const { currentItems } = yield select(state => state.structure);
      const user = currentItems[0];
      const isLeader = user.isleader;
      const confirmed = yield cps(
        confirmModal,
        isLeader ? '确定将所选人员取消设置为领导？' : '确定将所选人员设置为领导？'
      );
      if (!confirmed) return;
      try {
        yield call(setLeader, {
          userid: user.userid,
          isleader: isLeader ? 0 : 1
        });
        message.success('设置成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '设置失败');
      }
    },
    *changeUserDept({ payload: { deptId, effectivedate } }, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const user = currentItems[0];
      try {
        yield call(updateUserDept, {
          userid: user.userid,
          deptId,
          effectivedate: effectivedate + '-01 00:00:00'
        });
        message.success('操作成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    modalPending(state, { payload: modalPending }) {
      return {
        ...state,
        modalPending: modalPending || false
      };
    },
    showModals(state, { payload }) {
      return { ...state, showModals: payload, modalPending: false };
    },
    toggleShowDisabledDepts(state) {
      return {
        ...state,
        showDisabledDepts: !state.showDisabledDepts
      };
    }
  }
};
