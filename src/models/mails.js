import { message } from 'antd';
import * as _ from 'lodash';
import { routerRedux } from 'dva/router';
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
  recoverMails,
  validMailPwd,
  initMailCol
} from '../services/mails';
import { treeForEach } from '../utils';
import TabModel from '../routes/Mails/model/TabModel';

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
    currentBoxId: '',
    syncMailsLoading: false,

    /* 邮件列表 */
    mailPageIndex: 1,
    mailPageSize: 10,
    mailSearchKey: '',
    mailList: [],
    mailTotal: 0,
    mailSelected: [],
    mailCurrent: null,
    mailDetailData: null,
    selectDept_userMailAddr: '', //当前选择下属员工对应的邮箱， 查询邮件列表

    /* 写邮件 */
    mailContacts: [],
    mailBoxList: [],
    recentContact: [],
    customerContact: [],
    innerContact: [],
    focusTargetName: '',
    showingModals: '',
    showingPanel: '',
    modalMailsData: [],
    modalPending: false,
    mailTabs: [new TabModel(1, '邮件', true)]
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/mails') {
          if (location.query.mailid) {
            dispatch({ type: 'init' });
            dispatch({ type: 'initWithPanel' });
          } else {
            dispatch({ type: 'init' });
          }
          dispatch({ type: 'app/putState', payload: { noMinWidth: true } });
        } else {
          dispatch({ type: 'resetState' });
          dispatch({ type: 'app/putState', payload: { noMinWidth: false } });
        }
      });
    }
  },
  effects: {
    *init(action, { put, call }) {
      yield put({ type: 'app/toggleSider', payload: true });
      yield put({ type: 'syncMails__' });
      yield put({ type: 'fetchMailContacts' });
      yield put({ type: 'fetchMailboxlist' }); //取第一个邮箱获取queryMyCatalogTree
      yield put({ type: 'fetchRecentcontact' }); //获取最近联系人
      yield put({ type: 'fetchCustomerContact' });
      yield put({ type: 'fetchInnerContact' }); //获取企业内部通讯录
      yield put({ type: 'fetchSignature' }); //获取签名
    },
    *initWithPanel(action, { select, put, call }) {
      const { query } = yield select(state => state.routing.locationBeforeTransitions);
      const mail = {
        mailid: query.mailid,
        ctype: +query.ctype, // 4001 客户邮件跳转进来
        catalogtype: query.catalogtype, // my/dept
        isread: +query.isread,
        title: query.title
      };

      yield put({ type: 'mailPreview__', payload: mail });
      yield put({ type: 'showMailDetail', payload: mail });
    },
    *syncMails__(action, { call, put }) {
      try {
        yield call(validMailPwd);
        yield put({ type: 'reloadSyncMails__' });
      } catch (e) {
        message.error(e.message);
      }
    },
    *reloadSyncMails__(action, { select, call, put }) {
      const { syncMailsLoading } = yield select(state => state.mails);
      if (syncMailsLoading) {
        return;
      }
      try {
        yield put({ type: 'putState', payload: { syncMailsLoading: true }});
        yield call(syncMails);
        yield put({ type: 'putState', payload: { syncMailsLoading: false }});
      } catch (e) {
        yield put({ type: 'putState', payload: { syncMailsLoading: false }});
        console.error('syncmails failed..');
      }
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
        if (mailBoxList instanceof Array && mailBoxList.length > 0) {
          yield put({ type: 'putState', payload: { currentBoxId: mailBoxList[0].recid } });
          yield put({ type: 'queryMyCatalogTree', payload: true });
        } else {
          message.info('当前用户没有查询到可用邮箱');
        }
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
        const { catSearchKey, selectedCatalogNode, currentBoxId } = yield select(state => state.mails);
        const params = {
          catalogname: catSearchKey.my || '',
          BoxId: currentBoxId
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
        const { currentBoxId } = yield select(state => state.mails);
        const { data } = yield call(queryMailCatalog, { catalogname: '', BoxId: currentBoxId });
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
    *reloadCatalogTree({ payload: resetSelected }, { select, call, put }) {
      const { openedCatalog } = yield select(state => state.mails);

      yield put({
        type: openedCatalog === 'my'
          ? 'queryMyCatalogTree'
          : openedCatalog === 'dept' ? 'queryDeptCatalogTree' : 'queryUserCatalog',
        payload: resetSelected
      });
    },
    *changeBoxId({ payload: newBoxId }, { select, put }) { //切换用户邮箱
      yield put({ type: 'putState', payload: { currentBoxId: newBoxId } });
      yield put({ type: 'updateMailTabs', payload: { mailTabs: [new TabModel(1, '邮件', true)] } }); //初始化Tab页签
      yield put({ type: 'queryMyCatalogTree', payload: true });
      yield put({ type: 'queryMailList' });
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
        const { mailPageIndex, mailPageSize, mailSearchKey, mailDetailData, selectedCatalogNode, showingPanel, mailBoxList, currentBoxId, selectDept_userMailAddr } = yield select(state => state.mails);
        let mailAddress = '';
        if (selectDept_userMailAddr) { //下属员工的邮箱id
          mailAddress = selectDept_userMailAddr;
        } else {
          for (let i = 0; i < mailBoxList.length; i++) {
            if (mailBoxList[i].recid === currentBoxId) {
              mailAddress = mailBoxList[i].accountid; break;
            }
          }
        }

        let result;
        if (selectedCatalogNode.recid) {
          // 收件箱邮件
          const params = {
            pageIndex: mailPageIndex,
            pageSize: mailPageSize,
            searchKey: mailSearchKey,
            catalog: selectedCatalogNode.recid,
            fetchuserid: selectedCatalogNode.viewuserid,
            Ctype: selectedCatalogNode.ctype,
            mailAddress: mailAddress
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
        if (mailList.every(item => (mailDetailData && mailDetailData.mailId) !== item.mailid) && !showingPanel) {
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
      console.log(catalogNode)
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
      if (catalogType === 'dept') {
        yield put({ type: 'putState', payload: { selectDept_userMailAddr: catalogNode.mailaddr } });
        yield put({ type: 'queryMailList' });
      } else {
        yield put({ type: 'putState', payload: { selectDept_userMailAddr: '' } });
        yield put({ type: 'queryMailList' });
      }
      if (catalogType === 'my') {
        // yield put({ type: 'updateMyCatalogData' });
        yield put({ type: 'reloadCatalogTree' });
      }
      yield put({ type: 'toogleMailTab' });
    },
    *saveCatalog({ payload: data }, { call, put, select }) {
      const { currentBoxId } = yield select(state => state.mails);
      const isEdit = !!data.recid;
      try {
        let fn;
        let params;
        if (isEdit) {
          fn = updateMailCatalog;
          params = _.pick(data, ['recid', 'recname']);
          params.newpid = data.pid;
          params.boxid = currentBoxId;
        } else {
          fn = saveMailCatalog;
          params = _.pick(data, ['pid', 'recname']);
          params.boxid = currentBoxId;
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
        yield put({
          type: 'closeTab',
          payload: null
        });
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
    *reloadMailDetail(action, { select, call, put }) {
      const { mailDetailData } = yield select(state => state.mails);
      debugger
      if (mailDetailData && mailDetailData.status === 'loaded') {
        const { mailInfo: mail } = mailDetailData;
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
      }
    },
    *showMailDetail({ payload: mail }, { select, call, put }) {
      yield put({ type: 'openNewTab', payload: { showingPanel: 'mailDetail', tabType: 3, mailId: mail.mailid, mailInfo: mail } });
    },
    *sendemail({ payload: submitData }, { call, put }) {
      try {
        yield call(sendemail, submitData);
        message.success('发送成功');
        yield put({
          type: 'closeTab',
          payload: 1
        });
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
    },
    *initMailCol(action, { call, put }) {
      try {
        yield call(initMailCol);
        yield put({ type: 'reloadCatalogTree' });
        yield put({ type: 'queryMailList' });
      } catch (e) {
        message.error(e.message);
      }
    },
    *closeTab({ payload: reloadType }, { select, call, put }) { //关闭当前Tab
      const { mailTabs } = yield select(state => state.mails);
      let newMailTabs = mailTabs.filter((item) => {
        return !item.active;
      })
      yield put({ type: 'toogleMailTab' });
      if (/mailid/.test(location.href)) {
        yield put(routerRedux.replace({
          pathname: 'mails'
        }));
      } else if (reloadType === 1) {
        yield put({ type: 'reloadCatalogTree' });
        yield put({ type: 'queryMailList' });
      }
      yield put({ type: 'updateMailTabs', payload: { showingPanel: '', mailTabs: newMailTabs } });
    },
    *openNewTab({ payload: { tabType, showingPanel: editMailType, mailId, mailInfo, modalMailsData } }, { select, call, put }) {
      const { mailTabs } = yield select(state => state.mails);
      let title = mailInfo ? mailInfo.title : '';
      if (tabType === 2 && mailId && modalMailsData instanceof Array && modalMailsData.length > 0) { // 1：邮件主页 2：写邮件页 3：邮件详情页
        title = modalMailsData[0].title ? modalMailsData[0].title : '无主题';
      } else if (tabType === 2) {
        title = '写邮件';
      }

      if (editMailType === 'replay' || editMailType === 'replay-attach' || editMailType === 'reply-all' || editMailType === 'replay-all-attach') {
        title = 'Re：' + title;
      } else if (editMailType === 'send' || editMailType === 'send-attach') {
        title = 'Fw：' + title;
      }

      const newMailTabs = mailTabs.map(item => {
        item.active = false;
        return item;
      });

      let toggleTabUUID = '';
      for (let i = 0; i < newMailTabs.length; i++) {
        if (newMailTabs[i].tabType === tabType && mailId && newMailTabs[i].mailId === mailId && newMailTabs[i].editMailType === editMailType) {
          // 不打开新的Tab 将当前将要打开的Tab切换为Active状态
          toggleTabUUID = newMailTabs[i].uuid;
          break;
        }
      }

      if (!toggleTabUUID) {
        const newTabs = [
          ...newMailTabs,
          new TabModel(tabType, title, true, mailId, editMailType, mailInfo)
        ];
        yield put({ type: 'updateMailTabs', payload: { mailTabs: newTabs } });
      } else {
        const mailTabs = newMailTabs.map(item => {
          item.uuid === toggleTabUUID ? item.active = true : item
          return item;
        });
        yield put({ type: 'updateMailTabs', payload: { mailTabs } });
      }
    },
    *toogleMailTab({ payload: reloadType }, { select, call, put }) { //切换到 邮件Tab
      const { mailTabs } = yield select(state => state.mails);
      const newMailTabs = mailTabs.map(item => {
        item.active = false;
        if (item.tabType === 1) {
          item.active = true;
        }
        return item;
      });
      yield put({ type: 'updateMailTabs', payload: { mailTabs: newMailTabs } });
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
    updateMailTabs(state, { payload }) {
      // const { mailTabs } = payload;
      // if (mailTabs instanceof Array && mailTabs.length > 0) {
      //   const activeTab = mailTabs.filter(item => {
      //     return item.active; //实时记录当前选中的Tab，用户刷新页面时，需要渲染出来
      //   })
      //   if(activeTab.length > 0 && activeTab[0].tabType === 1) { //当前Tab active 在邮件，则不记录
      //     sessionStorage.removeItem('mailActiveTabInfo');
      //   } else {
      //     sessionStorage.setItem('mailActiveTabInfo', JSON.stringify(activeTab[0]));
      //   }
      // }
      return { ...state, ...payload };
    },
    resetState() {
      //sessionStorage.removeItem('mailActiveTabInfo');
      return {
        /* 邮件目录 */
        openedCatalog: 'my', // my/dept/user
        selectedCatalogNode: null,
        catSearchKey: { my: '', dept: '', user: '' },
        myCatalogData: [],
        deptCatalogData: [],
        userCatalogData: [],
        currentBoxId: '',

        /* 邮件列表 */
        mailPageIndex: 1,
        mailPageSize: 10,
        mailSearchKey: '',
        mailList: [],
        mailTotal: 0,
        mailSelected: [],
        mailCurrent: null,
        mailDetailData: null,
        selectDept_userMailAddr: '', //当前选择下属员工对应的邮箱， 查询邮件列表

        /* 写邮件 */
        mailContacts: [],
        mailBoxList: [],
        recentContact: [],
        customerContact: [],
        innerContact: [],
        focusTargetName: '',
        showingModals: '',
        showingPanel: '',
        modalPending: false,
        modalMailsData: [],
        mailTabs: [new TabModel(1, '邮件', true)]
      };
    }
  }
};
