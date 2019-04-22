import { routerRedux } from 'dva/router';
import { message, Modal } from 'antd';
import {
  queryUsers,
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
  updateDeptStatus,
  passwordvalid,
  forcelogout,
  getLoginInfoList,
  forceDeviceLogout
} from '../services/structure';
import { registerUser } from '../services/authentication';
import { queryDataSourceData } from '../services/datasource';
import { addgroupuser } from '../services/attendance';

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
    showDisabledDepts: false,
    attenceGroupDataSource: [],
    liginInfoList: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/structure') {
          dispatch({ type: 'init' });
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload }, { call, put }) {
      // 获取考勤组数据源
      // const response = yield call(queryDataSourceData, {
      //   sourceId: 'b241f8e1-2e9d-4a22-9b6a-3e4c93f1de01',
      //   keyword: '', pageSize: 1000, pageIndex: 1, queryData: []
      // });
      // const attenceGroupDataSource = response.data && response.data.page;
      // if (attenceGroupDataSource) yield put({ type: 'putState', payload: { attenceGroupDataSource } });
    },
    *search({ payload }, { select, put }) {
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
      const { queries: { deptId }, departments, showDisabledDepts } = yield select(state => state.structure);
      const currentDept = _.find(departments, ['deptid', deptId]);
      const brotherDepts = departments.filter(dept => (dept.ancestor === currentDept.ancestor && (showDisabledDepts ? dept.recstatus === 1 : true)));
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
      } else {
        message.info('已到达当前层级的顶（底）层，无法移动。');
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
      const user = currentItems.map(u => u.userid).join(',');
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
    },
    *bindAttence({ payload: groupObj }, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const UserSelect = currentItems.map(item => {
        return { name: item.accountname, id: item.accountid };
      });
      try {
        yield call(addgroupuser, {
          DeptSelect: [],
          UserSelect,
          ScheduleGroup: groupObj
        });
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e);
        message.error(e.message || '分组失败');
      }
    },
    *setPwdValid({ payload }, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const submitData = currentItems.map(item => item.userid);
      try {
        yield call(passwordvalid, submitData);
        message.success('设置成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e);
        message.error(e.message || '设置密码失效失败');
      }
    },
    *setForceLogout({ payload }, { select, call, put }) {
      const { currentItems } = yield select(state => state.structure);
      const submitData = currentItems.map(item => {
        return {
          userid: item.userid,
          ForceType: 0
        };
      });

      try {
        yield call(forcelogout, submitData);
        message.success('设置成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        console.error(e);
        message.error(e.message || '注销设备失败');
      }
    },
    *getLoginInfoList({ payload, msg }, { call, put }) {
      try {
        const data = yield call(getLoginInfoList, payload);
        yield put({ type: 'putState', payload: { liginInfoList: data.data } });
        if (msg) message.success(msg);
      } catch (e) {
        message.error(e.message || '获取用户登录信息失败');
      }
    },
    *forceDeviceLogout({ payload }, { call, put }) {
      try {
        const data = yield call(forceDeviceLogout, payload);
        
        //刷新列表
        yield put({ type: 'getLoginInfoList', payload: payload[0].UserId, msg: data.data });
      } catch (e) {
        message.error(e.message || '注销设备失败');
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
