import { message } from 'antd';
import * as _ from 'lodash';
import { queryVocationFunctions, queryFunctions, saveVocationFunctions } from '../services/functions';

export default {
  namespace: 'vocationRule',
  state: {
    functions: [],
    currFunction: null,
    ruleDetail: {},
    fields: [],
    allFunctions: [],
    vocationId: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/vocation\/([^/]+)\/([^/]+)\/rule/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const vocationId = match[1];
          dispatch({ type: 'getVocationId', payload: vocationId });
          dispatch({ type: 'queryVocationFunctions', payload: vocationId });
          dispatch({ type: 'queryAllFunctions' });
        }
      });
    }
  },
  effects: {
    *getVocationId({ payload: voicationid }, { put }) {
      yield put({ type: 'gotVocationId', payload: voicationid });
    },
    *queryVocationFunctions({ payload: vocationid }, { select, put, call }) {
      // let { allFunctions } = yield select(state => state.vocationRule);
      //
      // if (!allFunctions.length) {
      //   try {
      //     const result = yield call(queryFunctions);
      //     allFunctions = result.data;
      //     yield put({ type: 'gotAllFunctions', payload: allFunctions });
      //   } catch (e) {
      //     console.error(e);
      //     message.error('查询数据失败');
      //   }
      // }

      try {
        const { data } = yield call(queryVocationFunctions, vocationid);
        yield put({ type: 'gotVocationFunctions', payload: data });
      } catch (e) {
        console.error(e);
        message.error('查询数据失败');
      }
    },
    *queryAllFunctions(action, { put, call }) {
      try {
        const { data } = yield call(queryFunctions);
        yield put({ type: 'gotAllFunctions', payload: data });
      } catch (e) {
        console.error(e);
        message.error('查询数据失败');
      }
    },
    *saveVocationRule({ payload: params }, { put, call, dispatch }) {
      try {
        const { data } = yield call(saveVocationFunctions, params);
        message.success('保存成功');
      } catch (e) {
        console.error(e);
        message.error('保存失败');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    gotVocationFunctions(state, { payload: data }) {
      let filers = data.datacursor.filter(item =>  (item.hasfunc === 1));
      const hasFuncsIds = filers.map(item => item.funcid);
      return {
        ...state,
        selectedFuncs: {
          checked: hasFuncsIds,
          halfChecked: []
        }
      };
    },
    // gotVocationFunctions(state, { payload: data }) {
    //   const { allFunctionsTree } = state;
    //   const hasFuncsIds = data.datacursor.filter(item => item.hasfunc === 1).map(item => item.funcid);
    //
    //   const checked = [];
    //   const halfChecked = [];
    //
    //   loopNodes(allFunctionsTree);
    //
    //   function loopNodes(nodes) {
    //     nodes.forEach(node => {
    //       const { children, funcid } = node;
    //       if (children.length) {
    //         loopNodes(children);
    //       }
    //       if (node.funcname === '全部' && !_.includes(hasFuncsIds, funcid)) {
    //         debugger;
    //       }
    //       node.checked = _.includes(hasFuncsIds, funcid);
    //       node.halfChecked = node.checked && children.some(child => !child.checked || child.halfChecked);
    //       if (node.halfChecked) {
    //         halfChecked.push(funcid);
    //       } else if (node.checked) {
    //         checked.push(funcid);
    //       }
    //     });
    //   }
    //
    //   return {
    //     ...state,
    //     selectedFuncs: {
    //       checked,
    //       halfChecked
    //     }
    //   };
    // },
    gotVocationId(state, { payload: vocationid }) {
      return {
        ...state,
        vocationId: vocationid
      };
    },
    gotAllFunctions(state, { payload: allFunctions }) {
      return {
        ...state,
        allFunctions
      };
    }
    // gotAllFunctions(state, { payload: allFunctions }) {
    //   const allFunctionsTree = allFunctions.filter(item => item.ancestor === '1fc3a304-9e5c-4f8e-852b-ef947645aa98');
    //
    //   addChildrenToNodes(allFunctionsTree);
    //
    //   function addChildrenToNodes(nodes) {
    //     nodes.forEach(node => {
    //       const { funcid } = node;
    //       node.children = allFunctions.filter(item => item.ancestor === funcid);
    //       addChildrenToNodes(node.children);
    //     });
    //   }
    //
    //   return {
    //     ...state,
    //     allFunctions,
    //     allFunctionsTree
    //   };
    // }
  }
};
