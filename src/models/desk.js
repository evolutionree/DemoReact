/**
 * Created by 0291 on 2018/8/3.
 */
import { message } from 'antd';
import { getactualdesktopcom, getdeskcomponentlist } from '../services/deskConfig.js';
import _ from 'lodash';
import { hashHistory } from 'react-router';
import { saveactualdesktopcom } from "../services/deskConfig";

// const testData = [
//   {
//     "dscomponetid":"f58623233e8d-7311-4df8-b352-858309ba9f41",
//     "postion":{
//       X_Proportion: 0
//     },
//     "comname":"新增客户统计1",
//     "comtype":1,
//     "comwidth":1,
//     "comheighttype":1,
//     "mincomheight":500,
//     "maxcomheight":200,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   },
//   {
//     "dscomponetid":"f532863e8d-7311-4df8-b352-858309ba9f42",
//     "postion":{
//       X_Proportion: 350
//     },
//     "comname":"新增客户统计2",
//     "comtype":1,
//     "comwidth":1,
//     "comheighttype":1,
//     "mincomheight":500,
//     "maxcomheight":100,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   },
//   {
//     "dscomponetid":"f5863e8d-7311-4df8-b352-858309ba9f4f",
//     "postion":{
//       X_Proportion: 0
//     },
//     "comname":"新增客户统计",
//     "comtype":1,
//     "comwidth":2,
//     "comheighttype":1,
//     "mincomheight":500,
//     "maxcomheight":100,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   },
//   {
//     "dscomponetid":"f35863e8d-7311-4df8-b352-858309ba9f43",
//     "postion":{
//       X_Proportion: 0
//     },
//     "comname":"新增客户统计3",
//     "comtype":1,
//     "comwidth":1,
//     "comheighttype":1,
//     "mincomheight":500,
//     "maxcomheight":100,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   }
// ];
// const submitData = [
//   {
//     "dscomponetid":"f5863e8d-7311-4df8-b352-858309ba9f4f",
//     "postion":{
//       X_Proportion: 0
//     },
//     "comname":"新增客户统计",
//     "comtype":1,
//     "comwidth":2,
//     "comheighttype":1,
//     "mincomheight":500,
//     "maxcomheight":600,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   },
//   {
//     "dscomponetid":"a9cdb940-8349-4b92-a8ed-34dbfbc79af1",
//     "postion": {
//       X_Proportion: 0
//     },
//     "comname":"动态消息",
//     "comtype":1,
//     "comwidth":1,
//     "comheighttype":1,
//     "mincomheight":300,
//     "maxcomheight":400,
//     "comurl":null,
//     "comargs":null,
//     "comdesciption":null,
//     "status":1,
//     "validationstate":{
//       "errors":[
//         "组件处理页面不能为空",
//         "组件描述不能为空"
//       ],
//       "isvalid":false
//     }
//   }
// ]

export default {
  namespace: 'desk',
  state: {
    layoutComponents: [],
    componentList: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/deskconfig\/([^/]+)$/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const desktopid = match[1];
          dispatch({ type: 'putState', payload: { desktopid } });
          dispatch({ type: 'init', payload: desktopid });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'fetchdesk' });
      yield put({ type: 'fetchDeskComponent' });
    },
    *fetchdesk(action, { put, call, select }) {
      const { desktopid } = yield select(state => state.desk);
      try {
        const { data } = yield call(getactualdesktopcom, desktopid);
        yield put({ type: 'putState', payload: {
          layoutComponents: data.comitems
        } });
      } catch (e) {
        console.error(e);
      }
    },
    *fetchDeskComponent(action, { put, call, select }) {
      try {
        const { data } = yield call(getdeskcomponentlist, { comname: '', status: 1 });
        yield put({
          type: 'putState',
          payload: {
            componentList: data
          }
        });
      } catch (e) {
        message.error(e.message || '获取列表数据失败');
      }
    },
    *addLayout({ payload: { componentid, position, AllItemPotions } }, { put, call, select }) {
      console.log('------------------------------------------------')
      //TODO: 为什么多次执行？
      try {
        let { componentList, layoutComponents } = yield select(state => state.desk);

        //TODO: 页面组件布局变动后，再添加组件后， 需要记录布局，重新渲染页面

        const newLayoutComponents = AllItemPotions.map(newItemComponentPosition => {
          const currentItem = _.find(layoutComponents, oldItemCompomemt => oldItemCompomemt.dscomponetid === newItemComponentPosition.componentId);
          if (currentItem) {
            currentItem.postion = {
              X_Proportion: newItemComponentPosition.X
            };
          }
          return currentItem;
        });
        const newComponent = componentList.filter(item => {
          return item.dscomponetid === componentid;
        });
        let newlayoutComponents = _.cloneDeep(newLayoutComponents);
        if (newComponent.length === 1) {
          newComponent[0].postion = {
            X_Proportion: position.X
          };
          const findInsetComIndex = _.findIndex(newlayoutComponents, item => item.dscomponetid === position.insetComponentId);
          if (findInsetComIndex) { //插入到后面
            newlayoutComponents.splice(findInsetComIndex * 1 + 1, 0, newComponent[0]);
          } else {
            newlayoutComponents = [...newComponent, ...newlayoutComponents];
          }
          yield put({ type: 'putState', payload: { layoutComponents: _.uniqBy(newlayoutComponents, 'dscomponetid') } });
        }
      } catch (e) {
        console.error(e.message);
      }
    },
    *saveDeskTops({ payload: newLayoutComponents }, { put, call, select }) {
      const { desktopid } = yield select(state => state.desk);
      const params = {
        desktopid: desktopid,
        comitems: newLayoutComponents
      };

      try {
        yield call(saveactualdesktopcom, params);
        hashHistory.push('/deskconfig');
        message.success('更新成功');
      } catch (e) {
        console.error(e.message);
        message.error(e.message);
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
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    resetState() {
      return {
        layoutComponents: [],
        componentList: []
      };
    }
  }
};
