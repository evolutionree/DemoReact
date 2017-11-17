import { routerRedux } from 'dva/router';
import { message } from 'antd';
import _ from 'lodash';
import { queryDocumentList, addDocument, delFolder, queryFolderList, addFolder, updateFolder, delDocument, updateDocumentDownloadCount } from '../services/document';

function getRootFolderId(folder) {
  const rootFolder = _.find(folder, ['nodepath', 0]);
  return rootFolder && rootFolder.folderid;
}

export default {
  namespace: 'knowledge',
  state: {
    folder: [],
    queries: {},
    list: [],
    total: null,
    currentItems: [],
    showModals: '',
    modalPending: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        if (location.pathname === '/knowledge') {
          dispatch({ type: 'queryList' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *search({ payload }, { select, call, put }) {
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
    *queryList(action, { select, put, call }) {
      let { folder } = yield select(state => state.knowledge);
      if (!folder.length) {
        try {
          const result = yield call(queryFolderList, { documenttype: 1 });
          folder = result.data;
          yield put({ type: 'putState', payload: { folder } });
        } catch (e) {
          message.error(e.message || '获取目录失败');
          return;
        }
      }

      const { query } = yield select(state => state.routing.locationBeforeTransitions);
      const params = {
        folderId: getRootFolderId(folder),
        pageIndex: 1,
        pageSize: 10,
        searchName: '',
        ...query,
        documenttype: 1,
        datacategory: 0
      };
      yield put({ type: 'putState', payload: { queries: params } });
      try {
        const { data } = yield call(queryDocumentList, params);
        yield put({
          type: 'putState',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total,
            currentItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取文档列表失败');
      }
    },
    *queryFolder(action, { put, call }) {
      try {
        const { data: folder } = yield call(queryFolderList, { documenttype: 1 });
        yield put({ type: 'putState', payload: { folder } });
      } catch (e) {
        message.error(e.message || '获取目录失败');
      }
    },
    *saveFolder({ payload: formData }, { select, put, call }) {
      yield put({ type: 'modalPending', payload: true });
      try {
        const {
          showModals,
          queries: { folderId }
        } = yield select(state => state.knowledge);
        const isEdit = /editFolder/.test(showModals);

        const { folderName, permissionids, isallvisible } = formData;
        if (isEdit) {
          yield call(updateFolder, {
            folderName,
            folderId,
            permissionids,
            isallvisible: isallvisible ? 1 : 0
          });
        } else {
          yield call(addFolder, {
            documenttype: 1,
            folderName,
            pfolderid: folderId,
            permissionids,
            isallvisible: isallvisible ? 1 : 0
          });
        }

        yield put({ type: 'showModals', payload: '' });
        message.success('保存成功');
        yield put({ type: 'queryFolder' });
      } catch (e) {
        yield put({ type: 'modalPending' });
        message.error(e.message || '保存失败');
      }
    },
    *addFile({ payload }, { select, put, call }) {
      try {
        const { queries: { folderId } } = yield select(state => state.knowledge);
        const params = {
          documenttype: 1,
          folderid: folderId,
          fileid: payload.fileId,
          filename: payload.fileName,
          filelength: payload.fileSize
        };
        yield call(addDocument, params);
        message.success('上传成功');
        yield put({ type: 'search' });
      } catch (e) {
        message.error(e.message || '上传失败');
      }
    },
    *delFiles(action, { select, put, call }) {
      try {
        const { currentItems } = yield select(state => state.knowledge);
        yield call(delDocument, currentItems.map(item => item.documentid).join(','));
        message.success('删除成功');
        yield put({ type: 'queryList' });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    },
    *onDownload({ payload: documentId }, { select, put, call }) {
      yield call(updateDocumentDownloadCount, documentId);
      yield put({ type: 'queryList' });
    },
    *delFolder(action, { select, put, call }) {
      try {
        const {
                queries: { folderId },
                folder
              } = yield select(state => state.knowledge);
        yield call(delFolder, folderId);
        message.success('删除成功');
        yield put({ type: 'queryFolder' });
        yield put({ type: 'search', payload: { folderId: getRootFolderId(folder) } });
      } catch (e) {
        message.error(e.message || '删除失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    showModals(state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      };
    },
    modalPending(state, { payload: modalPending }) {
      return {
        ...state,
        modalPending: modalPending || false
      };
    },
    resetState() {
      return {
        folder: [],
        queries: {},
        list: [],
        total: null,
        currentItems: [],
        showModals: '',
        modalPending: false
      };
    }
  }
};
