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
  transferMailCatalog,
  recoverMails
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
    showingPanel: '',
    modalMailsData: [],
    modalPending: false,
    editEmailPageFormModel: null,
    editEmailPageBtn: null,
    currentMailId: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mails') {
          dispatch({ type: 'init' });
          dispatch({ type: 'app/putState', payload: { noMinWidth: true } });
        } else {
          dispatch({ type: 'resetState' });
          dispatch({ type: 'app/putState', payload: { noMinWidth: false } });
        }
      });
    }
  },
  effects: {
    *init(action, { put }) {
      yield put({ type: 'app/toggleSider', payload: true });
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
        const { catSearchKey, selectedCatalogNode } = yield select(state => state.mails);
        const params = {
          catalogname: catSearchKey.my || ''
        };
        if (catSearchKey.my) {
          params.catalogtype = 1001;
        }
        const { data } = yield call(queryMailCatalog, params);
        yield put({ type: 'putState', payload: { myCatalogData: data } });
        if (!catSearchKey.my) {
          yield put({ type: 'putState', payload: { myCatalogDataAll: data } });
        }

        // 初始化，默认选中目录
        if (isInit) {
          const defaultCat = getDefaultCatalog(data);
          defaultCat.catalogtype = 'my';
          yield put({
            type: 'putState',
            payload: {
              selectedCatalogNode: defaultCat
            }
          });
          yield put({ type: 'queryMailList' });
        } else if (selectedCatalogNode && selectedCatalogNode.catalogtype === 'my') {
          // 更新选中节点数据
          const stack = _.clone(data);
          let match = null;
          let top = null;
          while (stack.length) {
            top = stack[stack.length - 1];
            stack.pop();
            if (top.recid === selectedCatalogNode.recid) {
              match = top;
              break;
            }
            (top.subcatalogs || []).forEach(node => { stack.unshift(node); });
          }
          if (match) {
            yield put({ type: 'putState', payload: { selectedCatalogNode: match } });
          }
        }
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *updateMyCatalogData(action, { select, call, put }) {
      try {
        const { data } = yield call(queryMailCatalog, { catalogname: '' });
        yield put({ type: 'putState', payload: { myCatalogDataAll: data } });
      } catch (e) {
        console.error('更新我的邮件目录失败', e);
        // message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *queryDeptCatalogTree(action, { select, call, put }) {
      try {
        const { catSearchKey } = yield select(state => state.mails);
        const { data } = yield call(queryDeptMailCatalog, { treeid: '', keyword: catSearchKey.dept });
        yield put({ type: 'putState', payload: { deptCatalogData: data } });
        // yield put({ type: 'catalogTreeUpdated', payload: 'dept' });
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *queryUserCatalog(action, { select, call, put }) {
      try {
        const { catSearchKey } = yield select(state => state.mails);
        const { data } = yield call(queryHistoryUsers, catSearchKey.user);
        yield put({ type: 'putState', payload: { userCatalogData: data } });
        // yield put({ type: 'catalogTreeUpdated', payload: 'user' });
      } catch (e) {
        message.error(e.message || '获取邮件目录数据失败');
      }
    },
    *reloadCatalogTree({ payload: resetSelected }, { select, put }) {
      const { openedCatalog } = yield select(state => state.mails);
      yield put({
        type: openedCatalog === 'my'
          ? 'queryMyCatalogTree'
          : openedCatalog === 'dept' ? 'queryDeptCatalogTree' : 'queryUserCatalog',
        payload: resetSelected
      });
    },
    // *catalogTreeUpdated({ payload: catType }, { select, put }) {
    //   const {
    //     selectedCatalogNode: selected,
    //     myCatalogData,
    //     deptCatalogData,
    //     userCatalogData
    //   } = yield select(state => state.mails);
    //
    //   // 更新选中节点数据
    //   if (selected) return;
    //   if (selected.catalogtype !== catType) return;
    //   const { recid, subcatalogs } = selected;
    //   const stack = [];
    //   if (catType === 'my') {
    //     stack.push(myCatalogData);
    //   } else if (catType === 'dept') {
    //     stack.push(deptCatalogData);
    //   } else if (catType === 'user') {
    //     stack.push(userCatalogData);
    //   }
    // },
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
        const { mailPageIndex, mailPageSize, mailSearchKey, mailDetailData, selectedCatalogNode } = yield select(state => state.mails);
        let result;
        if (selectedCatalogNode.recid) {
          // 收件箱邮件
          const params = {
            pageIndex: mailPageIndex,
            pageSize: mailPageSize,
            searchKey: mailSearchKey,
            catalog: selectedCatalogNode.recid,
            fetchuserid: selectedCatalogNode.viewuserid
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
        const mailList = result.data.datalist.map(item => ({
          ...item,
          catalogtype: selectedCatalogNode.catalogtype,
          ctype: selectedCatalogNode.ctype
        }));
        yield put({
          type: 'putState',
          payload: {
            mailList,
            mailTotal: result.data.pageinfo.totalcount,
            mailSelected: []
          }
        });
        if (mailList.every(item => (mailDetailData && mailDetailData.mailId) !== item.mailid)) {
          yield put({
            type: 'putState',
            payload: {
              mailDetailData: null,
              mailCurrent: null,
              showingPanel: ''
            }
          });
        }
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
        payload: {
          selectedCatalogNode: catalogNode,
          mailPageIndex: 1
        }
      });
      yield put({ type: 'queryMailList' });
      if (catalogType === 'my') {
        // yield put({ type: 'updateMyCatalogData' });
        yield put({ type: 'reloadCatalogTree' });
      }
    },
    *saveCatalog({ payload: data }, { call, put }) {
      const isEdit = !!data.recid;
      try {
        let fn;
        let params;
        if (isEdit) {
          fn = updateMailCatalog;
          params = _.pick(data, ['recid', 'recname']);
          params.newpid = data.pid;
        } else {
          fn = saveMailCatalog;
          params = _.pick(data, ['pid', 'recname']);
        }
        yield put({ type: 'modalPending', payload: true });
        yield call(fn, params);
        message.success(isEdit ? '编辑成功' : '新增成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'reloadCatalogTree' });
        yield put({ type: 'updateMyCatalogData' });
      } catch (e) {
        message.error(e.message || (isEdit ? '编辑失败' : '编辑成功'));
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *delCatalog({ payload: catalogId }, { select, call, put }) {
      try {
        const { selectedCatalogNode } = yield select(state => state.mails);
        yield call(delMailCatalog, selectedCatalogNode.recid);
        message.success('删除成功');
        yield put({ type: 'reloadCatalogTree', payload: true });
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
        yield put({ type: 'reloadCatalogTree' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *moveMails({ payload: { mails, catalogId } }, { select, call, put }) {
      const { myCatalogDataAll } = yield select(state => state.mails);
      let catObj = {};
      treeForEach(myCatalogDataAll, node => {
        if (node.recid === catalogId) catObj = node;
      }, 'subcatalogs');
      if (catObj.subcatalogs && catObj.subcatalogs.length) {
        return message.error('只能移动到子文件夹');
      }
      try {
        const params = {
          mailids: mails.map(item => item.mailid).join(','),
          catalogId
        };
        yield call(moveMails, params);
        message.success('移动成功');
        yield put({ type: 'queryMailList' });
        yield put({ type: 'reloadCatalogTree' });
      } catch (e) {
        message.error(e.message || '移动失败');
      }
    },
    *markMails({ payload: { mails, mark } }, { select, call, put }) {
      // 0取消星标 1星标 2设置未读 3设置已读
      const actionNames = {
        0: '取消星标',
        1: '标星',
        2: '标记为未读',
        3: '标记为已读'
      };
      const actionName = actionNames[mark] || '标记';
      try {
        const params = {
          mailids: mails.map(item => item.mailid).join(','),
          mark
        };
        yield call(markMails, params);
        message.success(`${actionName}成功`);
        yield put({ type: 'queryMailList' });
        yield put({ type: 'reloadCatalogTree' });

        const { mailDetailData } = yield select(state => state.mails);
        if ((mark === 0 || mark === 1) && mails.some(item => (mailDetailData && mailDetailData.mailId) === item.mailid)) {
          yield put({
            type: 'putState',
            payload: {
              mailDetailData: {
                ...mailDetailData,
                mailInfo: {
                  ...mailDetailData.mailInfo,
                  istag: mark
                },
                maildetail: mailDetailData.maildetail ? {
                  ...mailDetailData.maildetail,
                  istag: mark
                } : undefined
              }
            }
          });
        }
      } catch (e) {
        message.error(e.message || `${actionName}失败`);
      }
    },
    *tagMailsInDetail__({ payload: tag }, { select, call, put }) {
      try {
        const { mailDetailData, openedCatalog, mailList } = yield select(state => state.mails);
        const params = {
          mailids: mailDetailData.mailId,
          mark: tag
        };
        yield call(markMails, params);

        // 更新数据
        const newMailDetailData = {
          ...mailDetailData,
          mailInfo: { ...mailDetailData.mailInfo, istag: tag }
        };
        if (newMailDetailData.maildetail) {
          newMailDetailData.maildetail = { ...mailDetailData.maildetail, istag: tag };
        }
        yield put({
          type: 'putState',
          payload: {
            mailDetailData: newMailDetailData,
            mailList: mailList.map(mail => mail.mailid === mailDetailData.mailId ? { ...mail, istag: tag } : mail)
          }
        });

        if (openedCatalog === 'my') {
          yield put({ type: 'reloadCatalogTree' });
        }
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
      if (mail.catalogtype !== 'dept' && !mail.isread) {
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
          yield put({ type: 'reloadCatalogTree' });
        } catch (e) {
          console.error('标记已读失败', e);
        }
      }

      // 查看详情，相关信息等
      try {
        const { data } = yield call(queryMailDetail, mail.mailid);
        const { mailDetailData: { mailId } } = yield select(state => state.mails);
        if (mailId !== mail.mailid) return;
        data.maildetail.catalogtype = mail.catalogtype;
        data.maildetail.ctype = mail.ctype;
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
          showingPanel: 'mailDetail'
        }
      });
    },
    *sendemail({ payload: submitData }, { call, put }) {
      try {
        yield call(sendemail, submitData);
        yield put({
          type: 'putState',
          payload: { showingPanel: 'sendMailSuccess', editEmailPageFormModel: null, editEmailPageBtn: null, editEmailFormData: null }
        });
        yield put({ type: 'reloadCatalogTree' });
        yield put({ type: 'queryMailList' });
      } catch (e) {
        message.error(e.message || '发送邮件失败');
      }
    },
    *distributeMails({ payload: { users, depts } }, { select, call, put }) {
      const { modalMailsData } = yield select(state => state.mails);
      try {
        const params = {
          mailids: modalMailsData.map(i => i.mailid),
          deptids: depts,
          TransferUserIds: users
        };
        yield put({ type: 'modalPending', payload: true });
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
          recid: selectedCatalogNode.recid,
          ownUserId: selectedCatalogNode.viewuserid
        };
        // if (selectedCatalogNode.catalogtype === 'dept') {
        //   params.ownUserId = selectedCatalogNode.viewuserid;
        // }
        yield put({ type: 'modalPending', payload: true });
        yield call(transferMailCatalog, params);
        message.success('转移成功');
        yield put({ type: 'showModals', payload: '' });
        yield put({ type: 'reloadCatalogTree', payload: true });
      } catch (e) {
        message.error(e.message || '转移失败');
        yield put({ type: 'modalPending', payload: false });
      }
    },
    *recoverMails({ payload: mails }, { select, call, put }) {
      try {
        const params = {
          mailids: mails.map(item => item.mailid).join(',')
        };
        const { data } = yield call(recoverMails, params);
        message.success(data.tipmsg || '恢复成功');
        yield put({ type: 'queryMailList' });
        yield put({ type: 'reloadCatalogTree' });
      } catch (e) {
        message.error(e.message || '恢复失败');
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
        showingPanel: '',
        modalPending: false,
        modalMailsData: [],
        editEmailPageFormModel: null,
        editEmailPageBtn: null,
        currentMailId: ''
      };
    }
  }
};
