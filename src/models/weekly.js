/**
 * Created by 0291 on 2017/9/22.
 */
import { message } from 'antd';

import _ from 'lodash';
import { getListData, getGeneralListProtocol, getEntcommDetail, getGeneralProtocol } from '../services/entcomm';
import { getListDetailData, addcomments, selectdynamicabstract, getTableListData } from '../services/weekly';
import { queryYearWeekData } from '../services/basicdata';
import { GetArgsFromHref, getDateStr } from '../utils/index.js';

export default {
  namespace: 'weekly',
  state: {
    myWeeklistData: [], //我的周报List
    myWeekTotalPage: 0,
    myWeekCurrentPage: 1,
    receiveWeeklistData: [], //收到的周报List
    receiveWeekTotalPage: 0,
    receiveWeekCurrentPage: 1,
    allWeeklyList: [], //所有周报的List
    tableProtocol: [], //全部周报中Table的协议
    tableTotal: 0,
    tableCurrentPage: 1,
    tablePageSize: 10,
    showModals: '', //显示哪个Modal
    myWeeklyOrSummaryRecid: '', //点击编辑时，当前周计划/周总结的recid
    receiveWeeklyDetailList: null, //收到的周报详情列表
    current_ReceiveWeekly_Detail_WeekLable: '', //收到的周报详情对应的周数
    receiveWeeklyDetailListProtocal: [], //收到的周报详情对应显示的字段定义
    route: '',
    allWeeklySearchData: {
      fromdate: getDateStr(7),
      todate: getDateStr(0)
    },
    allWeeklyDetailList: null,
    current_AllWeekly_Detail_WeekLable: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/weekly\/([^/]+)$/;
        const match = location.pathname.match(pathReg);

        const pathReg2 = /^\/weekly\/receiveweekly\/([^/]+)/;
        const match2 = location.pathname.match(pathReg2);

        const pathReg3 = /^\/allweekly\/detail\/([^/]+)/;
        const match3 = location.pathname.match(pathReg3);
        if (match) {
          dispatch({ type: 'init', payload: match && match[1] });
          dispatch({ type: 'putState', payload: { route: '' } });
        } else if (match2) { //收到的周报详情页
          dispatch({ type: 'queryReceiveWeeklyDetail', payload: match2 && match2[1] });
          dispatch({ type: 'queryReceiveWeeklyDetailProtocol' });
          dispatch({ type: 'putState', payload: { route: `/weekly/receiveweekly/${match2 && match2[1]}?weeklabel=${GetArgsFromHref('weeklabel')}`, current_ReceiveWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
        } else if (match3) { //所有周报 列表 第一项链接的页面
          dispatch({ type: 'queryAllWeeklyDetail', payload: match3 && match3[1] });
          dispatch({ type: 'queryAllWeeklyDetailProtocol' });
          dispatch({ type: 'putState', payload: { current_AllWeekly_Detail_WeekLable: decodeURI(GetArgsFromHref('weeklabel')) } });
        }
      });
    }
  },
  effects: {
    *init({ payload: routeType }, { select, put, call }) {
      let { allWeeklySearchData } = yield select(state => state.weekly);
      const menuIdObj = {
        myweekly: '94baca95-e125-4ff1-a59c-ef6ba0180158',
        receiveweekly: '8731fee2-2d9f-4c01-8e5f-803c853380a9',
        allweekly: '0ad557e0-c709-447e-bf85-89455ec9ae1b'
      };


      const initParams = {
        "viewType":0,
        "searchOrder": "",
        "entityId": "0b81d536-3817-4cbc-b882-bc3e935db845",
        "pageIndex": 1,
        "pageSize": 10,
        "menuId": menuIdObj[routeType],
        "isAdvanceQuery": 0
      };

      const allWeeklyInitParams = {
        "viewType": 0,
        "searchOrder": "",
        "entityId": "0b81d536-3817-4cbc-b882-bc3e935db845",
        "pageIndex": 1,
        "pageSize": 10,
        "menuId": "0ad557e0-c709-447e-bf85-89455ec9ae1b",
        "isAdvanceQuery": 1,
        "searchData": {
          "fromdate": allWeeklySearchData.fromdate,
          "todate": allWeeklySearchData.todate,
          "dept": allWeeklySearchData.dept,
          reccreator: allWeeklySearchData.reccreator
        },
        "ExtraData": {

        }
      };

      yield put({ type: 'queryList', payload: { routeType, params: routeType === 'allweekly' ? allWeeklyInitParams : initParams } });
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
        if (routeType === 'myweekly') {
          const { pagecount, pagedata } = yield call(getListDetailData, params);
          let { yearWeekData, myWeeklistData } = yield select(state => state.weekly);
          if (params.pageIndex === 1) {
            myWeeklistData = [];
          }

          for (let i = 0; i < pagedata.length; i++) {
            for (let j = 0; j < yearWeekData.length; j++) {
              if (pagedata[i].reportdate.indexOf(yearWeekData[j].value) > -1 || pagedata[i].reportdate.indexOf(yearWeekData[j].weekEnd.split(' ')[0]) > -1) {
                pagedata[i].weekNum = yearWeekData[j].weekNum;
                pagedata[i].weekLabel = yearWeekData[j].label;
                break;
              }
            }
          }

          yield put({
            type: 'putState',
            payload: { myWeeklistData: [...myWeeklistData, ...pagedata], myWeekTotalPage: pagecount[0].page, myWeekCurrentPage: params.pageIndex }
          });
        } else if (routeType === 'receiveweekly') {
          const data = yield call(getListData, params);
          const listData = data.data.pagedata;
          let { yearWeekData, receiveWeeklistData } = yield select(state => state.weekly);
          if (params.pageIndex === 1) {
            receiveWeeklistData = [];
          }
          for (let i = 0; i < listData.length; i++) {
            for (let j = 0; j < yearWeekData.length; j++) {
              if (listData[i].reportdate.indexOf(yearWeekData[j].value) > -1 || listData[i].reportdate.indexOf(yearWeekData[j].weekEnd.split(' ')[0]) > -1) {
                listData[i].weekNum = yearWeekData[j].weekNum;
                listData[i].weekLabel = yearWeekData[j].label;
                break;
              }
            }
          }
          yield put({
            type: 'putState',
            payload: { receiveWeeklistData: [...receiveWeeklistData, ...listData], receiveWeekTotalPage: data.data.pagecount[0].page, receiveWeekCurrentPage: params.pageIndex }
          });
        } else if (routeType === 'allweekly') {
          // 获取协议
          const { data: protocol } = yield call(getGeneralListProtocol, { typeId: '0b81d536-3817-4cbc-b882-bc3e935db845' });
          yield put({ type: 'putState', payload: { tableProtocol: protocol } });

          const listData = yield call(getTableListData, params);
          yield put({
            type: 'putState',
            payload: { allWeeklyList: listData.data.pagedata, tableTotal: listData.data.pagecount[0].total, tableCurrentPage: params.pageIndex, tablePageSize: params.pageSize } });
        }
      } catch (e) {
        console.error(e.message);
        message.error(e.message || '获取列表数据失败');
      }
    },

    *loadMore({ payload: { routeType, pageCount } }, { put, call }) {
      const menuIdObj = {
        myweekly: '94baca95-e125-4ff1-a59c-ef6ba0180158',
        receiveweekly: '8731fee2-2d9f-4c01-8e5f-803c853380a9',
        allweekly: '0ad557e0-c709-447e-bf85-89455ec9ae1b'
      };

      const params = {
        "viewType":0,
        "searchOrder": "",
        "entityId": "0b81d536-3817-4cbc-b882-bc3e935db845",
        "pageIndex": pageCount,
        "pageSize": 10,
        "menuId": menuIdObj[routeType],
        "isAdvanceQuery": 0
      };

      yield put({ type: 'queryList', payload: { routeType, params: params } });
    },


    *updataTable({ payload }, { select, put, call }) {
      let { tableCurrentPage, tablePageSize, allWeeklySearchData } = yield select(state => state.weekly);
      const params = {
        "viewType": 0,
        "searchOrder": "",
        "entityId": "0b81d536-3817-4cbc-b882-bc3e935db845",
        "pageIndex": tableCurrentPage,
        "pageSize": tablePageSize,
        "menuId": "0ad557e0-c709-447e-bf85-89455ec9ae1b",
        "isAdvanceQuery": 1,
        "searchData": {
          "fromdate": allWeeklySearchData.fromdate,
          "todate": allWeeklySearchData.todate,
          "dept": allWeeklySearchData.dept,
          reccreator: allWeeklySearchData.reccreator
        },
        "ExtraData": {

        }
      };

      yield put({ type: 'queryList', payload: { routeType: 'allweekly', params: params } });
    },

    *comment({ payload: { id, content, pcommentsid } }, { put, call }) {
      try {
        const params = {
          dynamicid: id,
          pcommentsid: pcommentsid,
          comments: content
        };
        yield call(addcomments, params);
        yield put({ type: 'updateActivity', payload: id });
        // message.success('评论成功');
      } catch (e) {
        message.error(e.message || '评论失败');
      }
    },

    *queryReceiveWeeklyDetailProtocol(action, { put, call }) {
      const { data: receiveWeeklyDetailWeeklyProtocal } = yield call(getGeneralProtocol, {
        typeid: '0b81d536-3817-4cbc-b882-bc3e935db845',
        operatetype: 2
      });
      const { data: receiveWeeklyDetailSummaryProtocal } = yield call(getGeneralProtocol, {
        typeid: 'fcc648ae-8817-48b7-b1d7-49ed4c24316b',
        operatetype: 2
      });
      yield put({ type: 'putState', payload: { receiveWeeklyDetailWeeklyProtocal, receiveWeeklyDetailSummaryProtocal } });
    },

    *queryReceiveWeeklyDetail({ payload: recid }, { put, call }) {
      try {
        const params = {
          EntityId: '0b81d536-3817-4cbc-b882-bc3e935db845',
          RecId: recid,
          NeedPower: 0
        };
        const { data } = yield call(getEntcommDetail, params);
        yield put({ type: 'putState', payload: { receiveWeeklyDetailList: data } });
      } catch (e) {
        message.error(e.message);
      }
    },

    *queryAllWeeklyDetail({ payload: recid }, { put, call }) {
      try {
        const params = {
          EntityId: '0b81d536-3817-4cbc-b882-bc3e935db845',
          RecId: recid,
          NeedPower: 0
        };
        const { data } = yield call(getEntcommDetail, params);
        yield put({ type: 'putState', payload: { allWeeklyDetailList: data } });
      } catch (e) {
        message.error(e.message);
      }
    },

    *queryAllWeeklyDetailProtocol(action, { put, call }) {
      const { data: allWeeklyDetailWeeklyProtocal } = yield call(getGeneralProtocol, {
        typeid: '0b81d536-3817-4cbc-b882-bc3e935db845',
        operatetype: 2
      });
      const { data: allWeeklyDetailSummaryProtocal } = yield call(getGeneralProtocol, {
        typeid: 'fcc648ae-8817-48b7-b1d7-49ed4c24316b',
        operatetype: 2
      });
      yield put({ type: 'putState', payload: { allWeeklyDetailWeeklyProtocal, allWeeklyDetailSummaryProtocal } });
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
    }
  }
};
