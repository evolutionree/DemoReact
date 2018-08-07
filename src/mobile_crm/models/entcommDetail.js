import { message } from 'antd';
import { getEntcommDetail, getGeneralProtocol, savecachemsg } from '../services/app';

export default {
  namespace: 'entcommdetail',
  state: {
    entityId: '',
    recordId: '',
    recordDetail: {},
    detailProtocol: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        console.log(match)
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          // dispatch({ type: 'putState', payload: { entityId, recordId } });
          dispatch({ type: 'init', payload: { entityId, recordId } });
        } else {
          dispatch({ type: 'resetState' });
          if(dd) {
            dd.biz.navigation.setRight({
              show: false,//控制按钮显示， true 显示， false 隐藏， 默认true
              control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
              text: '发送',//控制显示文本，空字符串表示显示默认文本
              onSuccess : function(result) {},
              onFail : function(err) {}
            });
          }
        }
      });
    }
  },
  effects: {
    *init({ payload: { entityId, recordId } }, { select, call, put, take }) {
      yield put({ type: 'fetchdetailData', payload: { entityId, recordId } });
      yield put({ type: 'fetchcachemsg', payload: { entityId, recordId } });
      yield put({ type: 'putState', payload: { entityId, recordId } });
    },
    *fetchdetailData({ payload: { entityId, recordId } }, { select, call, put, take }) {
      const params = {
        entityId: entityId,
        recId: recordId,
        needPower: 0 // TODO 跑权限
      };
      const { data: { detail: recordDetail } } = yield call(getEntcommDetail, params);
      yield put({
        type: 'putState',
        payload: { recordDetail }
      });
      yield put({ type: 'fetchDetailProtocol' }); //必须拿到详情后再 请求 协议
    },
    *fetchDetailProtocol(action, { select, put, call }) {
      const { recordDetail: { rectype } } = yield select(state => state.entcommdetail);
      try {
        const { data: detailProtocol } = yield call(getGeneralProtocol, {
          typeid: rectype,
          operatetype: 2
        });
        yield put({ type: 'putState', payload: { detailProtocol } });
      } catch (e) {
        message.error(e.message || '获取协议失败');
      }
    },
    *fetchcachemsg({ payload: { entityId, recordId } }, { select, put, call }) {
      const { data } = yield call(savecachemsg, {
        entityId: entityId,
        recid: recordId
      });
      yield put({ type: 'putState', payload: { launchAppUUid: data } });
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    resetState() {
      return {
        entityId: '',
        recordId: '',
        recordDetail: {},
        detailProtocol: []
      };
    }
  }
};
