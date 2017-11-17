import { message } from 'antd';
import { routerRedux } from 'dva/router';
import * as _ from 'lodash';
import {
  queryMailCatalog,
  queryDeptMailCatalog,
  queryMailList,
  queryMailContacts,
  queryMailBoxList,
  queryCustomerContact,
  saveMailCatalog,
  updateMailCatalog,
  delMailCatalog,
  delMails,
  moveMails,
  markMails,
  orderMailCatalog,
  queryMailDetail
} from '../services/mails';
import { treeForEach } from '../utils';

function getDefaultCatalog(catalogData) {
  return catalogData[0].recid;
}

/* eslint-disable */
const MailMock = {
  "mailid": "eeddbba7-4cae-4cce-a042-89b34060f8c1",
  "sender": {
    "mailaddress": "zhongguanhui@renqiankeji.com",
    "displayname": "钟冠辉"
  },
  "receivers": [
    {
      "mailaddress": "zhongguanhui@renqiankeji.com",
      "displayname": "钟冠辉"
    }
  ],
  "ccers": [
    {
      "mailaddress": "zhongguanhui@renqiankeji.com",
      "displayname": "钟冠辉"
    }
  ],
  "bccers": [
    {
      "mailaddress": "zhongguanhui@renqiankeji.com",
      "displayname": "钟冠辉"
    }
  ],
  "title": "测试邮件001",
  "summary": "邮件概要001",
  "content": "邮件概要001",
  "receivetime": "2017-11-0112: 31: 11",
  "sendtime": "2017-11-0110: 31: 11",
  "istag": 1,
  "isread": 0,
  "attachcount": 0,
  "attachments": [
    { fileid: 'xxx', filename: '十九大精神概要.pdf', filesize: 999 }
  ]
};
/* eslint-enable */

function getCatalogNode(treeData, catalogId) {
  let catalogNode;
  treeForEach(treeData, node => {
    if (node.recid === catalogId) catalogNode = node;
  }, 'subcatalogs');
  return catalogNode;
}

