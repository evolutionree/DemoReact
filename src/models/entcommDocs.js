import { message } from 'antd';
import _ from 'lodash';
import { queryFolderList, queryDocumentList, delFolder, addDocument, delDocument, updateDocumentDownloadCount } from '../services/document';

const modelSelector = state => state.entcommDocs;

function getRootFolder(folders) {
  if (!folders || !folders.length) return '';
  const root = _.find(folders, ['nodepath', 0]);
  return root ? root.folderid : folders[0].folderid;
}

export default {
  namespace: 'entcommDocs',
  state: {
    docTypes: [],
    currentDocType: '',
    list: [],
    currentItems: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/docs/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          dispatch({ type: 'putState', payload: { entityId, recordId } });
          dispatch({ type: 'init' });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put }) {
      yield put({ type: 'fetchDocTypes' });
      yield put({ type: 'fetchList' });
    },
    *fetchDocTypes(action, { select, call, put }) {
      const { entityId } = yield select(modelSelector);
      try {
        const params = {
          documenttype: 0,
          entityid: entityId
        };
        const { data } = yield call(queryFolderList, params);
        const docTypes = data.map(item => ({ label: item.foldername, value: item.folderid }));
        yield put({
          type: 'putState',
          payload: {
            docTypes,
            currentDocType: getRootFolder(data)
          }
        });
      } catch (e) {
        message.error(e.message || '获取文档分类失败');
      }
    },
    *fetchList(action, { select, call, put }) {
      const { entityId, recordId, currentDocType } = yield select(modelSelector);
      try {
        const params = {
          documenttype: 0,
          entityid: entityId,
          businessid: recordId,
          folderid: currentDocType === '-1' ? '' : currentDocType,
          datacategory: 1,
          pageindex: 1,
          pagesize: 9999
        };
        const { data: { pagedata: list } } = yield call(queryDocumentList, params);
        yield put({
          type: 'putState',
          payload: {
            list,
            currentItems: []
          }
        });
      } catch (e) {
        message.error(e.message || '获取文档分类失败');
      }
    },
    *addDoc({ payload: { fileId, fileName, fileSize } }, { select, call, put }) {
      try {
        const { currentDocType, entityId, recordId } = yield select(modelSelector);
        const params = {
          documenttype: 0,
          entityid: entityId,
          businessid: recordId,
          folderid: currentDocType,
          fileid: fileId,
          filename: fileName,
          filelength: fileSize
        };
        yield call(addDocument, params);
        message.success('上传成功');
        yield put({ type: 'fetchList' });
      } catch (e) {
        message.error(e.message || '上传失败');
      }
    },
    *download(action, { select, call, put }) {
      const { currentItems } = yield select(modelSelector);
      window.open(`/api/fileservice/download?fileid=${currentItems[0].fileid}`);
      yield call(updateDocumentDownloadCount, currentItems[0].documentid);
      yield put({ type: 'fetchList' });
    },
    *delDoc(action, { select, call, put }) {
      try {
        const { currentItems } = yield select(modelSelector);
        yield call(delDocument, currentItems[0].documentid);
        message.success('删除成功');
        yield put({ type: 'fetchList' });
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
    resetState() {
      return {
        docTypes: [],
        currentDocType: '',
        list: [],
        currentItems: []
      };
    }
  }
};
