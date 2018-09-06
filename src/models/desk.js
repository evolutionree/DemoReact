/**
 * Created by 0291 on 2018/8/3.
 */
import { message } from 'antd';
import { getdesktop, getdeskcomponentlist } from '../services/deskConfig.js';
import _ from 'lodash';
import { savedesktop } from "../services/deskConfig";

export default {
  namespace: 'desk',
  state: {
    leftComponent: [],
    rightComponent: [],
    componentList: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/desk') {
          dispatch({ type: 'init' });
        }
      });
    }
  },
  effects: {
    *init({ payload: action }, { select, put, call }) {
      yield put({ type: 'fetchdesk' });
      yield put({ type: 'fetchDeskComponent' });
    },
    *fetchdesk(action, { put, call, select }) {
      try {
        const { data } = yield call(getdesktop);
        yield put({ type: 'putState', payload: {
          leftComponent: data.leftdesktopcomponents,
          rightComponent: data.rightdesktopcomponents
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
    *addLayout({ payload: componentid }, { put, call, select }) {
      console.log('------------------------------------------------')
      const { componentList, leftComponent } = yield select(state => state.desk);
      const newComponent = componentList.filter(item => {
        return item.dscomponetid === componentid;
      });
      const newComponentList = componentList.filter(item => {
        return item.dscomponetid !== componentid;
      });
      let initPositions = JSON.parse(localStorage.getItem('dragPositions'));
      if (initPositions instanceof Array) {
        initPositions = [
          {
            attr: componentid,
            x: 0
          },
          ...initPositions
        ];
      } else {
        initPositions = [{
          attr: componentid,
          x: 0
        }];
      }
console.log(initPositions)
      localStorage.setItem('dragPositions', JSON.stringify(initPositions));
      yield put({ type: 'putState', payload: { componentList: newComponentList, leftComponent: [...leftComponent, ...newComponent] } });
    },
    *saveDeskTops({ payload }, { put, call, select }) {
      const { leftComponent } = yield select(state => state.desk);
      const params = {
        "desktopid":"32a5dcf3-ce37-46d8-a6f0-6f641cd3c1d9",
        "desktopname":"111",
        "desktoptype": 1,
        "leftitems": leftComponent,
        "rightitems":null,
        "basedeskid":"00000000-0000-0000-0000-000000000000",
        "description":"111",
        "status":1,
        "rolesname":"",
        "rolesid":""
      };
      try {
        yield call(savedesktop, params);
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
        leftComponent: [],
        rightComponent: [],
        componentList: []
      };
    }
  }
};