export default {
  namespace: 'mails',
  state: {
    hasInitialized: false,
    queries: {},
    openedCatalog: 'my', // my/dept
    selectedCatalogNode: null,
    catSearchKey: '',
    myCatalogData: [],
    deptCatalogData: [],
    mailList: [],
    mailTotal: 0,
    mailSelected: [],
    mailDetailData: null,
    showingModals: '',
    mailContacts: [],
    mailBoxList: [],
    customerContact: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mails') {
          dispatch({ type: 'queryMailList' });
          dispatch({ type: 'init' });
          dispatch({ type: 'putState', payload: { hasInitialized: true } });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
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
    *init(action, { select, call, put }) {
      const { hasInitialized } = yield select(state => state.mails);
      if (hasInitialized) return;
      yield put({ type: 'fetchMailContacts' });
      yield put({ type: 'fetchMailboxlist' });
      yield put({ type: 'fetchCustomerContact' });
    },
    *fetchMailContacts(action, { call, put }) {
      try {
        const { data: mailContacts } = yield call(queryMailContacts);
        yield put({
          type: 'putState',
          payload: { mailContacts }
        });
      } catch (e) {
        message.error(e.message || '获取邮件联系人数据失败');
      }
    },
    *fetchMailboxlist(action, { call, put }) {
      try {
        const { data: mailBoxList } = yield call(queryMailBoxList);
        yield put({
          type: 'putState',
          payload: { mailBoxList }
        });
      } catch (e) {
        message.error(e.message || '获取我的邮箱列表数据失败');
      }
    },
    *fetchCustomerContact(action, { call, put }) {
      try {
        const { data: { datalist: customerContact } } = yield call(queryCustomerContact);
        yield put({
          type: 'putState',
          payload: { customerContact }
        });
      } catch (e) {
        message.error(e.message || '获取客户联系人数据失败');
      }
    },
    *queryCatalogTree(action, { select, call, put }) {
      try {
        const { user } = yield select(state => state.app);
        const { openedCatalog, selectedCatalogNode, queries, catSearchKey } = yield select(state => state.mails);
        if (openedCatalog === 'my') {
          const params = {
            catalogname: catSearchKey || ''
          };
          const { data } = yield call(queryMailCatalog, params);
          yield put({ type: 'putState', payload: { myCatalogData: data } });
          if (!selectedCatalogNode) {
            yield put({
              type: 'putState',
              payload: { selectedCatalogNode: getCatalogNode(data, queries.catalog) }
            });
          }
        } else if (openedCatalog === 'dept') {
          const { data } = yield call(queryDeptMailCatalog, { treeid: '' });
          yield put({ type: 'putState', payload: { deptCatalogData: data } });
        }
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *queryMailList(action, { select, call, put }) {
      const location = yield select(state => state.routing.locationBeforeTransitions);
      const { query } = location;
      const queries = {
        pageIndex: 1,
        pageSize: 10,
        searchKey: '',
        // catalog: getDefaultCatalog(openTabs[0] === '0' ? myCatalogData : deptCatalogData),
        catalog: 'f91fe27e-77ac-45de-aeb6-d3ea5a050a01',
        catalogType: 'my',
        ...query
      };
      queries.pageIndex = parseInt(queries.pageIndex, 10);
      queries.pageSize = parseInt(queries.pageSize, 10);
      yield put({ type: 'putState', payload: { queries } });

      const { hasInitialized } = yield select(state => state.mails);
      if (!hasInitialized) {
        yield put({
          type: 'putState',
          payload: {
            openedCatalog: queries.catalogType
          }
        });
        yield put({ type: 'queryCatalogTree' });
      }

      try {
        const params = { ...queries };
        const { data } = yield call(queryMailList, params);
        yield put({
          type: 'putState',
          payload: {
            mailList: data.datalist,
            mailTotal: data.pageinfo.totalcount,
            mailSelected: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取邮件列表失败');
      }
    },
    *toggleOpenedCatalog({ payload: openedCatalog }, { select, put }) {
      yield put({ type: 'putState', payload: { openedCatalog, catSearchKey: '' } });
      const { myCatalogData, deptCatalogData } = yield select(state => state.mails);
      if ((openedCatalog === 'my' && !myCatalogData.length) || (openedCatalog === 'dept' && !deptCatalogData.length)) {
        yield put({ type: 'queryCatalogTree' });
      }
    },
    *selectCatalog({ payload: catalogNode }, { select, put }) {
      if (!catalogNode.recid) return;
      const { openedCatalog } = yield select(state => state.mails);
      yield put({ type: 'search', payload: { catalog: catalogNode.recid, catalogType: openedCatalog } });
      yield put({ type: 'putState', payload: { selectedCatalogNode: catalogNode } });
    },
    *saveCatalog({ payload: data }, { call, put }) {
      try {
        const isEdit = !!data.recid;
        const fn = isEdit ? updateMailCatalog : saveMailCatalog;
        const params = isEdit ? _.pick(data, ['recid', 'recname']) : _.pick(data, ['pid', 'recname']);
        yield put({ type: 'modalPending', payload: true });
        yield call(fn, params);
        message.success('保存成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'queryCatalogTree' });
      } catch (e) {
        message.error(e.message || '保存失败');
      }
    },
    *delCatalog({ payload: catalogId }, { select, call, put }) {
      try {
        const { selectedCatalogNode } = yield select(state => state.mails);
        yield call(delMailCatalog, selectedCatalogNode.recid);
        message.success('删除成功');
        yield put({ type: 'queryCatalogTree' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *orderCatalog({ payload: { catalog, type } }, { select, call, put }) {
      try {
        const { selectedCatalogNode } = yield select(state => state.mails);
        const params = { recid: selectedCatalogNode.recid, dotype: type === 'up' ? 1 : 0 };
        yield call(orderMailCatalog, params);
        message.success('操作成功');
        yield put({ type: 'queryCatalogTree' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *delMail({ payload: { mails, completely } }, { select, call, put }) {
      try {
        const params = {
          IsTruncate: completely,
          mailids: mails.map(item => item.mailid).join(','),
          recstatus: 0
        };
        yield call(delMails, params);
        message.success('删除成功');
        yield put({ type: 'queryMailList' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *moveMails({ payload: { mails, catalogId } }, { select, call, put }) {
      try {
        const params = {
          mailids: mails.map(item => item.mailid).join(','),
          catalogId
        };
        yield call(moveMails, params);
        message.success('移动成功');
        yield put({ type: 'queryMailList' });
      } catch (e) {
        message.error(e.message || '移动失败');
      }
    },
    *markMails({ payload: { mails, mark } }, { select, call, put }) {
      try {
        const params = {
          mailids: mails.map(item => item.mailid).join(','),
          mark
        };
        yield call(markMails, params);
        message.success('标记成功');
        yield put({ type: 'queryMailList' });
      } catch (e) {
        message.error(e.message || '标记失败');
      }
    },
    *mailPreview__({ payload: mail }, { select, call, put }) {
      const { mailDetailData } = yield select(state => state.mails);
      if (mailDetailData && mailDetailData.mailId === mail.mailid
        && (mailDetailData.status === 'loading' || mailDetailData.status === 'loaded')) return;

      yield put({
        type: 'putState',
        payload: {
          mailDetailData: {
            status: 'loading',
            mailId: mail.mailid,
            mailInfo: mail
          }
        }
      });
      try {
        const { data } = yield call(queryMailDetail, mail.mailid);
        const { mailDetailData: { mailId } } = yield select(state => state.mails);
        if (mailId !== mail.mailid) return;
        yield put({
          type: 'putState',
          payload: {
            mailDetailData: {
              status: 'loaded',
              mailId: mail.mailid,
              mailInfo: mail,
              ...data
            }
          }
        });
      } catch (e) {
        const { mailDetailData: { mailId } } = yield select(state => state.mails);
        if (mailId !== mail.mailid) return;
        yield put({
          type: 'putState',
          payload: {
            mailDetailData: {
              status: 'error',
              mailId: mail.mailid,
              mailInfo: mail,
              error: e.message
            }
          }
        });
      }
    },
    *showMailDetail({ payload: mail }, { select, call, put }) {
      yield put({
        type: 'putState',
        payload: {
          showingModals: 'mailDetail'
        }
      });
    }
  },
  reducers: {
    putState(state, { payload }) {
      return { ...state, ...payload };
    },
    modalPending(state, { payload }) {
      return {
        ...state,
        modalPending: !!payload
      };
    },
    showModals(state, { payload }) {
      return {
        ...state,
        showingModals: payload,
        modalPending: false
      };
    },
    resetState() {
      return {
        hasInitialized: false,
        queries: {},
        openedCatalog: 'my', // my/dept
        selectedCatalogNode: null,
        myCatalogData: [],
        deptCatalogData: [],
        mailList: [],
        mailTotal: 0,
        mailSelected: [],
        previewData: MailMock,
        showingModals: '',
        mailContacts: [],
        mailBoxList: [],
        customerContact: []
      };
    }
  }
};
