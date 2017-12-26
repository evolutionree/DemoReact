import { message, Modal } from 'antd';
import _ from 'lodash';
import { query,queryTypes } from '../services/entity';
import { getEntcommDetail, getEntcommAtivities, commentEntcommActivity, getActivityDetail, likeEntcommActivity, queryPlugins,dynamicRequest, extraToolbarClickSendData } from '../services/entcomm';


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
  namespace: 'entcommActivities',
  state: {
    entityId: '',
    recordId: '',
    list: [],
    entityTypes: [],
    pageIndex: 0,
    pageSize: 10,
    noMoreData: false,
    plugins: null,
    currPlugin: null,
    showModals: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/activities/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          dispatch({ type: 'putState', payload: { pageIndex: 0} });
          dispatch({ type: 'init', payload: { entityId, recordId } });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init({ payload: { entityId, recordId } }, { select, put, call }) {
      const {
        entityId: lastEntityId,
        recordId: lastRecordId,
        dynamicEntities
      } = yield select(state => state.entcommActivities);

      if (entityId !== lastEntityId || recordId !== lastRecordId) {
        yield put({ type: 'resetState' });
      }

      yield put({ type: 'putState', payload: { entityId, recordId } });

      yield put({ type: 'fetchPlugins' });
      yield put({ type: 'loadMore__' ,payload: { isReload:true } });
    },
    *fetchPlugins(action, { select, put, call }) {
      const { entityId, recordId } = yield select(state => state.entcommActivities);
      try {
        const result = yield call(queryPlugins, {
          entityid: entityId,
          recid: recordId
        });
        yield put({ type: 'putState', payload: { plugins: result } });
        // 获取实体类型
        const { data: { entitytypepros: entityTypes } } = yield call(queryTypes, { entityId });
        yield put({ type: 'entityTypes', payload: entityTypes });

      } catch (e) {
        message.error(e.message || '获取动态实体失败');
      }
    },
    *loadMore__({ payload: isReload }, { select, put, call }) {
      const {
        entityId,
        recordId,
        pageIndex,
        pageSize
      } = yield select(state => state.entcommActivities);
      const queryPage = isReload ? 1 : pageIndex + 1;
      try {
        const params = {
          businessid: recordId,
          dynamictypes: [0, 1, 2],
          entityid: entityId,
          pageindex: queryPage,
          pagesize: pageSize
        };
        const { data: { datalist: list, pageinfo: { totalcount: total } } } = yield call(getEntcommAtivities, params);
        yield put({ type: 'loadMoreSuccess', payload: { list, queryPage, total } });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *comment({ payload: { id, content } }, { put, call }) {
      try {
        const params = {
          dynamicid: id,
          comments: content
        };
        yield call(commentEntcommActivity, params);
        yield put({ type: 'updateActivity', payload: id });
        // message.success('评论成功');
      } catch (e) {
        message.error(e.message || '评论失败');
      }
    },
    *updateActivity({ payload: id }, { select, put, call }) {
      try {
        const { data } = yield call(getActivityDetail, id);
        yield put({
          type: 'updateActivitySuccess',
          payload: { id, data }
        });
      } catch (e) {
        message.error(e.message || '更新数据失败');
      }
    },
    *like({ payload: id }, { put, call }) {
      try {
        yield call(likeEntcommActivity, id);
        yield put({ type: 'updateActivity', payload: id });
      } catch (e) {
        message.error(e.message || '点赞失败');
      }
    },
    *pluginAdd({ payload: pluginIndex }, { select, put, call,cps }) {
      const { plugins,recordId,entityId} = yield select(state => state.entcommActivities);
      const currPlugin = plugins[pluginIndex];
      switch (currPlugin.type) {
        case 'normal': // 填写实体表单即可
          break;
        case 'flow': // 填写实体表单 + 选择审批人
          break;
        case 'audit': // 调接口 + 选审批人
          break;
        case 'transform': //单据转化按钮
          break;
        case 'copybutton': //复制按钮
          break;
        case 'CallService'://直接调用服务
          const { entityId, recordId } = yield select(state => state.entcommActivities);
          let params = {};
          params = {
            Recids: [recordId],
            EntityId:entityId,
            ...plugins[pluginIndex].extradata
          };
          yield call(extraToolbarClickSendData, plugins[pluginIndex].routepath, params);
          message.success('提交成功');
          break;
        case 'upatebutton': //更新事件按钮
            const confirmed = yield cps(
              confirmModal,
              '确定将'+plugins[pluginIndex].name
            );
            if (!confirmed) return;
            try {
              const { entityId, recordId } = yield select(state => state.entcommActivities);
              if(plugins[pluginIndex].entity&&plugins[pluginIndex].entity.extradata){
                const { routepath } = plugins[pluginIndex].entity;
                yield call(dynamicRequest,'/'+routepath, {
                  RecId:recordId,
                  Status:plugins[pluginIndex].entity.extradata.status
                });
                message.success('提交成功');
                yield put({ type: 'init', payload: { entityId, recordId } });
                yield put({ type: 'entcommHome/fetchRecordDetail' });
              }
            } catch (e) {
              message.error(e.message || '提交失败');
            }
          break;
        default:
      }
    },
    *pluginAddDone(action, { select, put, call }) {
      yield put({ type: 'pluginAddCancel' });
      const {
        entityId,
        recordId,
        pageSize
      } = yield select(state => state.entcommActivities);
      const pageIndex = 1;
      try {
        const params = {
          businessid: recordId,
          dynamictypes: [0, 1, 2],
          entityId,
          pageIndex,
          pageSize
        };
        const { data: { datalist: list, pageinfo: { totalcount: total } } } = yield call(getEntcommAtivities, params);

        let noMoreData = false;
        if (list.length < pageSize) {
          noMoreData = true;
        }
        yield put({
          type: 'putState',
          payload: {
            noMoreData,
            pageIndex: pageIndex + 1,
            list,
            total
          }
        });
      } catch (e) {
        message.error(e.message || '获取数据失败');
      }
    },
    *showDynamicDetail({ payload: item }, { select, put, call }) {
      yield put({
        type: 'putState',
        payload: {
          showModals: `dynamicDetail?${item.entityid}:${item.businessid}`
        }
      });
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    loadMoreSuccess(state, { payload: { list, queryPage, total } }) {
      let noMoreData = false;
      if (list.length < state.pageSize) {
        noMoreData = true;
      }
      return {
        ...state,
        noMoreData,
        pageIndex: queryPage,
        list: queryPage === 1 ? list : [...state.list, ...list], //queryPage==1 表示是重新从第一页开始请求
        total
      };
    },
    entityTypes(state, { payload: entityTypes }) {
      return {
        ...state,
        entityTypes
      };
    },
    updateActivitySuccess(state, { payload: { id, data } }) {
      const { list } = state;
      const index = _.findIndex(list, ['dynamicid', id]);
      if (index !== -1) {
        const newList = [...list];
        newList[index] = data;
        return { ...state, list: newList };
      } else {
        return state;
      }
    },
    pluginAdd(state, { payload: pluginIndex }) {
      return {
        ...state,
        currPlugin: state.plugins[pluginIndex],
        showModals: 'pluginAdd'
      };
    },
    pluginAddCancel(state) {
      return {
        ...state,
        currPlugin: null,
        showModals: ''
      };
    },
    resetState() {
      return {
        entityId: '',
        recordId: '',
        list: [],
        entityTypes: [],
        pageIndex: 0,
        pageSize: 10,
        noMoreData: false,
        plugins: null,
        currPlugin: null,
        showModals: ''
      };
    }
  }
};
