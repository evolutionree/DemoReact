import { message } from 'antd';
import * as _ from 'lodash';
import {
  syncMails,
  queryMailCatalog,
  queryDeptMailCatalog,
  queryMailList,
  queryRecentcontact,
  queryMailContacts,
  queryMailBoxList,
  queryCustomerContact,
  queryInnerContact,
  querySignature,
  saveMailCatalog,
  updateMailCatalog,
  delMailCatalog,
  delMails,
  moveMails,
  markMails,
  orderMailCatalog,
  queryMailDetail,
  queryHistoryUsers,
  queryHistoryUserMails,
  sendemail,
  distributeMails,
  transferMailCatalog
} from '../services/mails';
import { treeForEach } from '../utils';

function getDefaultCatalog(catalogData) {
  return catalogData[0];
}

export default {
  namespace: 'mails',
  state: {
    /* 邮件目录 */
    openedCatalog: 'my', // my/dept/user
    selectedCatalogNode: null,
    catSearchKey: { my: '', dept: '', user: '' },
    myCatalogDataAll: null,
    myCatalogData: null,
    deptCatalogData: null,
    userCatalogData: [],

    /* 邮件列表 */
    mailPageIndex: 1,
    mailPageSize: 10,
    mailSearchKey: '',
    mailList: [],
    mailTotal: 0,
    mailSelected: [],
    mailCurrent: null,
    mailDetailData: null,

    /* 写邮件 */
    mailContacts: [],
    mailBoxList: [],
    recentContact: [],
    customerContact: [],
    innerContact: [],
    editEmailFormData: null,
    focusTargetName: '',
    showingModals: '',
    modalPending: false,
    editEmailPageFormModel: null,
    editEmailPageBtn: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mails') {
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { put }) {
      yield put({ type: 'syncMails__' });
      yield put({ type: 'queryMyCatalogTree', payload: true });
      yield put({ type: 'fetchMailContacts' });
      yield put({ type: 'fetchMailboxlist' });
      yield put({ type: 'fetchRecentcontact' }); //获取最近联系人
      yield put({ type: 'fetchCustomerContact' });
      yield put({ type: 'fetchInnerContact' }); //获取企业内部通讯录
      yield put({ type: 'fetchSignature' }); //获取签名
    },
    *syncMails__(action, { call }) {
      yield call(syncMails);
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
        const { data: { datalist: mailBoxList } } = yield call(queryMailBoxList);
        yield put({
          type: 'putState',
          payload: { mailBoxList }
        });
      } catch (e) {
        message.error(e.message || '获取我的邮箱列表数据失败');
      }
    },
    *fetchRecentcontact(action, { call, put }) {
      try {
        const { data: { datalist: recentContact } } = yield call(queryRecentcontact);
        yield put({
          type: 'putState',
          payload: { recentContact }
        });
      } catch (e) {
        message.error(e.message || '获取最近联系人数据失败');
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
    *fetchInnerContact(action, { call, put }) {
      try {
        const { data: innerContact } = yield call(queryInnerContact, { treeid: '' });
        yield put({
          type: 'putState',
          payload: { innerContact }
        });
      } catch (e) {
        message.error(e.message || '获取企业内部通讯录失败');
      }
    },
    *fetchSignature(action, { call, put }) {
      try {
        const { data: signature } = yield call(querySignature, { treeid: '' });
        yield put({
          type: 'putState',
          payload: { signature }
        });
      } catch (e) {
        message.error(e.message || '获取企业内部通讯录失败');
      }
    },
    *queryMyCatalogTree({ payload: isInit }, { select, call, put }) {
      try {
        const { catSearchKey } = yield select(state => state.mails);
        const params = {
          catalogname: catSearchKey.my || ''
        };
        const { data } = yield call(queryMailCatalog, params);
        yield put({ type: 'putState', payload: { myCatalogData: data } });
        if (!catSearchKey.my) {
          yield put({ type: 'putState', payload: { myCatalogDataAll: data } });
        }

        // 初始化，默认选中目录
        if (isInit) {
          const selectedCatalogNode = getDefaultCatalog(data);
          selectedCatalogNode.catalogtype = 'my';
          yield put({
            type: 'putState',
            payload: {
              selectedCatalogNode
            }
          });
          yield put({ type: 'queryMailList' });
        }
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *queryDeptCatalogTree(action, { select, call, put }) {
      try {
        const { catSearchKey } = yield select(state => state.mails);
        const { data } = yield call(queryDeptMailCatalog, { treeid: '', keyword: catSearchKey.dept });
        yield put({ type: 'putState', payload: { deptCatalogData: data } });
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *queryUserCatalog(action, { select, call, put }) {
      try {
        const { catSearchKey } = yield select(state => state.mails);
        const { data } = yield call(queryHistoryUsers, catSearchKey.user);
        yield put({ type: 'putState', payload: { userCatalogData: data } });
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *reloadCatalogTree(action, { select, put }) {
      const { openedCatalog } = yield select(state => state.mails);
      yield put({
        type: openedCatalog === 'my'
          ? 'queryMyCatalogTree'
          : openedCatalog === 'dept' ? 'queryDeptCatalogTree' : 'queryUserCatalog'
      });
    },
    *search({ payload: searchObj }, { put }) {
      yield put({
        type: 'putState',
        payload: {
          mailPageIndex: 1,
          ...searchObj
        }
      });
      yield put({ type: 'queryMailList' });
    },
    *searchCatalog({ payload: searchKey }, { select, put }) {
      const { openedCatalog, catSearchKey } = yield select(state => state.mails);
      yield put({
        type: 'putState',
        payload: {
          catSearchKey: { ...catSearchKey, [openedCatalog]: searchKey }
        }
      });
      yield put({ type: 'reloadCatalogTree' });
    },
    *queryMailList(action, { select, call, put }) {
      try {
        const { mailPageIndex, mailPageSize, mailSearchKey, selectedCatalogNode } = yield select(state => state.mails);
        let result;
        if (selectedCatalogNode.recid) {
          // 收件箱邮件
          const params = {
            pageIndex: mailPageIndex,
            pageSize: mailPageSize,
            searchKey: mailSearchKey,
            catalog: selectedCatalogNode.recid,
            fetchuserid: selectedCatalogNode.userid
          };
          result = yield call(queryMailList, params);
        } else {
          // 内部往来人员邮件
          const params = {
            pageIndex: mailPageIndex,
            pageSize: mailPageSize,
            keyword: mailSearchKey,
            fromuserid: selectedCatalogNode.treeid
          };
          result = yield call(queryHistoryUserMails, params);
        }
        yield put({
          type: 'putState',
          payload: {
            mailList: result.data.datalist,
            mailTotal: result.data.pageinfo.totalcount,
            mailSelected: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取邮件列表失败');
      }
    },
    *toggleOpenedCatalog({ payload: openedCatalog }, { select, put }) {
      yield put({
        type: 'putState',
        payload: { openedCatalog }
      });
      const { myCatalogData, deptCatalogData, userCatalogData } = yield select(state => state.mails);
      if ((openedCatalog === 'my' && !myCatalogData)
        || (openedCatalog === 'dept' && !deptCatalogData)
        || (openedCatalog === 'user' && !userCatalogData.length)) {
        yield put({ type: 'reloadCatalogTree' });
      }
    },
    *selectCatalog({ payload: { catalogNode, catalogType } }, { select, put }) {
      if (!catalogNode) return;
      if (catalogType === 'dept' && !catalogNode.recid) return;
      catalogNode.catalogtype = catalogType;
      yield put({
        type: 'putState',
        payload: { selectedCatalogNode: catalogNode }
      });
      yield put({ type: 'queryMailList' });
    },
    *saveCatalog({ payload: data }, { call, put }) {
      const isEdit = !!data.recid;
      try {
        const fn = isEdit ? updateMailCatalog : saveMailCatalog;
        const params = isEdit ? _.pick(data, ['recid', 'recname']) : _.pick(data, ['pid', 'recname']);
        yield put({ type: 'modalPending', payload: true });
        yield call(fn, params);
        message.success(isEdit ? '编辑成功' : '新增成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'reloadCatalogTree' });
      } catch (e) {
        message.error(e.message || (isEdit ? '编辑失败' : '编辑成功'));
      }
    },
    *delCatalog({ payload: catalogId }, { select, call, put }) {
      try {
        const { selectedCatalogNode } = yield select(state => state.mails);
        yield call(delMailCatalog, selectedCatalogNode.recid);
        message.success('删除成功');
        yield put({ type: 'reloadCatalogTree' });
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
        yield put({ type: 'reloadCatalogTree' });
      } catch (e) {
        message.error(e.message || '操作失败');
      }
    },
    *delMails({ payload: { mails, completely } }, { select, call, put }) {
      try {
        const params = {
          IsTruncate: completely || false,
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

      // 标记已读
      try {
        yield call(markMails, { mailids: mail.mailid, mark: 3 });
        const { mailList } = yield select(state => state.mails);
        mail.isread = 1;
        yield put({
          type: 'putState',
          payload: {
            mailList: [...mailList]
          }
        });
      } catch (e) {
        console.error('标记已读失败', e);
      }

      // 查看详情，相关信息等
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
    },
    *sendemail({ payload: submitData }, { call, put }) {
      try {
        yield call(sendemail, submitData);
        yield put({
          type: 'putState',
          payload: { showingModals: 'sendMailSuccess', editEmailPageFormModel: null, editEmailPageBtn: null, editEmailFormData: null }
        });
      } catch (e) {
        message.error(e.message || '发送邮件失败');
      }
    },
    *distributeMails({ payload: { users, depts } }, { select, call, put }) {
      const { mailSelected } = yield select(state => state.mails);
      try {
        const params = {
          mailids: mailSelected.map(i => i.mailid),
          deptids: depts,
          TransferUserIds: users
        };
        yield call(distributeMails, params);
        message.success('内部分发成功');
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        message.error(e.message || '内部分发失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *transferCatalog({ payload: userId }, { select, call, put }) {
      const { selectedCatalogNode } = yield select(state => state.mails);
      try {
        const params = {
          newuserid: userId,
          recid: selectedCatalogNode.recid
        };
        yield call(transferMailCatalog, params);
        message.success('转移成功');
        yield put({ type: 'showModals', payload: '' });
      } catch (e) {
        message.error(e.message || '转移失败');
        yield put({ type: 'modalPending', payload: false });
      }
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
        /* 邮件目录 */
        openedCatalog: 'my', // my/dept/user
        selectedCatalogNode: null,
        catSearchKey: { my: '', dept: '', user: '' },
        myCatalogData: [],
        deptCatalogData: [],
        userCatalogData: [],

        /* 邮件列表 */
        mailPageIndex: 1,
        mailPageSize: 10,
        mailSearchKey: '',
        mailList: [],
        mailTotal: 0,
        mailSelected: [],
        mailCurrent: null,
        mailDetailData: null,

        /* 写邮件 */
        mailContacts: [],
        mailBoxList: [],
        recentContact: [],
        customerContact: [],
        innerContact: [],
        editEmailFormData: null,
        focusTargetName: '',
        showingModals: '',
        modalPending: false,
        editEmailPageFormModel: null,
        editEmailPageBtn: null
      };
    }
  }
};
