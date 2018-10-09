/**
 * Created by 0291 on 2017/10/31.
 */
import { message } from 'antd';
import { getListData, getGeneralListProtocol, getEntcommDetail, getGeneralProtocol } from '../services/entcomm';
import { getListDetailData, addcomments, selectdynamicabstract } from '../services/weekly';
import { queryYearWeekData } from '../services/basicdata';
import { getDateStr, getTimeStamp } from '../utils/index.js';

const daily_entityId = '601cb738-a829-4a7b-a3d9-f8914a5d90f2';

export default {
  namespace: 'daily',
  state: {
    myDailylistData: [], //我的日报List
    myDailyTotalPage: 0,
    myDailyCurrentPage: 1,
    receiveDailylistData: [], //收到的日报List
    receiveDailyTotalPage: 0,
    receiveDailyCurrentPage: 1,
    allDailyList: [], //所有日报的List
    tableProtocol: [], //全部日报中Table的协议
    tableTotal: 0,
    tableCurrentPage: 1,
    tablePageSize: 10,
    showModals: '', //显示哪个Modal
    myDailyOrSummaryRecid: '', //点击编辑时，当前周计划/周总结的recid
    receiveDailyDetailList: null, //收到的日报详情列表
    route: '',
    allDailySearchData: {},
    allDailyDetailList: null,
    allDailyDetailListProtocal: [] //日报详情对应显示的字段定义
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/daily\/([^/]+)$/;
        const match = location.pathname.match(pathReg);

        const pathReg2 = /^\/daily\/receivedaily\/([^/]+)/;
        const match2 = location.pathname.match(pathReg2);

        const pathReg3 = /^\/alldaily\/detail\/([^/]+)/;
        const match3 = location.pathname.match(pathReg3);
        dispatch({ type: 'queryAllDailyDetailProtocol' });
        if (match) {
          dispatch({ type: 'init', payload: match && match[1] });
          dispatch({ type: 'putState', payload: { route: '' } });
        } else if (match2) { //收到的日报详情页
          dispatch({ type: 'queryReceiveDailyDetail', payload: match2 && match2[1] });
          dispatch({ type: 'putState', payload: { route: `/daily/receivedaily/${match2 && match2[1]}` } });
        } else if (match3) { //所有日报 列表 第一项链接的页面
          dispatch({ type: 'queryAllDailyDetail', payload: match3 && match3[1] });
        }
      });
    }
  },
  effects: {
    *init({ payload: routeType }, { select, put, call }) {
      let { allDailySearchData } = yield select(state => state.daily);
      const menuIdObj = {
        mydaily: '7512cba4-8103-41d7-b180-a83326eb1e23',
        receivedaily: 'dc059a58-14c3-4c83-aa72-3189dafcbacd',
        alldaily: '80294074-44e0-40d0-ad7b-7e41c5969bd9'
      };


      const initParams = {
        "viewType":0,
        "searchOrder": "",
        "entityId": daily_entityId,
        "pageIndex": 1,
        "pageSize": 10,
        "menuId": menuIdObj[routeType],
        "isAdvanceQuery": 0
      };

      const allWeeklyInitParams = {
        "viewType": 0,
        "searchOrder": "",
        "entityId": daily_entityId,
        "pageIndex": 1,
        "pageSize": 10,
        "menuId": "80294074-44e0-40d0-ad7b-7e41c5969bd9",
        "isAdvanceQuery": 1,
        "searchData": allDailySearchData
      };

      yield put({ type: 'queryList', payload: { routeType, params: routeType === 'alldaily' ? allWeeklyInitParams : initParams } });
      try {
        const yearWeekData = yield call(queryYearWeekData);
        yield put({
          type: 'putState',
          payload: { yearWeekData: yearWeekData }
        });
      } catch (e) {
        message.error(e.message);
      }
    },
    *queryList({ payload: { routeType, params } }, { select, put, call }) {
      try {
        if (routeType === 'mydaily') {
          const { pagecount, pagedata } = yield call(getListDetailData, params, daily_entityId);
          let { yearWeekData, myDailylistData } = yield select(state => state.daily);
          if (params.pageIndex === 1) {
            myDailylistData = [];
          }

          for (let i = 0; i < pagedata.length; i++) {
            for (let j = 0; j < yearWeekData.length; j++) {
              if (getTimeStamp(pagedata[i].reportdate) <= getTimeStamp(yearWeekData[j].weekEnd)) {
                pagedata[i].weekNum = yearWeekData[j].weekNum;
                pagedata[i].weekLabel = yearWeekData[j].label;
                break;
              }
            }
          }

          yield put({
            type: 'putState',
            payload: { myDailylistData: [...myDailylistData, ...pagedata], myDailyTotalPage: pagecount[0].page, myDailyCurrentPage: params.pageIndex }
          });
        } else if (routeType === 'receivedaily') {
          const data = yield call(getListData, params);
          const listData = data.data.pagedata;
          let { receiveDailylistData } = yield select(state => state.daily);
          if (params.pageIndex === 1) {
            receiveDailylistData = [];
          }
          yield put({
            type: 'putState',
            payload: { receiveDailylistData: [...receiveDailylistData, ...listData], receiveDailyTotalPage: data.data.pagecount[0].page, receiveDailyCurrentPage: params.pageIndex }
          });
        } else if (routeType === 'alldaily') {
          // 获取协议
          const { data: protocol } = yield call(getGeneralListProtocol, { typeId: daily_entityId });
          yield put({ type: 'putState', payload: { tableProtocol: protocol } });

          const listData = yield call(getListData, params);
          yield put({
            type: 'putState',
            payload: { allDailyList: listData.data.pagedata, tableTotal: listData.data.pagecount[0].total, tableCurrentPage: params.pageIndex, tablePageSize: params.pageSize } });
        }
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '获取列表数据失败');
      }
    },

    *loadMore({ payload: { routeType, pageCount } }, { put, call }) {
      const menuIdObj = {
        mydaily: '7512cba4-8103-41d7-b180-a83326eb1e23',
        receivedaily: 'dc059a58-14c3-4c83-aa72-3189dafcbacd'
      };

      const params = {
        "viewType":0,
        "searchOrder": "",
        "entityId": daily_entityId,
        "pageIndex": pageCount,
        "pageSize": 10,
        "menuId": menuIdObj[routeType],
        "isAdvanceQuery": 0
      };

      yield put({ type: 'queryList', payload: { routeType, params: params } });
    },


    *updataTable({ payload }, { select, put, call }) {
      let { tableCurrentPage, tablePageSize, allDailySearchData } = yield select(state => state.daily);
      const params = {
        viewType: 0,
        searchOrder: '',
        entityId: daily_entityId,
        pageIndex: tableCurrentPage,
        pageSize: tablePageSize,
        menuId: '80294074-44e0-40d0-ad7b-7e41c5969bd9',
        isAdvanceQuery: 1,
        searchData: allDailySearchData
      };

      yield put({ type: 'queryList', payload: { routeType: 'alldaily', params: params } });
    },

    *comment({ payload: { id, content, pcommentsid } }, { put, call }) {
      try {
        const params = {
          dynamicid: id,
          pcommentsid: pcommentsid,
          comments: content
        };
        yield call(addcomments, params);
        // message.success('评论成功');
      } catch (e) {
        message.error(e.message || '评论失败');
      }
    },

    *queryReceiveDailyDetail({ payload: recid }, { put, call }) {
      try {
        const params = {
          EntityId: daily_entityId,
          RecId: recid,
          NeedPower: 0
        };
        const { data } = yield call(getEntcommDetail, params);
        yield put({ type: 'putState', payload: { receiveDailyDetailList: data } });
      } catch (e) {
        message.error(e.message);
      }
    },

    *queryAllDailyDetail({ payload: recid }, { put, call }) {
      try {
        const params = {
          EntityId: daily_entityId,
          RecId: recid,
          NeedPower: 0
        };
        const { data } = yield call(getEntcommDetail, params);
        yield put({ type: 'putState', payload: { allDailyDetailList: data } });
      } catch (e) {
        message.error(e.message);
      }
    },

    *queryAllDailyDetailProtocol(action, { put, call }) {
      const { data: allDailyDetailListProtocal } = yield call(getGeneralProtocol, {
        typeid: daily_entityId,
        operatetype: 2
      });
      yield put({ type: 'putState', payload: { allDailyDetailListProtocal } });
    }
  },
  reducers: {
    putState(state, { payload: payload }) {
      return {
        ...state,
        ...payload
      };
    },
    showModals(state, { payload: payload }) {
      return {
        ...state,
        showModals: payload
      };
    },
    changeAllDailySearchData(state, { payload: formData }) {
      return {
        ...state,
        allDailySearchData: {
          ...state.allDailySearchData,
          ...formData
        }
      };
    }
  }
};
