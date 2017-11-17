/**
 * Created by 0291 on 2017/7/26.
 */
import { message } from 'antd';

import _ from 'lodash';
import { getnormtypelist, getyeartarget, getdepartment, saveyeartarget, gettargetdetail, savetarget } from '../services/salesTarget';

export default {
  namespace: 'salesTarget',
  state: {
    currSelectItems: [],
    breadcrumbData: [],
    params: {
      "year": new Date().getFullYear(),
      "normtypeid":"",
      "searchName":"",
      "departmentid":"00000000-0000-0000-0000-000000000000",
      reload: 0
    },
    pageIndex: 1,
    showModals: '',
    datacursor: [], //销售指标
    departmentOfficer: [],
    targetData: {},
    targetDataVisible: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/salestarget') {
          dispatch({
            type: 'init',
            payload: {}
          });
        }
      });
    }
  },
  effects: {
    *init({ payload: queries }, { select, put, call }) {
      const { params } = yield select(state => state.salesTarget);
      try {
        const { data } = yield call(getnormtypelist);
        yield put({
          type: 'putState',
          payload: { datacursor: data.datacursor, currSelectItems: [], params: { ...params, normtypeid: data.datacursor[0].normtypeid } }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *getyeartarget(action, { select, put, call }) {
      const { currSelectItems, params } = yield select(state => state.salesTarget);
      const queryParams = {
        id: currSelectItems[0].id,
        isgroup: currSelectItems[0].isgroup,
        normtypeid: params.normtypeid,
        year: params.year
      }
      try {
        const { data } = yield call(getyeartarget, queryParams);
        const yearTargetValue = data.datacursor;
        yield put({
          type: 'putState',
          payload: { departmentOfficer: yearTargetValue }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *gettargetdetail(action, { select, put, call }) {
      const { currSelectItems, params } = yield select(state => state.salesTarget);
      const queryParams = {
        normtypeid: params.normtypeid,
        year: params.year
      };
      if (currSelectItems[0].isgroup === 1) { //部门请求
        queryParams.isgrouptarget = true;
        queryParams.departmentid = currSelectItems[0].id;
      } else {
        queryParams.isgrouptarget = false;
        queryParams.userid = currSelectItems[0].id;
        queryParams.departmentid = params.departmentid;
      }

      try {
        const { data } = yield call(gettargetdetail, queryParams);
        const targetData = data.detail[0];
        targetData.normtypeid = params.normtypeid;
        yield put({
          type: 'putState',
          payload: { targetData, targetDataVisible: data.visible }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *saveYearTarget({ payload: submitData }, { select, put, call }) {
      const { params, currSelectItems } = yield select(state => state.salesTarget);
      submitData.map((item) => {
        item.year = params.year;
        item.normtypeid = params.normtypeid;
        item.departmentid = currSelectItems[0].id;
      });
      try {
        yield call(saveyeartarget, submitData);
        yield put({ type: 'putState', payload: { showModals: '', params: { ...params, reload: params.reload + 1 } } });
        message.success('销售目标分配成功');
      } catch (e) {
        message.error(e.message || '新增失败');
      }
    },
    *normtypeidChange({ payload: normtypeid }, { select, put, call }) {
      const { currSelectItems, params } = yield select(state => state.salesTarget);
      const queryParams = {
        normtypeid,
        year: params.year
      };
      if (currSelectItems[0].isgroup === 1) { //部门请求
        queryParams.isgrouptarget = true;
        queryParams.departmentid = currSelectItems[0].id;
      } else {
        queryParams.isgrouptarget = false;
        queryParams.userid = currSelectItems[0].id;
      }

      try {
        const { data } = yield call(gettargetdetail, queryParams);
        const targetData = data.detail[0];
        targetData.normtypeid = normtypeid;
        yield put({
          type: 'putState',
          payload: { targetData, targetDataVisible: data.visible }
        });
      } catch (e) {
        message.error(e.message || '查询失败');
      }
    },
    *importModal({ payload: type }, { select, put, call }) {
      const { userid } = yield select(state => state.app.user);
      const importUrl = '/api/salestarget/importdata';
      const importTemplate = `/api/salestarget/exporttemplate?UserId=${userid}`;
      const explainInfo = [
        '列表头不能删除，示例数据和提示说明链接请删除',
        '列表头中红色字段必填',
        '名称列填写在用的团队组织名称或人员名称，必填',
        '指标类型必须为系统中存在的指标类型，必填',
        '目标类型需注明是团队目标或人员目标，必填',
        '年度目标和各月份目标数值，整数或者小数',
        '若是团队目标，通过全路径匹配团队组织',
        '若是人员目标，通过人员名称匹配对应人员'
      ];
      yield put({ type: 'task/impModals', payload: { templateType: 1, importUrl, importTemplate, explainInfo } });
    },

    *savetarget({ payload: submitData }, { select, put, call }) {
      const { currSelectItems, params } = yield select(state => state.salesTarget);
      const submitData_finally = submitData;
      if (currSelectItems[0].isgroup === 1) { //部门请求
        submitData_finally.isgrouptarget = true;
        submitData_finally.departmentid = currSelectItems[0].id;
      } else {
        submitData_finally.isgrouptarget = false;
        submitData_finally.userid = currSelectItems[0].id;
        submitData_finally.departmentid = params.departmentid;
      }

      try {
        yield call(savetarget, submitData_finally);
        message.success('保存成功');
        yield put({ type: 'putState', payload: { showModals: '', params: { ...params, reload: params.reload + 1 } } });
      } catch (e) {
        message.error(e.message || '查询失败');
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

    changeParams(state, { payload: field }) {
      return {
        ...state,
        params: {
          ...state.params,
          ...field,
          reload: state.params.reload + 1
        }
      };
    },
    addBreadcrumbData(state, { payload: item }) {
      let changeBreadcrumbData = state.breadcrumbData;
      changeBreadcrumbData.push(item)
      return {
        ...state,
        breadcrumbData: changeBreadcrumbData
      };
    },

    reducerBreadcrumbData(state, { payload: departmentid }) {
      let breadcrumbData = state.breadcrumbData;
      let newBreadcrumbData = [];

      if (departmentid === '00000000-0000-0000-0000-000000000000') {//根节点

      } else {
        for (let i = 0; i < breadcrumbData.length; i++) {
          newBreadcrumbData.push(breadcrumbData[i]);
          if (breadcrumbData[i].departmentid === departmentid) {
            break;
          }
        }
      }


      return {
        ...state,
        breadcrumbData: newBreadcrumbData
      };
    },

    yearTargetValueChange(state, { payload: { index, value } }) {
      let departmentOfficer = _.cloneDeep(state.departmentOfficer);
      departmentOfficer[index].yearcount = value;
      departmentOfficer[index].yearcount = departmentOfficer[index].yearcount ? departmentOfficer[index].yearcount : 0;
      return {
        ...state,
        departmentOfficer: departmentOfficer
      };
    },
    yearTargetValueBlur(state, { payload: { index, value } }) {
      let departmentOfficer = _.cloneDeep(state.departmentOfficer);
      departmentOfficer[index].yearcount = (departmentOfficer[index].yearcount * 1).toFixed(4);
      return {
        ...state,
        departmentOfficer: departmentOfficer
      };
    },

    showModal(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },

    targetDataChange(state, { payload: targetData }) {
      return {
        ...state,
        targetData
      };
    }
  }
};
